// src/dropbox/dropbox-token.interface.ts

export interface DropboxToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  uid: string;
  account_id: string;
}
