import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutComponent } from './checkout.component';
import { CompleteComponent } from './routes/complete/complete.component';
import { ContactComponent } from './routes/contact/contact.component';
import { PaymentComponent } from './routes/payment/payment.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'contact',
        data: { isRoot: true, title: 'Personalized Wallet Case' },
      },
      {
        path: 'contact',
        component: ContactComponent,
        data: { isRoot: true, title: 'Personalized Wallet Case' },
      },
      {
        path: 'payment',
        component: PaymentComponent,
        data: { isRoot: true, title: 'Personalized Wallet Case' },
      },
      {
        path: 'complete',
        component: CompleteComponent,
        data: { isRoot: true, title: 'Personalized Wallet Case' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutRoutingModule { }
