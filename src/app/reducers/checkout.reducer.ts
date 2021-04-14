import { Action, createReducer, on } from '@ngrx/store';
import * as CheckoutActions from '../actions/checkout.actions';

export interface State {
  customerAccessToken: string;
  customerInfo: any;
  data: any;
  image: string;
}

export const initialState: State = {
  customerAccessToken: null,
  customerInfo: null,
  data: null,
  image: null,
};

const checkoutReducer = createReducer(
  initialState,
 
  on(CheckoutActions.create, (state, { data, image }) => ({
    customerAccessToken: state.customerAccessToken,
    customerInfo: state.customerInfo,
    data: data,
    image: image,
  })),
  
  on(CheckoutActions.updateData, (state, { data }) => ({
    customerAccessToken: state.customerAccessToken,
    customerInfo: state.customerInfo,
    data: data,
    image: state.image,
  })),

  on(CheckoutActions.updateCustomerAccessToken, (state, { customerAccessToken }) => ({
    customerAccessToken: customerAccessToken,
    customerInfo: state.customerInfo,
    data: state.data,
    image: state.image,
  })),
  
  on(CheckoutActions.updateCustomerInfo, (state, { customerInfo }) => ({
    customerAccessToken: state.customerAccessToken,
    customerInfo: customerInfo,
    data: state.data,
    image: state.image,
  })),
);

export function reducer(state: State | undefined, action: Action) {
  return checkoutReducer(state, action);
}
