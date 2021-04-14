import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient} from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import Client from 'shopify-buy';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private readonly defaultId = environment.shopify.productId;

  private client: any;
  private checkoutProductId: string;

  private readonly shippingRateHandle = 'shopify-Express%20Shipping-0.00';

  private readonly checkoutGqlObject = `
    checkout {
      id
      currencyCode
      webUrl
      paymentDueV2 {
        amount
        currencyCode
      }
      subtotalPriceV2 {
        amount
        currencyCode
      }
      taxExempt
      taxesIncluded
      totalTaxV2 {
        amount
        currencyCode
      }
      customAttributes {
        key
        value
      }
      lineItems(first: 1) {
        edges {
          node {
            title
            variant {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
            }
            quantity
            customAttributes {
              key
              value
            }
          }
        }
      }
      email
      discountApplications(first: 1) {
        edges {
          node {
            allocationMethod
            targetSelection
            targetType
            value {
              ... on MoneyV2 {
                amount
                currencyCode
              }
              ... on PricingPercentageValue {
                percentage
              }
            }
          }
        }
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      shippingLine {
        handle
        priceV2 {
          amount
          currencyCode
        }
        title
      }
    }
    checkoutUserErrors {
      code
      field
      message
    }
  `;

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    private _apollo: Apollo,
    private _httpClient: HttpClient,
  ) {
    if (isPlatformBrowser(this._platformId)) {
      this.client = Client.buildClient({
        domain: environment.shopify.storeUrl,
        storefrontAccessToken: environment.shopify.storefrontAccessToken,
      });

      this.checkoutProductId = btoa(`gid://shopify/Product/${this.defaultId}`);
    }
  }

  /**
   * Creates a checkout.
   * @param {string} image checkout image
   * @param {string} variantId product variant ID
   * @param {string} filename filename of printfile (uploaded to Dropbox)
   * @returns checkout object
   */
  createCheckout(image: string, variantId: string, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkoutCreate = gql`
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            ${this.checkoutGqlObject}
          }
        }
      `;

      this._apollo.mutate({
        mutation: checkoutCreate,
        variables: {
          input: {
            lineItems: {
              customAttributes: [{ key: 'Image', value: filename }],
              quantity: 1,
              variantId: variantId,
            },
          },
        },
      }).subscribe((res: any) => {
        return resolve({
          data: res.data.checkoutCreate.checkout,
          image: image,
        });
      }, (err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Gets the customer's information.
   * @param {string} accessToken customer access token
   * @returns customer's information
   */
  getCustomerInfo(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const customer = gql`
        {
          customer(customerAccessToken: "${accessToken}") {
            defaultAddress {
              firstName
              lastName
              company
              phone
              address1
              address2
              city
              province
              zip
              country
            }
            email
            acceptsMarketing
          }
        }
      `;

      this._apollo.query({
        query: customer,
        variables: {
          token: accessToken,
        },
      }).subscribe((res: any) => {
        return resolve(res.data.customer);
      }), (err: any) => {
        return reject(err);
      }
    });
  };

  /**
   * Applies a discount.
   * @param {string} checkoutId checkout ID
   * @param {string} discountCode discount code
   * @returns checkout object
   */
  applyDiscount(checkoutId: string, discountCode: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const checkoutDiscountCodeRemove = gql`
          mutation checkoutDiscountCodeRemove($checkoutId: ID!) {
            checkoutDiscountCodeRemove(checkoutId: $checkoutId) {
              ${this.checkoutGqlObject}
            }
          }
        `;

        await this._apollo.mutate({
          mutation: checkoutDiscountCodeRemove,
          variables: {
            checkoutId: checkoutId,
          },
        }).toPromise();

        const checkoutDiscountCodeApplyV2 = gql`
          mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
            checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
              ${this.checkoutGqlObject}
            }
          }
        `;

        const res: any = await this._apollo.mutate({
          mutation: checkoutDiscountCodeApplyV2,
          variables: {
            discountCode: discountCode,
            checkoutId: checkoutId,
          },
        }).toPromise();

        const checkout = res.data.checkoutDiscountCodeApplyV2.checkout;
        return resolve(checkout);
      } catch(err) {
        return reject(err);
      }
    });
  }

  /**
   * Creates a new customer in Shopify.
   * @param {any} customerInfo customer information
   * @returns customer data
   */
  createCustomer(customerInfo: any) {
    return new Promise((resolve, reject) => {
      return this._httpClient.post(`${environment.apiUrl}/shopify/customers`, customerInfo).subscribe((res) => {
        return resolve(res);
      }, (err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Updates the customer's email address.
   * @param {string} checkoutId checkout ID
   * @param {string} email email address
   * @returns checkout object
   */
  updateEmail(checkoutId: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkoutShippingAddressUpdateV2 = gql`
        mutation checkoutEmailUpdateV2($checkoutId: ID!, $email: String!) {
          checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
            ${this.checkoutGqlObject}
          }
        }
      `;

      this._apollo.mutate({
        mutation: checkoutShippingAddressUpdateV2,
        variables: {
          email: email,
          checkoutId: checkoutId,
        },
      }).subscribe((res: any) => {
        const checkout = res.data.checkoutEmailUpdateV2.checkout;
        return resolve(checkout);
      }, (err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Updates the customer's shipping address.
   * @param {string} checkoutId checkout ID
   * @param {any} address shipping address
   * @returns checkout object
   */
  updateShippingAddress(checkoutId: string, address: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkoutShippingAddressUpdateV2 = gql`
        mutation checkoutShippingAddressUpdateV2($shippingAddress: MailingAddressInput!, $checkoutId: ID!) {
          checkoutShippingAddressUpdateV2(shippingAddress: $shippingAddress, checkoutId: $checkoutId) {
            ${this.checkoutGqlObject}
          }
        }
      `;

      this._apollo.mutate({
        mutation: checkoutShippingAddressUpdateV2,
        variables: {
          shippingAddress: address,
          checkoutId: checkoutId,
        },
      }).subscribe((res: any) => {
        const checkout = res.data.checkoutShippingAddressUpdateV2.checkout;
        return resolve(checkout);
      }, (err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Updates the shipping line.
   * @param {string} checkoutId checkout ID
   * @returns checkout object
   */
  updateShippingLine(checkoutId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkoutShippingLineUpdate = gql`
        mutation checkoutShippingLineUpdate($checkoutId: ID!, $shippingRateHandle: String!) {
          checkoutShippingLineUpdate(checkoutId: $checkoutId, shippingRateHandle: $shippingRateHandle) {
            ${this.checkoutGqlObject}
          }
        }
      `;

      this._apollo.mutate({
        mutation: checkoutShippingLineUpdate,
        variables: {
          checkoutId: checkoutId,
          shippingRateHandle: this.shippingRateHandle,
        },
      }).subscribe((res: any) => {
        const checkout = res.data.checkoutShippingLineUpdate.checkout;
        return resolve(checkout);
      }, (err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Gets the Shopify product details.
   * @returns Shopify product details
   */
  getProduct(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.product.fetch(this.checkoutProductId).then((product: any) => {
        return resolve(product);
      }).catch((err: any) => {
        return reject(err);
      });
    });
  }

  /**
   * Gets the customer's access token.
   * @param email customer's email address
   * @param password customer's password
   * @returns access token
   */
  getCustomerAccessToken(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const customerAccessTokenCreate = gql`
        mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
          customerAccessTokenCreate(input: $input) {
            customerAccessToken {
              accessToken
              expiresAt
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      this._apollo.mutate({
        mutation: customerAccessTokenCreate,
        variables: {
          input: {
            'email': `${email}`,
            'password': `${password}`
          },
        },
      }).subscribe((res: any) => {
        let accessToken: string;

        try {
          accessToken = res.data.customerAccessTokenCreate.customerAccessToken.accessToken;
        } catch (err) {
          return reject(err);
        }

        return resolve(accessToken);
      }, (err) => {
        return reject(err);
      });
    });
  }

  /**
   * Creates an order.
   * @param { string } checkout checkout object
   * @param { string } billing billing address
   * @param { string } paymentGateway payment gateway
   * @returns order data
   */
  createOrder(checkout: any, billing: any, paymentGateway: string) {
    const data = {
      checkout: checkout,
      billing: billing,
      paymentGateway: paymentGateway,
    };

    return new Promise((resolve, reject) => {
      return this._httpClient.post(`${environment.apiUrl}/shopify/order`, data).subscribe((res) => {
        return resolve(res);
      }, (err) => {
        return reject(err);
      });
    });
  }
}
