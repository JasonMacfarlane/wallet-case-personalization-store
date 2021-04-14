import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PayPalService {
  constructor(
    private _httpClient: HttpClient,
  ) { }

  /**
   * Gets the PayPal order ID.
   * @returns PayPal order ID
   */
  getOrderId() {
    return sessionStorage.getItem('sc-paypal-order-number');
  }

  /**
   * Creates a PayPal transaction.
   * @param {any} checkout Shopify checkout object
   * @returns order data
   */
  createTransaction(checkout: any): Promise<any> {
    const data = {
      checkout: checkout,
    };

    return new Promise((resolve, reject) => {
      return this._httpClient.post(`${environment.apiUrl}/paypal/create-order`, data).subscribe((res: any) => {
        sessionStorage.setItem('sc-paypal-order-number', res.data.id);
        
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }

  /**
   * Patches a PayPal order.
   * @param {any} checkout Shopify checkout object
   * @param {string} orderId PayPal order ID
   * @returns order data
   */
  patchOrder(checkout: string, orderId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = {
        checkout: checkout,
        orderId: orderId,
      };

      return this._httpClient.post(`${environment.apiUrl}/paypal/patch-order`, data).subscribe((res: any) => {
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }

  /**
   * Captures the PayPal order.
   * @param {string} orderId PayPAl order ID
   * @returns order data
   */
  captureOrder(orderId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = {
        orderId: orderId,
      };

      return this._httpClient.post(`${environment.apiUrl}/paypal/capture-order`, data).subscribe((res: any) => {
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }
}
