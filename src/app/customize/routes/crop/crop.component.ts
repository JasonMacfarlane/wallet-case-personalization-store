import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators'

import { MainService } from '../../../core/services/main/main.service';

import { CustomizeService } from '../../services/customize/customize.service';
import { CropService }      from '../../services/crop/crop.service';
import { ImageService }     from '../../services/image/image.service';

import Cropper from 'cropperjs';

@Component({
  selector: 'app-cropper',
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.scss'],
})
export class CropComponent implements AfterViewInit, OnDestroy {
  private _scaleX: number;
  private _scaleY: number;
  
  showLoader$: Observable<boolean>;
  style: string;
  windowHeight: string;

  private _showCropperSubject = new BehaviorSubject<boolean>(false);
  showCropper$ = this._showCropperSubject.asObservable();

  private _cropper: Cropper;

  // Cropper configuation.
  private configCropper = {
    autoCropArea: 1,
    cropBoxMovable: false,
    data: null,
    dragMode: 'move' as Cropper.DragMode,
    preview: '.preview__img',
    viewMode: 1 as Cropper.ViewMode,
    ready: () => {
      this._mainService.hideLoader();
      this._showCropperSubject.next(true);
      this._cropper.setAspectRatio(this._cropService.getAspectRatio());
    },
  };

  @ViewChild('cropperImage', { static: true })
  cropperImage: ElementRef;

  @ViewChild('editorPreview', { static: true })
  editorPreview: ElementRef;

  // The image URL (base64).
  imageUrl: BehaviorSubject<string>;

  private _closeSubscription: Subscription;
  private _nextSubscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    private _customizeService: CustomizeService,
    private _cropService: CropService,
    private _imageService: ImageService,
    private _mainService: MainService,
    private _router: Router,
  ) {
    this._scaleX = 1;
    this._scaleY = 1;

    this.showLoader$ = this._mainService.showLoader$;
    this.style = '';
    this.windowHeight = this._mainService.getWindowHeight();

    this.imageUrl = this._imageService.getImageUrl();

    if (this.imageUrl.getValue() === '') {
      this._router.navigate(['/']);
    }

    this._closeSubscription = this._mainService.closeComponent$.pipe(first()).subscribe(() => {
      this.close();
    });

    this._nextSubscription = this._mainService.nextComponent$.pipe(first()).subscribe(() => {
      this.saveImage();
    });

    this.style = this._imageService.getImageStyle();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = this._mainService.getWindowHeight();

    this._cropper.destroy();
    this.configCropper.data = this._cropService.getData();
    this._cropper = new Cropper(this.cropperImage.nativeElement, this.configCropper);

    this._cropper.scaleX(this._scaleX);
    this._cropper.scaleY(this._scaleY);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this._platformId)) {
      this._mainService.showLoader('Opening cropper');

      this.configCropper.data = this._cropService.getData();

      this._cropper = new Cropper(this.cropperImage.nativeElement, this.configCropper);

      this._mainService.hideLoader();
    }
  }

  ngOnDestroy() {
    this._closeSubscription.unsubscribe();
    this._nextSubscription.unsubscribe();
  }

  /**
   * Returns the image style.
   * @returns the image style
   */
  getImageStyle(): string {
    return this._imageService.getImageStyle();
  }

  /**
   * Flips the image horizontally.
   */
  flipH() {
    this._scaleX *= -1;
    this._cropper.scaleX(this._scaleX);
  }

  /**
   * Flips the image vertically.
   */
  flipV() {
    this._scaleY *= -1;
    this._cropper.scaleY(this._scaleY);
  }

  /**
   * Rotates the image counter-clockwise.
   */
  rotateLeft() {
    this._cropper.rotate(-90);
  }

  /**
   * Rotates the image clockwise.
   */
  rotateRight() {
    this._cropper.rotate(90);
  }

  /**
   * Updates the aspect ratio.
   * @param style The image style (full, repeat or mirrored).
   */
  updateAspectRatio(style: string) {
    this._mainService.showLoader();

    this.style = style;

    this._imageService.setImageStyle(style);

    this._cropService.setData(null);

    this._cropper.destroy();
    this.configCropper.data = this._cropService.getData();
    this._cropper = new Cropper(this.cropperImage.nativeElement, this.configCropper);

    this._cropper.scaleX(this._scaleX);
    this._cropper.scaleY(this._scaleY);

    if (style === 'full') {
      this._cropService.setAspectRatio(351 / 302);
      this._cropper.setAspectRatio(this._cropService.getAspectRatio());
    } else {
      this._cropService.setAspectRatio(1229 / 2114);
      this._cropper.setAspectRatio(this._cropService.getAspectRatio());
    }

    this._mainService.hideLoader();
  }

  /**
   * Saves the image.
   */
  private saveImage() {
    this._customizeService.hideHint();
    this._mainService.showLoader();

    const croppedImageUrl = this._cropper.getCroppedCanvas({
      height: 2114,
      width: 2457,
    }).toDataURL('image/jpeg');

    this._imageService.setCroppedImage(croppedImageUrl);

    this._cropService.setData(this._cropper.getData());
    this._cropService.setCanvasData(this._cropper.getCanvasData());
    this._cropService.setCropBoxData(this._cropper.getCropBoxData());

    this._router.navigate(['/'], { state: { updated: true } });
  }

  /**
   * Closes the component.
   */
  close() {
    this._cropService.setData(this._cropper.getData());
    this._cropService.setCanvasData(this._cropper.getCanvasData());
    this._cropService.setCropBoxData(this._cropper.getCropBoxData());

    this._router.navigate(['/'], { state: { updated: false } });
  }
}