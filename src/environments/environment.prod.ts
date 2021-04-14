/**
 * apiUrl: The URL of the hosted API.
 * shopify: {
 *   productId: The ID at the end of URL of the product page in the Shopify admin. 
 *              Should be around 13 characters at the time of writing this.
 *   storefrontAccessToken: Shopiy storefront access token.
 *   storefrontApi: Your Shopify store's URL with /api/2020-01/graphql appeneded to the end.
 *                  The api version can be updated, however it might require some code fixes.
 *   storeUrl: Your Shopify store's URL, without https.
 * }
 * stampedIo: {
 *   publishableKey: Your Stamped.io publishable key.
 * }
 * stripe: {
 *   publishableKey: Your Stripe publishable key.
 * }
 * payPal: {
 *   cilentId: Your PayPal client ID.
 * }
 */

/**
 * DON'T PUT ANYTHING SENSITIVE IN HERE.
 * EVERYTHING IN THIS FILE WILL BE VISIBLE BY ANYONE.
 */

export const environment = {
  production: false,
  apiUrl: 'https://wc-fulfillment-custom-app-api.herokuapp.com',
  shopify: {
    productId: '5291958337580',
    storefrontAccessToken: 'b56f07434cadffc54b2874ac6f7f5bb4',
    strorefrontApi: 'https://jasonmacfarlane.myshopify.com/api/2020-01/graphql',
    storeUrl: 'jasonmacfarlane.myshopify.com',
  },
  stampedIo: {
    publishableKey: 'pubkey-29FJN4p1xfg5du3170L403Q737C87f',
  },
  stripe: {
    publishableKey: 'pk_test_cHThbKAqdWJVSyAUMcVodBUw0050of0XVR',
  },
  payPal: {
    clientId: 'AQ7xgoaB1uvRnE-Yv_9Jc41IlwVyNx-rZwlAYelGYBM4T_2ngSe7XxAf1zG5QYSDPaOd23cAzbwmcJf6',
  },
};
