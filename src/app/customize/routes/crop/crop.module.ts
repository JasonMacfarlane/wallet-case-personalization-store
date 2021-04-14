import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CropRoutingModule } from './crop-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [
    CommonModule,
    CropRoutingModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatToolbarModule,
  ],
})
export class CropModule { }
