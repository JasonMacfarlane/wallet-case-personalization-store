import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as random from 'string-random';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DropboxService {
  private _apiUrl = `${environment.apiUrl}`;

  constructor(
    private _httpClient: HttpClient,
  ) { }

  /**
   * Uploads a file to Dropbox.
   * @param {string} filename file name
   * @param {any} arrayBuffer array buffer
   * @returns upload data
   */
  uploadFile(filename: string, arrayBuffer: any) {
    const data = {
      arrayBuffer: arrayBuffer,
      filename: filename,
    };

    return this._httpClient.post(`${this._apiUrl}/dropbox/upload`, data);
  }
}
