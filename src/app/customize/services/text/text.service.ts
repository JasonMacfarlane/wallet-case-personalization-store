import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { BehaviorSubject, Subject } from 'rxjs';

import * as WebFont from 'webfontloader';

interface TextData {
  angle: number;
  bg: {
    color: string,
    padding: number;
    position: { left: number, top: number },
    radius: number,
  };
  position: { x: number, y: number }, // position on final print file canvas
  text: {
    color: string,
    font: string;
    size: number; // px size on final print file canvas
    value: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TextService {
  private _isTextHidden = false;
  private _fontsLoaded$ = new BehaviorSubject<boolean>(false);

  private readonly defaultTextData: TextData = {
    angle: 0,
    bg: {
      color: '#fff',
      padding: 45,
      position: { left: -22, top: -22 },
      radius: 18,
    },
    position: { x: 225.3982035925, y: 1549.3422895863803 },
    text: {
      color: '#000',
      font: 'Roboto',
      size: 65,
      value: 'text',
    },
  };

  private _textImageUrl: string;
  private _textData: TextData = this.defaultTextData;

  private readonly _fontFamilies = [
    'Roboto',
    'Lobster',
    'Lobster Two',
    'Righteous',
    'Alfa Slab One',
    'Luckiest Guy',
    'Bangers',
    'Passion One',
    'Boogaloo',
    'Sigmar One',
    'Unica One',
    'Playball',
    'Fugaz One',
    'Staatliches',
    'Knewave',
    'Black Ops One',
    'Cabin Sketch',
    'Bungee',
  ];

  private readonly _textColors = [
    'rgba(244,67,54,1)',
    'rgba(233,30,99,1)',
    'rgba(156,39,176,1)',
    'rgba(103,58,183,1)',
    'rgba(63,81,181,1)',
    'rgba(33,150,243,1)',
    'rgba(3,169,244,1)',
    'rgba(0,188,212,1)',
    'rgba(0,150,136,1)',
    'rgba(76,175,80,1)',
    'rgba(139,195,74,1)',
    'rgba(205,220,57,1)',
    'rgba(255,235,59,1)',
    'rgba(255,193,7,1)',
    'rgba(255,152,0,1)',
    'rgba(255,87,34,1)',
    'rgba(121,85,72,1)',
    'rgba(158,158,158,1)',
    'rgba(96,125,139,1)',
    'rgba(255,255,255,1)',
    'rgba(0,0,0,1)',
  ];

  private readonly _bgColors = [
    'rgba(255,255,255,0)',
    'rgba(244,67,54,1)',
    'rgba(233,30,99,1)',
    'rgba(156,39,176,1)',
    'rgba(103,58,183,1)',
    'rgba(63,81,181,1)',
    'rgba(33,150,243,1)',
    'rgba(3,169,244,1)',
    'rgba(0,188,212,1)',
    'rgba(0,150,136,1)',
    'rgba(76,175,80,1)',
    'rgba(139,195,74,1)',
    'rgba(205,220,57,1)',
    'rgba(255,235,59,1)',
    'rgba(255,193,7,1)',
    'rgba(255,152,0,1)',
    'rgba(255,87,34,1)',
    'rgba(121,85,72,1)',
    'rgba(158,158,158,1)',
    'rgba(96,125,139,1)',
    'rgba(0,0,0,1)',
    'rgba(255,255,255,1)',
  ];

  bgColorChange$ = new Subject<string>();
  fontChange$ = new Subject<string>();
  textColorChange$ = new Subject<string>();

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
  ) { }

  /**
   * Sets the text data.
   * @param {any} textData text data
   */
  setTextData(textData: any) {
    this._textData = textData;
  }

  /**
   * Gets the text data.
   * @returns text data
   */
  getTextData() {
    return this._textData;
  }

  /**
   * Emits the font change.
   * @param {string} fontFamily font family
   */
  emitFontChange(fontFamily: string) {
    this.fontChange$.next(fontFamily);
  }

  /**
   * Emits the text color change.
   * @param {string} color text color
   */
  emitTextColorChange(color: string) {
    this.textColorChange$.next(color);
  }

  /**
   * Emits the background color change.
   * @param {string} color background color
   */
  emitBgColorChange(color: string) {
    this.bgColorChange$.next(color);
  }

  /**
   * Loads the available Google fonts.
   * @param {any} callback callback function
   */
  loadFonts(callback: any) {
    if (isPlatformBrowser(this._platformId)) {
      WebFont.load({
        google: {
          families: this._fontFamilies,
        },
        active: () => {
          this._fontsLoaded$.next(true);
          return callback();
        },
      });
    }
  }

  /**
   * Gets the available font families.
   * @returns available font families
   */
  getFontFamilies() {
    return this._fontFamilies;
  }

  /**
   * Gets the available text colors.
   * @returns available text colors
   */
  getTextColors() {
    return this._textColors;
  }

  /**
   * Gets the available background colors.
   * @returns available background colors
   */
  getBgColors() {
    return this._bgColors;
  }

  /**
   * Sets whether the text is hidden.
   * @param {boolean} hide true if text is hidden
   */
  setIsTextHidden(hide: boolean) {
    this._isTextHidden = hide;
  }

  /**
   * Gets whether the text is hidden.
   * @returns true if the text is hidden
   */
  getIsTextHidden() {
    return this._isTextHidden;
  }

  /**
   * Gets the text image URL.
   * @returns text image URL
   */
  getTextImageUrl() {
    return this._textImageUrl;
  }

  /**
   * Sets the text image URL.
   * @param {string} url text image URL 
   */
  setTextImageUrl(url: string) {
    this._textImageUrl = url;
  }
}
