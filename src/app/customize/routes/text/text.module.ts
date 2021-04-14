import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TextRoutingModule } from './text-routing.module';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MenuBgColorComponent, MenuFontComponent, MenuTextColorComponent } from './text.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatListModule,
    MatMenuModule,
    MatSliderModule,
    MatToolbarModule,
    TextRoutingModule,
  ],
  declarations: [
    MenuBgColorComponent,
    MenuFontComponent,
    MenuTextColorComponent,
  ],
})
export class TextModule { }
