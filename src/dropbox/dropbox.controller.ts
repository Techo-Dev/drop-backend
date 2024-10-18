// src/dropbox/dropbox.controller.ts

import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  HttpException,
  HttpStatus,
  Post,
  Body
} from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { Response } from 'express';

@Controller('dropbox')
export class DropboxController {
  constructor(private readonly dropboxService: DropboxService) {}

  // Endpoint to initiate Dropbox OAuth2 flow
  @Get('auth')
  @Redirect()
  async auth(@Res() res: Response) {
    const authorizationUrl = await this.dropboxService.getAuthorizationUrl();
    res.redirect(authorizationUrl);
  }

  // Callback endpoint for Dropbox OAuth2
  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      throw new HttpException('Code not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokens = await this.dropboxService.getTokens(code);

      // Respond to the client indicating success
      /*return res.json({
        message: 'Authorization successful.',
        // access_token: tokens.access_token, // Optional: Remove in production
        // refresh_token: tokens.refresh_token, // Optional: Remove in production
        uid: tokens.uid,
        account_id: tokens.account_id,
      });*/
	  
	  const successUrl = `https://dropbox-ng.vercel.app/#/dropboxlist`;
	  return res.redirect(successUrl);
	  
    } catch (error) {
      // Improved error logging
      throw new HttpException(
        `Failed to get tokens: ${error.message || JSON.stringify(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoint to refresh access token
  @Get('refresh')
  async refresh(@Res() res: Response) {
    try {
      const newTokens = await this.dropboxService.refreshAccessToken();

      return res.json({
        message: 'Token refreshed successfully.',
        access_token: newTokens.access_token,
        token_type: newTokens.token_type,
        // refresh_token: newTokens.refresh_token, // Optional: Include if updated
      });
    } catch (error) {
      // Improved error logging
      throw new HttpException(
        `Failed to refresh token: ${error.message || JSON.stringify(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  
	@Get('checktoken')
	async getDropToken(): Promise<any> {
		try {
		  const dropTokens = await this.dropboxService.getValidAccessToken();

		  return dropTokens;
		} catch (error) {
		  
		  throw new HttpException(
			`Failed to token: ${error.message || JSON.stringify(error)}`,
			HttpStatus.BAD_REQUEST,
		  );
		}
	}
	
	@Post('storeappdata')
	async storeAppdata(
    @Body('AppKey') AppKey: string,
    @Body('AppSecret') AppSecret: string,
	): Promise<any> {
		try {
		  const metadata = await this.dropboxService.storeAppdata(AppKey, AppSecret);
		  return metadata;
		} catch (error) {
		  throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

  // Example endpoint to list files
  /*@Get('list-files')
  async listFiles(@Res() res: Response) {
    try {
      const files = await this.dropboxService.listFiles();
      return res.json(files);
    } catch (error) {
      throw new HttpException(
        `Failed to list files: ${error.message || JSON.stringify(error)}`,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }*/
}
