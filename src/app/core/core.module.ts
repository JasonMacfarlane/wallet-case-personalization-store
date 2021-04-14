import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { throwIfAlreadyLoaded } from './guards/modules-import-guard';

@NgModule({
  declarations: [ ],
  exports: [ ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
  ],
  providers: [ ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
