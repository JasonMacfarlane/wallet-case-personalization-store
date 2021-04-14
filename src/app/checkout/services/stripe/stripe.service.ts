import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  constructor(
    private _httpClient: HttpClient,
  ) { }

  /**
   * Completes the Stripe checkout.
   * @param checkout Shopify checkout object
   * @param card Stripe card object
   * @param billing Billing data
   * @returns charge data
   */
  completeCheckout(checkout: any, card: any, billing: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = {
        checkout: checkout,
        card: card,
        billing: billing,
      };

      return this._httpClient.post(`${environment.apiUrl}/stripe/charge`, data).subscribe((res) => {
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }

  /**
   * Creates a Stripe payment intent.
   * @param checkout Shopify checkout object
   * @returns payment indent data
   */
  createPaymentIntent(checkout: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = { checkout: checkout };

      return this._httpClient.post(`${environment.apiUrl}/stripe/payment-intent`, data).subscribe((res) => {
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }
}
