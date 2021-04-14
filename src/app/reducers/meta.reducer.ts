import { ActionReducer, INIT } from '@ngrx/store';

import { AppState } from '../app.state';

export const hydrationMetaReducer = (
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> => {
  return (state, action) => {
    if (action.type === INIT) {
      const storageValueCheckoutData = sessionStorage.getItem('sc-checkout');
      const storageValueCheckoutImage = sessionStorage.getItem('sc-checkout-image');
      const storageValueCustomerInfo = sessionStorage.getItem('sc-customer-information');
      const storageValueCustomerAccessToken = sessionStorage.getItem('sc-customer-access-token');

      try {
        return {
          checkout: {
            customerAccessToken: !storageValueCustomerAccessToken ? null : JSON.parse(storageValueCustomerAccessToken),
            customerInfo: !storageValueCustomerInfo ? null : JSON.parse(storageValueCustomerInfo),
            data: JSON.parse(storageValueCheckoutData),
            image: JSON.parse(storageValueCheckoutImage),
          },
        };
      } catch {
        sessionStorage.removeItem('sc-checkout');
        sessionStorage.removeItem('sc-checkout-image');
        sessionStorage.removeItem('sc-customer-information');
        sessionStorage.removeItem('sc-customer-access-token');

        return reducer(state, action);
      }
    }

    const nextState = reducer(state, action);

    sessionStorage.setItem('sc-checkout', JSON.stringify(nextState.checkout.data));
    sessionStorage.setItem('sc-checkout-image', JSON.stringify(nextState.checkout.image));
    sessionStorage.setItem('sc-customer-information', !nextState.checkout.customerInfo ? null : JSON.stringify(nextState.checkout.customerInfo));
    sessionStorage.setItem('sc-customer-access-token', !nextState.checkout.customerAccessToken ? null : JSON.stringify(nextState.checkout.customerAccessToken));

    console.log(nextState);

    return nextState;
  };
};
