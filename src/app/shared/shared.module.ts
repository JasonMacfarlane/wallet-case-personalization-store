  
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackbarComponent } from './components/snackbar/snackbar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterModule
  ],
  declarations: [
    SnackbarComponent,
  ],
  exports: [
    SnackbarComponent,
  ],
})
export class SharedModule { }
