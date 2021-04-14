import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaticComponent } from './static.component';

import { PrivacyComponent } from './privacy/privacy.component';
import { RefundPolicyComponent } from './refund-policy/refund-policy.component';

const routes: Routes = [
  {
    path: '',
    component: StaticComponent,
    children: [
      {
        path: 'privacy',
        component: PrivacyComponent,
        data: { isRoot: false, title: 'Privacy Policy' },
      },
      {
        path: 'refund-policy',
        component: RefundPolicyComponent,
        data: { isRoot: false, title: 'Refund Policy' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticRoutingModule { }
