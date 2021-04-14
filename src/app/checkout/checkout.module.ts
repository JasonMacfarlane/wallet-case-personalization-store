import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ReactiveFormsModule } from '@angular/forms';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxPayPalModule } from 'ngx-paypal';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';
import { CompleteComponent } from './routes/complete/complete.component';
import { ContactComponent } from './routes/contact/contact.component';
import { PaymentComponent } from './routes/payment/payment.component';

import { NgxMaskModule } from 'ngx-mask'
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { InlineSVGModule } from 'ng-inline-svg';
import { TooltipModule } from 'ng2-tooltip-directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PayPalService } from './services/paypal/paypal.service';
import { StripeService } from './services/stripe/stripe.service';

@NgModule({
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    FormsModule,
    GooglePlaceModule,
    InlineSVGModule.forRoot(),
    FontAwesomeModule,
    LazyLoadImageModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatToolbarModule,
    NgxMaskModule.forRoot(),
    NgxPageScrollModule,
    NgxPageScrollCoreModule.forRoot({ duration: 400 }),
    NgxPayPalModule,
    ReactiveFormsModule,
    TooltipModule,
  ],
  declarations: [
    CheckoutComponent,
    CompleteComponent,
    ContactComponent,
    PaymentComponent,
  ],
  providers: [
    PayPalService,
    StripeService,
  ],
})
export class CheckoutModule { }
