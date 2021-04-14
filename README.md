# Wallet case personalization landing page and checkout

*This project is not actively maintained.*

This app allows customers to personalize, preview and purchase a wallet phone case. It uses [Shopify](https://shopify.com) and [WC Fulfillment](https://wcfulfillment.com/) to drop-ship the cases.

The purpose is to present a simple, beautiful landing page targeting customers who clicked on a Facebook ad. The app is **not** dependent on any Shopify theme, and can even be used with the Shopify Lite plan.

Since COVID-19, shipping from China using WC Fulfillment has been too slow, so I shut down my store and made this code open-source. The app is proven to be successful in converting users to customers. I hope this could be used as a starting point for others to develop their own custom landing pages using the Shopify API and other drop-shipping services.

**Note: This web app is made specifically for mobile devices and does not fit a desktop screen.**

**Check out the live [demo](https://sunday-cases.herokuapp.com/).**

### Niche examples

These examples are landing pages targeting specific user interests. For example, if you're targeting horse lovers, you can link an ad to the horse landing page.

- [Horse](https://sunday-cases.herokuapp.com/s/horse)
- [Cat](https://sunday-cases.herokuapp.com/s/cat)
- [Doodle](https://sunday-cases.herokuapp.com/s/dood) (dog)
- [Hiking/Outdoors](https://sunday-cases.herokuapp.com/s/hiking)

## Notes

Google Analytics and the Facebook Pixel code have been removed.

## Technologies
- [Angular 11](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- [NgRx](https://ngrx.io/)

## Requirements
- [This API](https://github.com/JasonMacfarlane/wallet-case-personalization-store-api) for the app to work
- Stripe account with API enabled, because this app uses Stripe directly instead of Shopify Payments
- PayPal developer account with API enabled for the PayPal payments to work
- Google API key with Google Maps enabled for the auto-completion to work in the checkout
- Dropbox API key

## Core Features
- Not dependent on Shopify's front-end
- Angular Universal ready
- NgRx state management
- Fully customized checkout ([read more](#customized-checkout))

---

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

---

## Initial Setup

1. Replace all the `...` with your own variables inside `src/environments/environment.ts` (dev) and `src/environments/environment.prod.ts` (production).
2. Replace `API_KEY` with your Google API key in `index.html`.

<a name="customized-checkout">
## Customized Checkout

The problem with Shopify's default checkout is that the product image is fixed. This becomes an issue when customers are personalizing a product. It would be nice for customers to see their *actual* product in the checkout, instead of a default placeholder product. This increases confidence and confirms what they're purchasing.

Therefore, this app includes a fully customized checkout. The design is inspired by Shopify's checkout, but the product image is updated to show what the customer's actual product will look like when they receive it.

Here's the pro and some cons, but I think the pro is worth the cons. Anything to increase conversion rate!

### Pros
- Dynamic product image shows what the customer is really buying

### Cons
- Can't use Shopify Payments, so a Stripe account is required, as well as your own Stripe and PayPal API credentials
- Testing can be complex

## Apple Pay

To enable Apple Pay as a payment option through Stripe, follow [these instructions](https://support.stripe.com/questions/enable-apple-pay-on-your-stripe-account) to verify your domain.