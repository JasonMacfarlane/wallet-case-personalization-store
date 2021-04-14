import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { environment } from 'src/environments/environment';

import { BehaviorSubject, Observable } from 'rxjs';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { IPayPalConfig } from 'ngx-paypal';

import { faCcVisa, faCcMastercard, faCcAmex } from '@fortawesome/free-brands-svg-icons';

import { MainService } from '../../../core/services/main/main.service';
import { ShopifyService } from '../../../core/services/shopify/shopify.service';

import { PayPalService } from '../../services/paypal/paypal.service';
import { StripeService } from '../../services/stripe/stripe.service';

import { State, Store } from '@ngrx/store';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['../../checkout.component.scss'],
})
export class PaymentComponent implements OnInit {
  @ViewChild('placesRef', { static: false }) 
  placesRef: GooglePlaceDirective;

  @ViewChild('payElement', { static: false }) 
  payElement: ElementRef;

  @ViewChild('cardElement', { static: false })
  cardElement: ElementRef;

  // Font Awesome icons
  faCcVisa = faCcVisa;
  faCcMastercard = faCcMastercard;
  faCcAmex = faCcAmex;

  billingFormGroup: FormGroup;
  ccType: string;
  creditCardFormGroup: FormGroup;
  isPreparingOrder: boolean;
  optionsAutocomplete: {};
  payPalConfig?: IPayPalConfig;
  payPalOrderId: string;

  checkout$: Observable<any>;

  private _formattedShippingAddressSubject: BehaviorSubject<string>;
  formattedShippingAddress$: Observable<string>;

  constructor(
    @Inject(DOCUMENT) private _document: any,
    private _mainService: MainService,
    private _paypalService: PayPalService,
    private _router: Router,
    private _shopifyService: ShopifyService,
    private _state: State<AppState>,
    private _store: Store<AppState>,
    private _stripeService: StripeService,
  ) {
    this.checkout$ = this._store.select('checkout');

    this._formattedShippingAddressSubject = new BehaviorSubject<string>(null);
    this.formattedShippingAddress$ = this._formattedShippingAddressSubject.asObservable();

    this.isPreparingOrder = false;

    const checkoutData = this._state.getValue().checkout.data;

    if (!checkoutData || !checkoutData.shippingAddress) {
      this._router.navigate(['/checkout/contact']);
    };
  }

  /**
   * Initializes the checkout component.
   */
  ngOnInit() {
    this.payPalOrderId = this._paypalService.getOrderId();

    this._initPayPalConfig();

    this.creditCardFormGroup = new FormGroup({
      gateway: new FormControl(this.payPalOrderId === null ? 'cc' : 'paypal', [
        Validators.required,
      ]),
      name: new FormControl('', [
        Validators.required,
      ]),
      number: new FormControl('', [
        Validators.required,
      ]),
      expiration: new FormControl('', [
        Validators.required,
      ]),
      code: new FormControl('', [
        Validators.required,
      ]),
    });

    this.billingFormGroup = new FormGroup({
      addressToUse: new FormControl('shipping', [
        Validators.required,
      ]),
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
    });
  }

  /**
   * Sets the credit card type.
   */
  ccInput() {
    const cardAmericanExpress = /^(?:3[47][0-9]{13})$/;
    const cardVisa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    const cardMastercard = /^(?:5[1-5][0-9]{14})$/;

    const number = this.creditCardFormGroup.get('number').value;

    if (number.match(cardAmericanExpress)) {
      this.ccType = 'amex';
    } else if (number.match(cardVisa)) {
      this.ccType = 'visa';
    } else if (number.match(cardMastercard)) {
      this.ccType = 'mastercard';
    } else {
      this.ccType = null;
    }
  }

  /**
   * Handles the payment submission.
   */
  async onSubmit() {
    this.isPreparingOrder = true;

    const ccForm = this.creditCardFormGroup.getRawValue();
    const checkoutData = this._state.getValue().checkout.data;

    let billingForm = this.billingFormGroup.getRawValue();

    if (billingForm.addressToUse === 'shipping') {
      // Use same address as shipping
      const shippingAddress = checkoutData.shippingAddress;

      this.billingFormGroup.setValue({
        addressToUse: billingForm.addressToUse,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        company: shippingAddress.company,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        zip: shippingAddress.zip,
      });
    } else {
      if (!this.billingFormGroup.valid) {
        this.billingFormGroup.markAllAsTouched();
        this.isPreparingOrder = false;

        this._scrollDownToMain();

        return this._mainService.showSnackbarError('Please complete required fields.');
      }
    }

    billingForm = this.billingFormGroup.getRawValue();

    const customerInfo = this._state.getValue().checkout.customerInfo;

    if (ccForm.gateway === 'cc') {
      // Pay with credit card
      if (!this.creditCardFormGroup.valid) {
        this.creditCardFormGroup.markAllAsTouched();
        this.isPreparingOrder = false;

        this._scrollDownToMain();

        return this._mainService.showSnackbarError('Please complete required fields.');
      }

      const card = {
        name: ccForm.name,
        number: ccForm.number,
        expMonth: ccForm.expiration.substring(0, 2),
        expYear: ccForm.expiration.substring(2, 5),
        cvc: ccForm.code,
      };

      if (!customerInfo) {
        return this._router.navigate(['/checkout/contact']);
      }

      // Create a Shopify customer.
      try {
        await this._shopifyService.createCustomer(customerInfo);
      } catch(err) {
        console.error(err);
        
        return this._mainService.showSnackbarError('An unknown error occurred.');
      }

      try {
        await this._stripeService.completeCheckout(checkoutData, card, billingForm);
        await this._shopifyService.createOrder(checkoutData, billingForm, 'Stripe');

        this.isPreparingOrder = false;

        return this._router.navigate(['/checkout/complete']);
      } catch(err) {
        const code = err.error.data.code;
        const message = err.error.data.message;

        this.isPreparingOrder = false;

        switch(code) {
          case 'incorrect_cvc':
          case 'invalid_cvc':
            this.creditCardFormGroup.get('code').setErrors({ 'invalid': true });
            break;
          
          case 'card_declined':
          case 'processing_error':
          case 'incorrect_number':
          case 'invalid_number':
            this.creditCardFormGroup.get('number').setErrors({ 'invalid': true });
            break;

          case 'expired_card':
            this.creditCardFormGroup.get('number').setErrors({ 'invalid': true });
            break;
          
          case 'invalid_expiry_month':
          case 'invalid_expiry_year':
            this.creditCardFormGroup.get('expiration').setErrors({ 'invalid': true });
            break;
          
          default:
            this.creditCardFormGroup.get('number').setErrors({ 'invalid': true });
            break;
        }
        
        this.creditCardFormGroup.markAllAsTouched();

        this._mainService.showSnackbarError(message);

        this._scrollDownToMain();
      }
    } else {
      // Pay with PayPal
      const billingForm = this.billingFormGroup.getRawValue();

      if (!customerInfo) {
        return this._router.navigate(['/checkout/contact']);
      }

      try {
        const orderId = this._paypalService.getOrderId();

        await this._shopifyService.createCustomer(customerInfo);
        await this._paypalService.patchOrder(checkoutData, orderId);
        await this._paypalService.captureOrder(orderId);
        await this._shopifyService.createOrder(checkoutData, billingForm, 'PayPal');

        this.isPreparingOrder = false;

        return this._router.navigate(['/checkout/complete']);
      } catch(err) {
        console.error(err);

        return this._mainService.showSnackbarError('An unknown error occurred.');
      }
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
        this.billingFormGroup.get('address1').setValue(comp.long_name);
      } else if (types.includes('route')) {
        const currentAddress = this.billingFormGroup.get('address1').value;
        this.billingFormGroup.get('address1').setValue(`${currentAddress} ${comp.long_name}`);
      } else if (types.includes('locality')) {
        this.billingFormGroup.get('city').setValue(comp.long_name);
      } else if (types.includes('administrative_area_level_1')) {
        this.billingFormGroup.get('province').setValue(comp.long_name);
      } else if (types.includes('country')) {
        this.billingFormGroup.get('country').setValue(comp.long_name);
      } else if (types.includes('postal_code')) {
        this.billingFormGroup.get('zip').setValue(comp.long_name);
      }
    }
  }

  /**
   * Initializes the PayPal configuration.
   */
  private _initPayPalConfig() {
    const checkoutData = this._state.getValue().checkout.data;
    const customerInformation = this._state.getValue().checkout.customerInfo;
    
    this.payPalConfig = {
      clientId: environment.payPal.clientId,
      advanced: {
        commit: 'false',
        extraQueryParams: [
          { name: 'disable-funding', value: 'card' },
        ],
      },
      createOrderOnServer: async () => {
        const res = await this._paypalService.createTransaction(checkoutData);

        return res.data.id;
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.get();
        const orderId = details.id;

        try {
          const checkoutData = this._state.getValue().checkout.data;

          let billingForm = this.billingFormGroup.getRawValue();

          if (billingForm.addressToUse === 'shipping') {
            // Use same address as shipping
            const shippingAddress = checkoutData.shippingAddress;

            this.billingFormGroup.setValue({
              addressToUse: billingForm.addressToUse,
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              company: shippingAddress.company,
              address1: shippingAddress.address1,
              address2: shippingAddress.address2,
              city: shippingAddress.city,
              province: shippingAddress.province,
              country: shippingAddress.country,
              zip: shippingAddress.zip,
            });
          } else {
            if (!this.billingFormGroup.valid) {
              this.billingFormGroup.markAllAsTouched();
      
              this._scrollDownToMain();

              return this._mainService.showSnackbarError('Please complete required fields.');
            }
          }

          billingForm = this.billingFormGroup.getRawValue();

          this._mainService.showLoader();

          await this._shopifyService.createCustomer(customerInformation);
          await this._paypalService.patchOrder(checkoutData, orderId);
          await this._paypalService.captureOrder(orderId);
          await this._shopifyService.createOrder(checkoutData, billingForm, 'PayPal');

          this._mainService.hideLoader();

          return this._router.navigate(['/checkout/complete']);
        } catch(err) {
          console.error(err);

          this._mainService.hideLoader();

          return this._mainService.showSnackbarError('There was an error with your shipping address. Please contact us or try again later.');
        }
      },
    };
  }

  /**
   * Scrolls down to main section.
   */
  private _scrollDownToMain() {
    this._document.getElementById('main').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }
}
