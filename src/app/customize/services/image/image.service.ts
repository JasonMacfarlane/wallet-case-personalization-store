import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private _apiUrl = `${environment.apiUrl}`;
  private _bgImageUrl = new BehaviorSubject<string>(null);
  private _croppedImageUrl = new BehaviorSubject<string>(null);
  private _imageStyle = 'mirror';
  private _imageUrl = new BehaviorSubject<string>('');
  private _previewImageUrls: Array<BehaviorSubject<string>> = [
    new BehaviorSubject<string>('assets/img/default-1.jpg'),
    new BehaviorSubject<string>('assets/img/default-2.jpg'),
    new BehaviorSubject<string>('assets/img/default-3.jpg'),
  ];
  private _printFile = new BehaviorSubject<string>(null);

  constructor(
    private _httpClient: HttpClient,
  ) { }

  /**
   * Prepares an image to be uploaded (file resize, etc.).
   * @param {any} img image
   * @returns image data
   */
  prepareImage(img: any) {
    return this._httpClient.post(`${this._apiUrl}/images`, img);
  }

  /**
   * Generates the preview images.
   * @param {string} imgCroppedUrl URL of cropped image
   * @param {string} imgStyle image style
   * @param {any} textData text data (position, size, etc.)
   * @param {string} textImgUrl URL of text image
   * @param {boolean} isTextHidden true if text is hidden
   */
  generatePreviews(imgCroppedUrl: string, imgStyle: string, textData: any, textImgUrl: string, isTextHidden: boolean) {
    const data = {
      imageCroppedUrl: imgCroppedUrl,
      imageStyle: imgStyle,
      isTextHidden: isTextHidden,
      textData: textData,
      textImageUrl: textImgUrl,
    };

    return this._httpClient.post(`${this._apiUrl}/generate-previews`, data);
  }

  /**
   * Sets the image URL.
   * @param {string} url image URL
   */
  setImageUrl(url: string) {
    this._imageUrl.next(url);
  }

  /**
   * Gets the user's image URL.
   * @returns image URL
   */
  getImageUrl() {
    return this._imageUrl;
  }

  /**
   * Gets the preview image URLs.
   * @returns array of image preview URLs
   */
  getPreviewImageUrls() {
    return this._previewImageUrls;
  }

  /**
   * Sets a preview image URL at a given index.
   * @param {number} index preview image index
   * @param {string} url image URL
   */
  setPreviewImageUrl(index: number, url: string) {
    this._previewImageUrls[index].next(url);
  }

  /**
   * Sets the cropped image URL.
   * @param {string} url user's image URL
   */
  setCroppedImage(url: string) {
    this._croppedImageUrl.next(url);
  }

  /**
   * Gets the cropped image URL.
   * @returns cropped image URL
   */
  getCroppedImage() {
    return this._croppedImageUrl;
  }

  /**
   * Sets the background image URL.
   * @param {string} url image URL
   */
  setBgImage(url: string) {
    this._bgImageUrl.next(url);
  }

  /**
   * Gets the background image URL.
   * @returns background image URL
   */
  getBgImage() {
    return this._bgImageUrl;
  }

  /**
   * Sets the print file URL.
   * @param {string} url image URL
   */
  setPrintFile(url: string) {
    this._printFile.next(url);
  }

  /**
   * Gets the print file URL.
   * @returns print file image URL
   */
  getPrintFile() {
    return this._printFile.getValue();
  }

  /**
   * Sets the image style.
   * @param {string} style image style
   */
  setImageStyle(style: string) {
    this._imageStyle = style;
  }

  /**
   * Gets the image style.
   * @returns image style
   */
  getImageStyle() {
    return this._imageStyle;
  }
}
