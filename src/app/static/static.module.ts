import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { StaticRoutingModule } from './static-routing.module';

import { PrivacyComponent } from './privacy/privacy.component';
import { StaticComponent } from './static.component';
import { RefundPolicyComponent } from './refund-policy/refund-policy.component';

@NgModule({
  declarations: [
    PrivacyComponent,
    StaticComponent,
    RefundPolicyComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    StaticRoutingModule,
  ],
})
export class StaticModule { }
