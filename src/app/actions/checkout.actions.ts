import { createAction, props } from '@ngrx/store';

export const create = createAction(
  '[Designer] Create',
  props<{ data: any, image: string }>(),
)

export const updateData = createAction(
  '[Checkout] Update Data',
  props<{ data: any }>(),
)

export const updateCustomerAccessToken = createAction(
  '[Checkout] Update Customer AccessT oken',
  props<{ customerAccessToken: string }>(),
)

export const updateCustomerInfo = createAction(
  '[Checkout] Update Customer Info',
  props<{ customerInfo: any }>(),
)
