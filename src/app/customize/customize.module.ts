import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CustomizeRoutingModule } from './customize-routing.module';

import { CropComponent } from './routes/crop/crop.component';
import { CustomizeComponent } from './customize.component';
import { DesignerComponent } from './routes/designer/designer.component';
import { TextComponent } from './routes/text/text.component';

import { CropService } from './services/crop/crop.service';
import { CustomizeService } from './services/customize/customize.service';
import { DropboxService } from './services/dropbox/dropbox.service';
import { ImageService } from './services/image/image.service';
import { TextService } from './services/text/text.service';

@NgModule({
  declarations: [
    CropComponent,
    CustomizeComponent,
    DesignerComponent,
    TextComponent,
  ],
  imports: [
    CommonModule,
    CustomizeRoutingModule,
    FontAwesomeModule,
    FormsModule,
    LazyLoadImageModule,
    NgbModule,

    // Material Design
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSliderModule,
    MatToolbarModule,
  ],
  providers: [
    CropService,
    CustomizeService,
    DropboxService,
    ImageService,
    TextService,
  ],
})
export class CustomizeModule { }
