import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomizeService {
  private _showHintSubject = new BehaviorSubject<boolean>(true);
  showHint$ = this._showHintSubject.asObservable();

  constructor(
    private _httpClient: HttpClient,
  ) { }

  /**
   * Hides the hint.
   */
  hideHint() {
    this._showHintSubject.next(false);
  }

  /**
   * Gets the product reviews.
   * @returns reviews
   */
  getReviews() {
    const storeUrl = environment.shopify.storeUrl;
    const stampedPublishableKey = environment.stampedIo.publishableKey;

    return this._httpClient.get(`https://stamped.io/api/widget/reviews?productId&productType&email&isWithPhotos&minRating&take&dateFrom&dateTo&storeUrl=${storeUrl}&apiKey=${stampedPublishableKey}`);
  }
}
