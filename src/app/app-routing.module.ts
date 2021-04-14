import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { 
    path: '',
    loadChildren: () => import('./customize/customize.module').then(mod => mod.CustomizeModule),
    data: { isRoot: true, title: 'Personalized Wallet Case' },
  },
  { 
    path: 's/:niche', 
    loadChildren: () => import('./customize/customize.module').then(mod => mod.CustomizeModule),
    data: { isRoot: true, title: 'Personalized Wallet Case' },
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.module').then(mod => mod.CheckoutModule),
    data: { isRoot: true, title: 'Personalized Wallet Case' },
  },
  {
    path: 'static',
    loadChildren: () => import('./static/static.module').then(mod => mod.StaticModule),
    data: { isRoot: true, title: 'Personalized Wallet Case' },
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
