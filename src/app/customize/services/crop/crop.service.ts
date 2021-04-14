import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private _aspectRatio = 1229 / 2114;
  private _data = null;
  private _canvasData = null;
  private _cropBoxData = null;

  constructor() { }

  /**
   * Gets the aspect ratio
   * @returns aspect ratio
   */
  getAspectRatio() {
    return this._aspectRatio;
  }

  /**
   * Sets the aspect ratio.
   * @param {number} aspectRatio aspect ratio
   */
  setAspectRatio(aspectRatio: number) {
    this._aspectRatio = aspectRatio;
  }

  /**
   * Gets the data.
   * @returns data
   */
  getData() {
    return this._data;
  }

  /**
   * Sets the data
   * @param {any} data data
   */
  setData(data: any) {
    this._data = data;
  }

  /**
   * Gets the canvas data.
   * @returns canvas data
   */
  getCanvasData() {
    return this._canvasData;
  }

  /**
   * Sets the canvas data.
   * @param {any} data data
   */
  setCanvasData(data: any) {
    this._canvasData = data;
  }

  /**
   * Gets the crop box data.
   * @returns crop box data
   */
  getCropBoxData() {
    return this._cropBoxData;
  }

  /**
   * Sets the crop box data.
   * @param {any} data data
   */
  setCropBoxData(data: any) {
    this._cropBoxData = data;
  }
}
