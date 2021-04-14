import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { environment } from 'src/environments/environment';

import { BehaviorSubject } from 'rxjs';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { IPayPalConfig } from 'ngx-paypal';
import { parseFullName as parseFullName } from 'parse-full-name';
import * as countryList from 'country-list';

import { MainService } from '../../../core/services/main/main.service';
import { PayPalService } from '../../services/paypal/paypal.service';
import { ShopifyService } from '../../../core/services/shopify/shopify.service';
import { StripeService } from '../../services/stripe/stripe.service';

import { State, Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import * as checkoutActions from '../../../actions/checkout.actions';

declare var Stripe: any;

const stripe = Stripe(environment.stripe.publishableKey);

@Component({
  selector: 'app-checkout-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['../../checkout.component.scss'],
})
export class ContactComponent implements OnInit {
  @ViewChild('placesRef', { static: false })
  placesRef: GooglePlaceDirective;

  @ViewChild('payElement', { static: false })
  payElement: ElementRef;

  @ViewChild('email', { static: false }) set email(content: ElementRef) {
    this._emailInput = content;
  }

  @ViewChild('password', { static: false }) set password(content: ElementRef) {
    this._passwordInput = content;
  }

  private _elements: any;
  private _paymentRequest: any;
  private _prButton: any;

  private _emailInput: ElementRef;
  private _passwordInput: ElementRef;

  private _isCheckingLoginStatusSubject = new BehaviorSubject<boolean>(true);
  isCheckingLoginStatus$ = this._isCheckingLoginStatusSubject.asObservable();

  private _isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedInSubject.asObservable();

  private _isLoggingInSubject = new BehaviorSubject<boolean>(false);
  isLoggingIn$ = this._isLoggingInSubject.asObservable();

  private _loginErrorMsgSubject = new BehaviorSubject<string>(null);
  loginErrorMsg$ = this._loginErrorMsgSubject.asObservable();

  isGuest = true;
  isPreparingPayment = false;
  optionsAutocomplete: { };
  payPalConfig?: IPayPalConfig;
  shippingFormGroup: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    private _mainService: MainService,
    private _router: Router,
    private _paypalService: PayPalService,
    private _shopifyService: ShopifyService,
    private _state: State<AppState>,
    private _store: Store<AppState>,
    private _stripeService: StripeService,
  ) {
    this.shippingFormGroup = new FormGroup({
      email: new FormControl('', [
        Validators.email,
        Validators.required,
      ]),
      acceptsMarketing: new FormControl(false, []),
      firstName: new FormControl('', []),
      lastName: new FormControl('', [
        Validators.required,
      ]),
      company: new FormControl('', []),
      address1: new FormControl('', [
        Validators.required,
      ]),
      address2: new FormControl('', []),
      city: new FormControl('', [
        Validators.required,
      ]),
      province: new FormControl('', [
        Validators.required,
      ]),
      country: new FormControl('', [
        Validators.required,
      ]),
      zip: new FormControl('', [
        Validators.required,
      ]),
      phone: new FormControl('', []),
    });
  }

  ngOnInit() {
    this._initPayPalConfig();
    this._initStripeConfig();
    this._initShippingAddress();

    const customerAccessToken = this._state.getValue().checkout.customerAccessToken;

    if (customerAccessToken) {
      this._isLoggedInSubject.next(true);
    }
  }

  /**
   * Handles the address change using Google Places autocomplete.
   * @param {Address} address customer's address
   */
  handleAddressChange(address: Address) {
    for (let comp of address.address_components) {
      const types = comp.types;

      if (types.includes('street_number')) {
        this.shippingFormGroup.get('address1').setValue(comp.long_name);
      } else if (types.includes('route')) {
        const currentAddress = this.shippingFormGroup.get('address1').value;
        this.shippingFormGroup.get('address1').setValue(`${currentAddress} ${comp.long_name}`);
      } else if (types.includes('locality')) {
        this.shippingFormGroup.get('city').setValue(comp.long_name);
      } else if (types.includes('administrative_area_level_1')) {
        this.shippingFormGroup.get('province').setValue(comp.long_name);
      } else if (types.includes('country')) {
        this.shippingFormGroup.get('country').setValue(comp.long_name);
      } else if (types.includes('postal_code')) {
        this.shippingFormGroup.get('zip').setValue(comp.long_name);
      }
    }
  }

  /**
   * Handles the user login.
   * @param {any} e event
   */
  async login(e: any) {
    this._loginErrorMsgSubject.next(null);

    if (e) {
      e.preventDefault();
    }

    const email = this._emailInput.nativeElement.value;
    const password = this._passwordInput.nativeElement.value;

    if (!email) {
      this._loginErrorMsgSubject.next('Please enter your email.');
      return;
    }

    if (!password) {
      this._loginErrorMsgSubject.next('Please enter your password.');
      return;
    }

    if (this._isLoggingInSubject.getValue() === true) {
      return;
    }

    this._isLoggingInSubject.next(true);

    let accessToken: string;

    try {
      accessToken = await this._shopifyService.getCustomerAccessToken(email, password);
      this._store.dispatch(checkoutActions.updateCustomerAccessToken({ customerAccessToken: accessToken }));
    } catch(err) {
      this._isLoggingInSubject.next(false);
      this._loginErrorMsgSubject.next('It looks like your email or password is incorrect.');
      return;
    }

    try {
      const shippingForm = await this._setShippingAddress(accessToken);

      const shippingAddress = this._getFormattedShippingAddress(shippingForm);
      const customerInfo = this._getFormattedCustomerInfo(shippingForm);
  
      const checkoutId = this._state.getValue().checkout.data.id;
  
      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateEmail(checkoutId, email) }));
      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingAddress(checkoutId, shippingAddress) }));
      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingLine(checkoutId) }));
      this._store.dispatch(checkoutActions.updateCustomerInfo({ customerInfo: customerInfo }));
    } catch(err) {
      this._isLoggingInSubject.next(false);
      this._loginErrorMsgSubject.next('An unknown error occurred.');
      return;
    }
  }

  /**
   * Handles the form submission.
   */
  async onSubmit() {
    this._loginErrorMsgSubject.next(null);
    this.isPreparingPayment = true;

    if (!this.shippingFormGroup.valid) {
      this.isPreparingPayment = false;
      this.shippingFormGroup.markAllAsTouched();

      return this._mainService.showSnackbarError('Please complete required fields.');
    }

    const shippingForm = this.shippingFormGroup.getRawValue();

    const email = shippingForm.email;
    const shippingAddress = this._getFormattedShippingAddress(shippingForm);
    const customerInfo = this._getFormattedCustomerInfo(shippingForm);

    try {
      const checkoutId = this._state.getValue().checkout.data.id;

      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateEmail(checkoutId, email) }));
      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingAddress(checkoutId, shippingAddress) }));
      this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingLine(checkoutId) }));
      this._store.dispatch(checkoutActions.updateCustomerInfo({ customerInfo: customerInfo }));

      this._router.navigate(['/checkout/payment']);
    } catch(err) {
      this.isPreparingPayment = false;

      return this._mainService.showSnackbarError('There was an error with your shipping address. Please contact us or try again later.');
    }
  }

  /**
   * Returns the formatted shipping address.
   * @param address complete shipping address
   * @returns formatted shipping address
   */
  private _getFormattedShippingAddress(address: any): any {
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
    }
  }

  /**
   * Returns the formatted customer information.
   * @param address complete shipping address
   * @returns formatted customer information
   */
  private _getFormattedCustomerInfo(address: any): any {
    return {
      acceptsMarketing: address.acceptsMarketing,
      email: address.email,
      phone: address.phone,
      firstName: address.firstName,
      lastName: address.lastName,
    }
  }

  /**
   * Sets the shipping address from the user's account.
   * @param {string} accessToken customer's access token
   */
  private async _setShippingAddress(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._shopifyService.getCustomerInfo(accessToken).then(async (customer: any) => {
        this._isLoggingInSubject.next(false);
        this._isLoggedInSubject.next(true);

        this.shippingFormGroup.setValue({
          email: customer.email,
          acceptsMarketing: customer.acceptsMarketing,
          firstName: customer.defaultAddress.firstName,
          lastName: customer.defaultAddress.lastName,
          company: customer.defaultAddress.company,
          address1: customer.defaultAddress.address1,
          address2: customer.defaultAddress.address2,
          city: customer.defaultAddress.city,
          province: customer.defaultAddress.province,
          country: customer.defaultAddress.country,
          zip: customer.defaultAddress.zip,
          phone: customer.defaultAddress.phone,
        });

        return resolve(this.shippingFormGroup.getRawValue());
      }).catch((err) => {
        return reject(err);
      });
    })
  }

  /**
   * Initializes the PayPal configuration.
   */
  private _initPayPalConfig() {
    this.payPalConfig = {
      clientId: environment.payPal.clientId,
      advanced: {
        commit: 'false',
        extraQueryParams: [
          { name: 'disable-funding', value: 'card' },
        ],
      },
      style: { },
      createOrderOnServer: async () => {
        const res = await this._paypalService.createTransaction(this._state.getValue().checkout);

        return res.data.id;
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.get();

        const shippingForm = this.shippingFormGroup.getRawValue();
        
        const email = details.payer.email_address;

        const shippingAddress = {
          firstName: details.payer.name.given_name,
          lastName: details.payer.name.surname,
          address1: details.purchase_units[0].shipping.address.address_line_1,
          address2: details.purchase_units[0].shipping.address.address_line_2,
          city: details.purchase_units[0].shipping.address.admin_area_2,
          province: details.purchase_units[0].shipping.address.admin_area_1,
          zip: details.purchase_units[0].shipping.address.postal_code,
          country: countryList.getName(details.purchase_units[0].shipping.address.country_code),
        };

        const customerInfo = {
          acceptsMarketing: shippingForm.acceptsMarketing,
          email: email,
          phone: shippingForm.phone,
          firstName: details.payer.name.given_name,
          lastName: details.payer.name.surname,
        };
        
        try {
          const checkoutId = this._state.getValue().checkout.data.id;

          this._mainService.showLoader();

          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateEmail(checkoutId, email) }));
          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingAddress(checkoutId, shippingAddress) }));
          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingLine(checkoutId) }));
          this._store.dispatch(checkoutActions.updateCustomerInfo({ customerInfo: customerInfo }));

          this._mainService.hideLoader();

          this._router.navigate(['/checkout/payment']);
        } catch(err) {
          this.isPreparingPayment = false;

          return this._mainService.showSnackbarError('There was an error with your shipping address. Please contact us or try again later.');
        }
      },
    };
  }

  private async _initStripeConfig() {
    if (isPlatformBrowser(this._platformId)) {
      this._paymentRequest = stripe.paymentRequest({
        country: 'CA',
        currency: 'usd',
        total: {
          amount: 0,
          label: 'Total',
          pending: true,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: 'express',
            label: 'Express shipping',
            amount: 0,
          },
        ],
      });

      this._paymentRequest.on('shippingaddresschange', (event) => {
        const updateWith = event.updateWith;
        const shippingAddress = event.shippingAddress;

        let updateDetails = {
          status: 'success',
          total: {
            amount: Math.round(this._state.getValue().checkout.data.paymentDueV2.amount * 100),
            label: 'Total',
            pending: false,
          },
          displayItems: [
            {
              amount: Math.round(this._state.getValue().checkout.data.paymentDueV2.amount * 100),
              label: 'Subtotal',
            },
            {
              amount: 0,
              label: 'Shipping',
            },
            {
              amount: 0,
              label: 'Estimated tax',
            },
          ],
        };

        if (shippingAddress.country === 'CA') {
          const tax = (this._state.getValue().checkout.data.paymentDueV2.amount * 0.13).toFixed(2);

          updateDetails = {
            status: 'success',
            total: {
              amount: Math.round((parseFloat(this._state.getValue().checkout.data.paymentDueV2.amount) + parseFloat(tax)) * 100),
              label: 'Total',
              pending: false,
            },
            displayItems: [
              {
                amount: Math.round(this._state.getValue().checkout.data.paymentDueV2.amount * 100),
                label: 'Subtotal',
              },
              {
                amount: 0,
                label: 'Shipping',
              },
              {
                amount: Math.round(parseFloat(tax) * 100),
                label: 'Estimated tax',
              },
            ],
          };
        }

        updateWith(updateDetails);
      });

      this._paymentRequest.on('paymentmethod', async (event: any) => {
        const name = parseFullName(event.shippingAddress.recipient);

        const shippingAddress = {
          firstName: name.first,
          lastName: name.last,
          address1: event.shippingAddress.addressLine[0],
          address2: event.shippingAddress.addressLine[1],
          city: event.shippingAddress.city,
          country: event.shippingAddress.country,
          province: event.shippingAddress.region,
          zip: event.shippingAddress.postalCode,
        };

        const customerInfo = {
          acceptsMarketing: false,
          email: event.payerEmail,
          phone: this.shippingFormGroup.get('phone').value,
          firstName: name.first,
          lastName: name.last,
        };

        try {
          const checkoutData = this._state.getValue().checkout.data;
          const checkoutId = this._state.getValue().checkout.data.id;

          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateEmail(checkoutId, event.payerEmail) }));
          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingAddress(checkoutId, shippingAddress) }));
          this._store.dispatch(checkoutActions.updateData({ data: await this._shopifyService.updateShippingLine(checkoutId) }));
          this._store.dispatch(checkoutActions.updateCustomerInfo({ customerInfo: customerInfo }));

          const res = await this._stripeService.createPaymentIntent(checkoutData);

          const clientSecret = res.data.client_secret;

          const {error: confirmError} = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: event.paymentMethod.id },
            { handleActions: false },
          );
        
          if (confirmError) {
            // Report to the browser that the payment failed, prompting it to
            // re-show the payment interface, or show an error message and close
            // the payment interface.
            event.complete('fail');
          } else {
            // Report to the browser that the confirmation was successful, prompting
            // it to close the browser payment method collection interface.
            event.complete('success');
            // Let Stripe.js handle the rest of the payment flow.
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
            
            if (error) {
              // The payment failed -- ask your customer for a new payment method.
              return this._mainService.showSnackbarError('Payment failed. Please choose another payment method.');
            } else {
              const data = paymentIntent.charges.data[0];
              const name = parseFullName(data.billing_details.name);
              const billing = {
                firstName: name.first,
                lastName: name.last,
                address1: data.billing_details.address.line1,
                address2: data.sbilling_details.address.line2,
                city: data.billing_details.address.city,
                province: data.billing_details.address.state,
                zip: data.billing_details.address.postal_code,
                country: data.billing_details.address.country,
              };

              // The payment has succeeded.
              try {
                await this._shopifyService.createCustomer(customerInfo);
                await this._shopifyService.createOrder(checkoutId, billing, 'Stripe (Payment Intent Button)');
  
                return this._router.navigate(['/checkout/complete']);
              } catch (err) {
                this.isPreparingPayment = false;
                
                return this._mainService.showSnackbarError('An unknown error occurred. You will be refunded if any changes were made.');
              }
            }
          }
        } catch(err) {
          this.isPreparingPayment = false;

          return this._mainService.showSnackbarError('There was an error with your shipping address. Please contact us or try again later.');
        }
      });

      this._elements = stripe.elements();

      this._prButton = this._elements.create('paymentRequestButton', {
        paymentRequest: this._paymentRequest,
      });

      const result = await this._paymentRequest.canMakePayment();

      // Mounts the Stripe payment buttons like Google Pay, Apple Pay, etc.
      if (result) {
        this._prButton.mount(this.payElement.nativeElement);
      } else {
        this.payElement.nativeElement.remove();
      }
    }
  }

  /**
   * Initializes the shipping address.
   */
  private _initShippingAddress() {
    const checkoutData = this._state.getValue().checkout.data;
    const checkoutCustomerInfo = this._state.getValue().checkout.customerInfo;

    if (checkoutData.shippingAddress) {
      this.shippingFormGroup.setValue({
        email: checkoutData.email,
        acceptsMarketing: checkoutCustomerInfo.acceptsMarketing,
        firstName: checkoutData.shippingAddress.firstName,
        lastName: checkoutData.shippingAddress.lastName,
        company: checkoutData.shippingAddress.company,
        address1: checkoutData.shippingAddress.address1,
        address2: checkoutData.shippingAddress.address2,
        city: checkoutData.shippingAddress.city,
        province: checkoutData.shippingAddress.province,
        country: checkoutData.shippingAddress.country,
        zip: checkoutData.shippingAddress.zip,
        phone: checkoutData.shippingAddress.phone,
      });
    }
  }
}
