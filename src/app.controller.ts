import { Controller, Get, Post, Res, Param, UploadedFile, UploadedFiles, UseInterceptors, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import { Express, Response } from 'express';
import { DropboxService } from './dropbox/dropbox.service'; 


//import { Controller, Post, UploadedFiles, UseInterceptors, Body } from '@nestjs/common';
//import { FilesInterceptor } from '@nestjs/platform-express'; 

@Controller()
export class AppController {
	
	private dbx: Dropbox;
	constructor(private readonly appService: AppService, private readonly dropboxService: DropboxService) {
		 
		
		/*const crypto = require('crypto');
		const secret = crypto.randomBytes(32).toString('hex'); // 256 bits
		console.log(secret);*/
	}

	/*
	@Get()
	async getDropFolders(): Promise<any> {
		try {
		  //const response = await this.dbx.filesListFolder({ path: '' });
		  //return response.result.entries;
		  
		  const folders = await this.dropboxService.listFolders();
		  return folders.entries;
			
		} catch (error) {
		  return { error: error.message };
		}
	}
	
	@Post('basefolder')
	async getBasefolder(
	  @Body('basePath') basePath: string
	): Promise<any> {
		try {
		  const response = await this.dbx.filesListFolder({ path: basePath });
		  return response;//.result.entries;
			
		} catch (error) {
		  return { error: error.message };
		}
	}
	
	@Post('subfolder')
	async getSubfolderContent(
	  @Body('folderPath') folderPath: string
	): Promise<any> {
	  try {
		const response = await this.dbx.filesListFolder({ path: folderPath || '' });

		const folders = response.result.entries.filter(item => item['.tag'] === 'folder');
		const files = response.result.entries.filter(item => item['.tag'] === 'file');

		return { folders, files };
	  } catch (error) {
		return { error: error.message };
	  }
	}

  
	@Get('get-files')
	async getFilesFromFolder(@Query('folderPath') folderPath: string): Promise<any> {
		try {
		  const response = await this.dbx.filesListFolder({
			path: folderPath || '',
		  });

		  const files = response.result.entries.filter(file => file['.tag'] === 'file');

		  return files;
		} catch (error) {
		  return { error: error.message };
		}
	}
  
	@Post('thumbnails')
	async getThumbnails(
		@Body('imgPath') imgPath: string
	): Promise<any> {
		
		try {
			const imagePath = `/${imgPath}`;
			try {
			  const response = await this.dbx.filesGetThumbnail({
				path: imagePath,
				format: { '.tag': 'png' },
				size: { '.tag': 'w64h64' }
			  });
 
			  return response.result;
			} catch (error) {
			  //error.message
			}
		} catch (error) {
		  return { error: error.message };
		}
	}
	
	@Post('create-folder')
	async createFolder(
		@Body('parentFolder') parentFolder: string, 
		@Body('folderName') folderName: string
	): Promise<any> {
		
		try {
			const fullPath = `${parentFolder}/${folderName}`;
			//const fullPath = `/${folderName}`;
			const response = await this.dbx.filesCreateFolderV2({ path: fullPath });
			return response.result.metadata;
		} catch (error) {
		  return { error: error.message };
		}
	}
	
	@Post('upload-file')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: any
	): Promise<any> {
		
		const uploadFolder = body.uploadFolder;
		
		try {
		  const uploadPath = `${uploadFolder}/${file.originalname}`;
		  const response = await this.dbx.filesUpload({
			path: uploadPath,//`/${file.originalname}`,
			contents: file.buffer,
		  });

		  return response.result;
		} catch (error) {
		  return { error: error.message };
		}
	}
	
	
	@Post('upload-files')
	@UseInterceptors(FilesInterceptor('files', 10))
	async uploadFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@Body() body: any
	): Promise<any> {
		const uploadFolder = body.uploadFolder;

		if (!files || files.length === 0) {
		  return { error: 'No files provided' };
		}

		const uploadPromises = files.map(file => {
		  const uploadPath = `${uploadFolder}/${file.originalname}`;
		  return this.dbx.filesUpload({
			path: uploadPath,
			contents: file.buffer,
		  }).then(response => ({
			file: file.originalname,
			status: 'success',
			details: response.result,
		  })).catch(error => ({
			file: file.originalname,
			status: 'error',
			details: error.message,
		  }));
		});

		try {
		  const results = await Promise.all(uploadPromises);
		  return { results };
		} catch (error) {
		  return { error: error.message };
		}
	}
	*/
	
	
	@Get()
  async getDropFolders(): Promise<any> {
    try {
      const folders = await this.dropboxService.listFolders();
      return folders.entries;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /basefolder
   * Description: Retrieves the base folder based on the provided path.
   * Body Parameters:
   * - basePath: string
   */
  @Post('basefolder')
  async getBasefolder(@Body('basePath') basePath: string): Promise<any> {
    try {
      const response = await this.dropboxService.listFolders(basePath);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Post('basefolder')
  async getBasefolder(@Body('basePath') basePath: string): Promise<any> {
    try {
      const response = await this.dropboxService.listFolders(basePath);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /subfolder
   * Description: Retrieves the content of a subfolder, separating folders and files.
   * Body Parameters:
   * - folderPath: string
   */
  @Post('subfolder')
  async getSubfolderContent(@Body('folderPath') folderPath: string): Promise<any> {
    try {
      const content = await this.dropboxService.getSubfolderContent(folderPath || '');
      return content;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: GET /get-files
   * Description: Retrieves files from a specified folder.
   * Query Parameters:
   * - folderPath: string
   */
  @Get('get-files')
  async getFilesFromFolder(@Query('folderPath') folderPath: string): Promise<any> {
    try {
      const files = await this.dropboxService.getFilesFromFolder(folderPath || '');
      return files;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /thumbnails
   * Description: Retrieves a thumbnail for a specified image path.
   * Body Parameters:
   * - imgPath: string
   */
  @Post('thumbnails')
  async getThumbnails(@Body('imgPath') imgPath: string): Promise<any> {
    try {
      const thumbnail = await this.dropboxService.getThumbnail(imgPath);
      return thumbnail;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /create-folder
   * Description: Creates a new folder under the specified parent folder.
   * Body Parameters:
   * - parentFolder: string
   * - folderName: string
   */
  @Post('create-folder')
  async createFolder(
    @Body('parentFolder') parentFolder: string,
    @Body('folderName') folderName: string,
  ): Promise<any> {
    try {
      const metadata = await this.dropboxService.createFolder(parentFolder, folderName);
      return metadata;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /upload-file
   * Description: Uploads a single file to the specified upload folder.
   * Body Parameters:
   * - uploadFolder: string
   * - file: File (multipart/form-data)
   */
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadFolder') uploadFolder: string,
  ): Promise<any> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.dropboxService.uploadFile(uploadFolder, file);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint: POST /upload-files
   * Description: Uploads multiple files to the specified upload folder.
   * Body Parameters:
   * - uploadFolder: string
   * - files: Array of Files (multipart/form-data)
   */
  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('uploadFolder') uploadFolder: string,
  ): Promise<any> {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const results = await this.dropboxService.uploadFiles(uploadFolder, files);
      return { results };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
