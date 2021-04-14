import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from './graphql.module';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';

import { Base64BinaryService } from './core/services/base64-binary/base64-binary.service';
import { MainService } from './core/services/main/main.service';
import { ShopifyService } from './core/services/shopify/shopify.service';

import { hydrationMetaReducer } from './reducers/meta.reducer';
import * as checkoutReducer from './reducers/checkout.reducer';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    CoreModule,
    GraphQLModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgbModule,
    SharedModule,
    StoreModule.forRoot({
      checkout: checkoutReducer.reducer,
    },
    {
      metaReducers: [ hydrationMetaReducer ],
    }),
  ],
  providers: [
    Base64BinaryService,
    MainService,
    ShopifyService,
  ],
  bootstrap: [
    AppComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AppModule { }
