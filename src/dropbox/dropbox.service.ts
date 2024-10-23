// src/dropbox/dropbox.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qs from 'qs';
import { TokensService } from '../tokens/tokens.service';
import { Token, TokenDocument } from '../tokens/schemas/token.schema';
import { Dropbox, files } from 'dropbox';

@Injectable()
export class DropboxService {
  //private readonly APP_KEY: string;
  //private readonly APP_SECRET: string;
  private readonly REDIRECT_URI: string;
  private readonly TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
  private readonly AUTH_URL = 'https://www.dropbox.com/oauth2/authorize';
  private dbx: Dropbox;
  
  constructor(
    private configService: ConfigService,
    private tokensService: TokensService,
  ) {
    //this.APP_KEY = this.configService.get<string>('DROPBOX_APP_KEY');
    //this.APP_SECRET = this.configService.get<string>('DROPBOX_APP_SECRET');
	
    this.REDIRECT_URI = this.configService.get<string>('DROPBOX_REDIRECT_URI');
	
	this.initializeDropboxClient();
  }
  
  /*private async initializeDropboxClient() {
    const accessToken = await this.getValidAccessToken();
    this.dbx = new Dropbox({ accessToken });
  }*/
  
  private async initializeDropboxClient(): Promise<void> {
    const { AppKey, AppSecret } = await this.getAppCredentialsFromDB();
    const accessToken = await this.getValidAccessToken();
    //this.dbx = new Dropbox({ accessToken, clientId: AppKey, clientSecret: AppSecret });
	
	const auth = new DropboxAuth({
      clientId: AppKey,
      clientSecret: AppSecret,
      accessToken,
    });

    const customFetch = (url: string, init: RequestInit) => {
      const headers = new Headers(init.headers);
      headers.append('Dropbox-API-Select-User', 'dbmid:AAC3dvf3TQhKm8zYonwbDPExufeY8VXCe2s');

      return fetch(url, { ...init, headers });
    };

    this.dbx = new Dropbox({ auth, fetch: customFetch });
	
  }

  private async getAppCredentialsFromDB(): Promise<{ AppKey: string; AppSecret: string }> {
    const token: TokenDocument = await this.tokensService.findOne();
    if (!token?.AppKey || !token?.AppSecret) {
      throw new HttpException(
        'Dropbox credentials not found. Please store the credentials.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { AppKey: token.AppKey, AppSecret: token.AppSecret };
  }
  
  async listFolders2(path: string = ''): Promise<any> {
    try {
      const response = await this.dbx.filesListFolder({ path });
      return response;//.result;
    } catch (error) {
		
		await this.refreshAccessToken();
        
        await this.initializeDropboxClient();
        // Retry the operation
        const retryResponse = await this.dbx.filesListFolder({ path });
        return retryResponse;
		
      //throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
	async listFolders(path: string = ''): Promise<any> {
	  try {

		const initialResponse = await this.dbx.filesListFolder({ path });
		let entries = initialResponse.result.entries;
		let hasMore = initialResponse.result.has_more;
		let cursor = initialResponse.result.cursor;

		while (hasMore) {
		  const response = await this.dbx.filesListFolderContinue({ cursor });
		  entries.push(...response.result.entries);
		  hasMore = response.result.has_more;
		  cursor = response.result.cursor;
		}

		return { ...initialResponse, result: { ...initialResponse.result, entries } };
	  } catch (error) {
		
		await this.refreshAccessToken();
		await this.initializeDropboxClient();
		return this.listFolders(path);
	  }
	}
	
	async getTeamMembers(): Promise<any[]> {
	  try {
		const response = await this.dbx.teamMembersList({ limit: 100 });
		const members = response.result.members;

		return members.map(member => ({
		  email: member.profile.email,
		  name: member.profile.name.display_name,
		  team_member_id: member.profile.team_member_id,
		}));
	  } catch (error) {
		console.error('Error fetching team members:', error);
		throw new HttpException(
		  `Error fetching team members: ${error.message}`,
		  HttpStatus.BAD_REQUEST,
		);
	  }
	}
  
  async getSubfolderContent(folderPath: string = ''): Promise<{ folders: any[]; files: any[] }> {
    try {
      const response = await this.dbx.filesListFolder({ path: folderPath });

      const folders = response.result.entries.filter((item) => item['.tag'] === 'folder');
      const files = response.result.entries.filter((item) => item['.tag'] === 'file');

      return { folders, files };
    } catch (error) {
      throw new HttpException(
        `Error retrieving subfolder content: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFilesFromFolder(folderPath: string = ''): Promise<any[]> {
    try {
      const response = await this.dbx.filesListFolder({ path: folderPath });

      const files = response.result.entries.filter((file) => file['.tag'] === 'file');

      return files;
    } catch (error) {
      throw new HttpException(
        `Error retrieving files: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getThumbnail(imgPath: string): Promise<files.FileMetadata> {
    try {
		
		const { AppKey, AppSecret } = await this.getAppCredentialsFromDB();
		const accessToken = await this.getValidAccessToken();

		// Initialize the Dropbox client within the function
		const dbx = new Dropbox({ accessToken, clientId: AppKey, clientSecret: AppSecret });
		
      const imagePath = `/${imgPath}`;
      const response = await dbx.filesGetThumbnail({
        path: imagePath,
        format: { '.tag': 'png' },
        size: { '.tag': 'w64h64' },
      });

      return response.result;
    } catch (error) {
      throw new HttpException(
        `Error retrieving thumbnail: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createFolder(parentFolder: string, folderName: string): Promise<files.FolderMetadata> {
    try {
      const fullPath = `${parentFolder}/${folderName}`;
      const response = await this.dbx.filesCreateFolderV2({ path: fullPath });
      return response.result.metadata as files.FolderMetadata;
    } catch (error) {
      throw new HttpException(
        `Error creating folder: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFile(uploadFolder: string, file: Express.Multer.File): Promise<files.FileMetadata> {
    try {
      const uploadPath = `${uploadFolder}/${file.originalname}`;
      const response = await this.dbx.filesUpload({
        path: uploadPath,
        contents: file.buffer,
      });

      return response.result as files.FileMetadata;
    } catch (error) {
      throw new HttpException(
        `Error uploading file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFiles(uploadFolder: string, files: Express.Multer.File[]): Promise<any[]> {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const uploadPromises = files.map((file) => {
      const uploadPath = `${uploadFolder}/${file.originalname}`;
      return this.dbx
        .filesUpload({
          path: uploadPath,
          contents: file.buffer,
        })
        .then((response) => ({
          file: file.originalname,
          status: 'success',
          details: response.result,
        }))
        .catch((error) => ({
          file: file.originalname,
          status: 'error',
          details: error.message,
        }));
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new HttpException(
        `Error uploading files: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  /*
  // Generate the Dropbox OAuth2 authorization URL
  getAuthorizationUrl(state?: string): string {
    const params = {
      response_type: 'code',
      client_id: this.APP_KEY,
      redirect_uri: this.REDIRECT_URI,
      token_access_type: 'offline', // To receive a refresh token
      state: state || '', // Optional, for CSRF protection
    };

    const query = qs.stringify(params);
    return `${this.AUTH_URL}?${query}`;
  }*/
  
  async getAuthorizationUrl(state?: string): Promise<string> {
    const { AppKey, AppSecret } = await this.getAppCredentialsFromDB();

    const params = {
      response_type: 'code',
      client_id: AppKey,
      redirect_uri: this.REDIRECT_URI,
      token_access_type: 'offline',
      state: state || '',
    };
    const query = qs.stringify(params);
    return `${this.AUTH_URL}?${query}`;
  }

  // Exchange authorization code for access and refresh tokens
  async getTokens(code: string): Promise<Token> {
	  const { AppKey, AppSecret } = await this.getAppCredentialsFromDB();
	  const authHeader = Buffer.from(`${AppKey}:${AppSecret}`).toString('base64');
    //const authHeader = Buffer.from(`${this.APP_KEY}:${this.APP_SECRET}`).toString('base64');

    const data = qs.stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.REDIRECT_URI,
    });

    try {
      const response = await axios.post(this.TOKEN_URL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`, // Use Authorization header only
        },
      });

      // Store tokens in MongoDB with a fixed _id
      await this.tokensService.update({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
        uid: response.data.uid,
        account_id: response.data.account_id,
      });
	  
	  this.dbx = new Dropbox({ accessToken: response.data.access_token });

      return response.data;
    } catch (error) {
      // Improved error logging
      throw new HttpException(
        `Error getting tokens: ${JSON.stringify(error.response?.data) || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Refresh the access token using the refresh token
  async refreshAccessToken(): Promise<any> {
    try {
      const storedToken: TokenDocument = await this.tokensService.findOne();
	
      //const authHeader = Buffer.from(`${this.APP_KEY}:${this.APP_SECRET}`).toString('base64');
	  
	  const { AppKey, AppSecret } = await this.getAppCredentialsFromDB();
      const authHeader = Buffer.from(`${AppKey}:${AppSecret}`).toString('base64');

      const data = qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: storedToken.refresh_token,
      });

      const response = await axios.post(this.TOKEN_URL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`, // Use Authorization header only
        },
      });

      // Update tokens in MongoDB
      await this.tokensService.update({
        access_token: response.data.access_token,
        // If Dropbox provides a new refresh token, update it
        refresh_token: response.data.refresh_token || storedToken.refresh_token,
        token_type: response.data.token_type,
      });

      return response.data;
    } catch (error) {
      // Improved error logging
      throw new HttpException(
        `Error refreshing token: ${JSON.stringify(error.response?.data) || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get the stored access token
  async getValidAccessToken(): Promise<string> {
    const tokens: TokenDocument = await this.tokensService.findOne();
    if (!tokens) {
      throw new HttpException('Tokens not found. Please authorize the app first.', HttpStatus.UNAUTHORIZED);
    }

    // Optional: Implement token expiry checks here if Dropbox provides expiry info

    return tokens.access_token;
  }

  // Example method to list files in Dropbox root directory
  async listFiles(): Promise<any> {
    const accessToken = await this.getValidAccessToken();

    try {
      const response = await axios.post(
        'https://api.dropboxapi.com/2/files/list_folder',
        {
          path: '', // Root directory
          recursive: false,
          include_media_info: false,
          include_deleted: false,
          include_has_explicit_shared_members: false,
          include_mounted_folders: true,
          include_non_downloadable_files: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      // Handle API errors
      throw new HttpException(
        `Dropbox API error: ${JSON.stringify(error.response?.data) || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add more Dropbox API methods as needed
  
  async getDropboxClient(): Promise<Dropbox> {
    const accessToken = await this.getValidAccessToken();
    return new Dropbox({ accessToken });
  }
  
  async storeAppdata(AppKey: string, AppSecret: string): Promise<any> {
    try {
      await this.tokensService.update({
        AppKey: AppKey,
        AppSecret: AppSecret,
      });
	  
	  await this.initializeDropboxClient();
    } catch (error) {
      throw new HttpException(
        `Error save data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
