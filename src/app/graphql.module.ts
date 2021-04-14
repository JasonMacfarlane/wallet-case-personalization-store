import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';

import { environment } from '../environments/environment';

const uri = environment.shopify.strorefrontApi;

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    "__schema": {
      "types": [
        {
          "kind": "INTERFACE",
          "name": "Node",
          "possibleTypes": [
            {
              "name": "Article"
            },
            {
              "name": "Blog"
            },
            {
              "name": "Comment"
            },
            {
              "name": "Collection"
            },
            {
              "name": "Product"
            },
            {
              "name": "Metafield"
            },
            {
              "name": "ProductVariant"
            },
            {
              "name": "ProductOption"
            },
            {
              "name": "MailingAddress"
            },
            {
              "name": "Checkout"
            },
            {
              "name": "AppliedGiftCard"
            },
            {
              "name": "CheckoutLineItem"
            },
            {
              "name": "Order"
            },
            {
              "name": "Page"
            },
            {
              "name": "ShopPolicy"
            },
            {
              "name": "Payment"
            }
          ]
        },
        {
          "kind": "INTERFACE",
          "name": "HasMetafields",
          "possibleTypes": [
            {
              "name": "Product"
            },
            {
              "name": "ProductVariant"
            }
          ]
        },
        {
          "kind": "UNION",
          "name": "MetafieldParentResource",
          "possibleTypes": [
            {
              "name": "Product"
            },
            {
              "name": "ProductVariant"
            }
          ]
        },
        {
          "kind": "INTERFACE",
          "name": "DiscountApplication",
          "possibleTypes": [
            {
              "name": "AutomaticDiscountApplication"
            },
            {
              "name": "DiscountCodeApplication"
            },
            {
              "name": "ManualDiscountApplication"
            },
            {
              "name": "ScriptDiscountApplication"
            }
          ]
        },
        {
          "kind": "UNION",
          "name": "PricingValue",
          "possibleTypes": [
            {
              "name": "PricingPercentageValue"
            },
            {
              "name": "MoneyV2"
            }
          ]
        },
        {
          "kind": "INTERFACE",
          "name": "DisplayableError",
          "possibleTypes": [
            {
              "name": "CheckoutUserError"
            },
            {
              "name": "UserError"
            },
            {
              "name": "CustomerUserError"
            }
          ]
        }
      ]
    }
  },
});

export function createApollo(httpLink: HttpLink) {
  const basic = setContext((operation, context) => ({
    headers: {
      Accept: 'application/json',
      'X-Shopify-Storefront-Access-Token': environment.shopify.storefrontAccessToken,
    }
  }));

  return {
    link: ApolloLink.from([basic, httpLink.create({ uri })]),
    cache: new InMemoryCache({
      fragmentMatcher,
    }),
  };
}

@NgModule({
  exports: [
    ApolloModule,
    HttpLinkModule,
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [
        HttpLink,
      ],
    },
  ],
})
export class GraphQLModule { }
