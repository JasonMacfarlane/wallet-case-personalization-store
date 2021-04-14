import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private _showLoaderSubject = new BehaviorSubject<boolean>(false);
  private _loaderMessageSubject = new BehaviorSubject<string>('');
  private _snackBarSubject = new Subject<any>();
  private _nextComponentSubject = new Subject<any>();
  private _closeComponentSubject = new Subject<any>();

  showLoader$ = this._showLoaderSubject.asObservable();
  loaderMessage$ = this._loaderMessageSubject.asObservable();
  snackBar$ = this._snackBarSubject.asObservable();
  nextComponent$ = this._nextComponentSubject.asObservable();
  closeComponent$ = this._closeComponentSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
  ) { }

  /**
   * Gets the window height. Useful to fix bugs caused by bottom bar on iOS Safari.
   * @returns window height
   */
  getWindowHeight() {
    if (isPlatformBrowser(this._platformId)) {
      return window.innerHeight + 'px';
    }
  }

  showLoader(message: string = '') {
    this._showLoaderSubject.next(true);
    this._loaderMessageSubject.next(message);
  }

  hideLoader() {
    this._showLoaderSubject.next(false);
  }

  nextComponent() {
    this._nextComponentSubject.next();
  }

  closeComponent() {
    this._closeComponentSubject.next();
  }

  showSnackbar(message: string) {
    this._snackBarSubject.next({
      message: message,
      isError: false,
    });
  }

  showSnackbarError(message: string) {
    this._snackBarSubject.next({
      message: message,
      isError: true,
    });
  }
}
