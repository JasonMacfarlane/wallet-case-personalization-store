import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

import { MainService } from '../core/services/main/main.service';
import { ShopifyService } from '../core/services/shopify/shopify.service';

import { State, Store } from '@ngrx/store';
import { AppState } from '../app.state';
import * as checkoutActions from '../actions/checkout.actions';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  collapseSummary = true;
  discountCode = '';
  isGuest = true;
  windowHeight: string;

  checkout$: Observable<any>;

  private _discountAppliedSubject = new BehaviorSubject<any>(null);
  discountApplied$ = this._discountAppliedSubject.asObservable();

  private _isDiscountApplyingSubject = new BehaviorSubject<boolean>(false);
  isDiscountApplying$ = this._isDiscountApplyingSubject.asObservable();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _location: Location,
    private _mainService: MainService,
    private _router: Router,
    private _shopifyService: ShopifyService,
    private _state: State<AppState>,
    private _store: Store<AppState>,
    ) {
      this.checkout$ = this._store.select('checkout');

      this.windowHeight = this._mainService.getWindowHeight();

      if (!this._state.getValue().checkout.data) {
        this._router.navigate(['/']);
      }

      this._discountAppliedSubject.next(this._calculateDiscount());
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = this._mainService.getWindowHeight();
  }

  /**
   * Handles route change.
   */
  onRouteChange() {
    this._activatedRoute.url.subscribe(() => {
      // Collapse the summary.
      this.collapseSummary = true;
    });
  }

  /**
   * Returns the router URL.
   * @returns the router URL
   */
  getRouterUrl(): string {
    return this._router.url;
  }

  /**
   * Applies a discount code.
   */
  async applyDiscount() {
    if (this._isDiscountApplyingSubject.getValue() === true) {
      return;
    }

    this._isDiscountApplyingSubject.next(true);

    try {
      const checkout = await this._shopifyService.applyDiscount(this._state.getValue().checkout.data.id, this.discountCode);
      this._store.dispatch(checkoutActions.updateData({ data: checkout }));

      if (checkout.discountApplications.edges.length === 0) {
        this._isDiscountApplyingSubject.next(false);
        this._discountAppliedSubject.next(null);

        return this._mainService.showSnackbarError('Sorry, the discount code you entered doesn’t exist.');
      }
      
      this.discountCode = '';

      this._isDiscountApplyingSubject.next(false);
      this._discountAppliedSubject.next(this._calculateDiscount());

      this._mainService.showSnackbar('Discount applied.');
    } catch(err) {
      this._isDiscountApplyingSubject.next(false);
      this._discountAppliedSubject.next(null);

      this._mainService.showSnackbarError('Sorry, the discount code you entered doesn’t exist.');
    }
  }

  /**
   * Checks whether the checkout process is complete.
   * @returns true if checkout process is complete
   */
  isComplete(): boolean {
    return this._router.url === '/checkout/complete';
  }

  /**
   * Handles the back button click.
   */
  goBack() {
    this._location.back();
  }

  /**
   * Calculates the discount amount.
   * @returns discount amount
   */
  private _calculateDiscount() {
    if (!this._state.getValue().checkout.data.subtotalPriceV2) {
      return null;
    }

    return this._state.getValue().checkout.data.lineItems.edges[0].node.variant.priceV2.amount - this._state.getValue().checkout.data.subtotalPriceV2.amount;
  }
}
