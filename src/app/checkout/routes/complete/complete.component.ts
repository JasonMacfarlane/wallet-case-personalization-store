import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { State, Store } from '@ngrx/store';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-checkout-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['../../checkout.component.scss'],
})
export class CompleteComponent implements OnInit {
  // Font Awesome icons
  faFacebook = faFacebook;
  faTwitter = faTwitter;

  checkout$: Observable<any>;

  constructor(
    private _router: Router,
    private _state: State<AppState>,
    private _store: Store<AppState>,
  ) {
    this.checkout$ = this._store.select('checkout');

    const checkoutData = this._state.getValue().checkout.data;
    
    // If the checkout isn't started, navigate to the contact route.
    if (!checkoutData || !checkoutData.shippingAddress) {
      this._router.navigate(['/checkout/contact']);
    };
  }

  ngOnInit() {
    sessionStorage.clear();
  }
}
