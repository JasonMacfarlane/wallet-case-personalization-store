import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

import { MatExpansionPanel } from '@angular/material/expansion';

import { faCcVisa, faCcMastercard, faCcAmex } from '@fortawesome/free-brands-svg-icons';
import * as random from 'string-random';

import { Base64BinaryService } from '../../../core/services/base64-binary/base64-binary.service';
import { CustomizeService } from '../../services/customize/customize.service';
import { DropboxService } from '../../services/dropbox/dropbox.service';
import { ImageService } from '../../services/image/image.service';
import { MainService } from '../../../core/services/main/main.service';
import { ShopifyService } from '../../../core/services/shopify/shopify.service';
import { TextService } from '../../services/text/text.service';

import { State, Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import * as checkoutActions from '../../../actions/checkout.actions';

@Component({
  selector: 'app-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
})
export class DesignerComponent implements OnInit {
  @ViewChild('preview', { static: false })
  previewElement: ElementRef;

  @ViewChild('expansionReviews', { static: false })
  expansionReviews: MatExpansionPanel;

  // Font Awesome icons
  faCcVisa = faCcVisa;
  faCcMastercard = faCcMastercard;
  faCcAmex = faCcAmex;

  private variantsSubject = new BehaviorSubject<any>(null)
  variants$ = this.variantsSubject.asObservable();

  activePreviewImageIndex: number;
  imageWidth: number;
  isPreparingCheckout: boolean;
  previewImageUrls: Array<BehaviorSubject<string>>;
  selectedVariantId: number;
  showHint$: Observable<boolean>;
  windowHeight: string;

  productSubject = new BehaviorSubject<any>(null);
  reviewsSubject = new BehaviorSubject<any>(null);
  primaryColorSubject = new BehaviorSubject<string>(null);
  mutedColorSubject = new BehaviorSubject<string>(null);
  colorContrastSubject = new BehaviorSubject<string>(null);

  currentYear: number;

  constructor(
    @Inject(DOCUMENT) private _document: any,
    @Inject(PLATFORM_ID) private _platformId: Object,
    private _activatedRoute: ActivatedRoute,
    private _base64BinaryService: Base64BinaryService,
    private _customizeService: CustomizeService,
    private _dropboxService: DropboxService,
    private _imageService: ImageService,
    private _mainService: MainService,
    private _router: Router,
    private _shopifyService: ShopifyService,
    private _store: Store<AppState>,
    private _textService: TextService,
  ) {
    this.activePreviewImageIndex = 0;
    this.imageWidth = 100;
    this.isPreparingCheckout = false;
    this.windowHeight = this._mainService.getWindowHeight();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = this._mainService.getWindowHeight();
  }

  ngOnInit() {
    this.previewImageUrls = this._imageService.getPreviewImageUrls();
    this.currentYear = new Date().getFullYear();
    this.showHint$ = this._customizeService.showHint$;

    this._initNicheImages();
    this._initProductDetailsFromShopify();
    this._initReviews();
    this._initVariantsFromShopify();
    this._setCaseImage();
  }

  /**
   * Handles image changes.
   * Prepares the image and opens the image cropper.
   */
  fileChangeEvent(event: any) {
    if (event.target.files.length === 0) {
      return;
    }

    this._mainService.showLoader('Preparing image');

    let fileReader = new FileReader();

    const img = event.target.files[0];

    fileReader.readAsArrayBuffer(img);

    fileReader.onload = (e) => {
      // If the image is large, notify the customer so the longer processing time is expected.
      if (e.total > 5000000) {
        this._mainService.showLoader('Preparing image \n\nThis could take a minute for large images');
      } else {
        this._mainService.showLoader('Preparing image');
      }

      this._imageService.prepareImage(img).subscribe((res: any) => {
        const data = res.data;

        event.target.value = '';
        this._imageService.setImageUrl(`data:image/${data.format};base64,${data.base64}`);
        
        this.openCropper();
      });
    };
  }

  /**
   * Navigates to the /crop route.
   */
  openCropper() {
    if (this._imageService.getImageUrl().getValue() === '') {
      return;
    }

    this._mainService.showLoader();

    this._router.navigate(['/crop']);
  }

  /**
   * Navigates to the /text route.
   */
  openText() {
    if (this._imageService.getImageUrl().getValue() === '') {
      return;
    }

    this._mainService.showLoader('Loading');

    this._router.navigate(['/text']);
  }

  /**
   * Sets the preview image width to emulate zooming in or out.
   */
   zoomInOut() {
    if (this.imageWidth === 100) {
      this.imageWidth += 100;
    } else {
      this.imageWidth -= 100;
    }
  }

  /**
   * Increments the active preview image index.
   */
  moveRight() {
    if (this.imageWidth !== 100) {
      this.imageWidth = 100;
    }

    ++this.activePreviewImageIndex;

    if (this.activePreviewImageIndex > this.previewImageUrls.length - 1) {
      this.activePreviewImageIndex = 0;
    }
  }

  /**
   * Decrements the active preview image index.
   */
  moveLeft() {
    if (this.imageWidth !== 100) {
      this.imageWidth = 100;
    }

    --this.activePreviewImageIndex;

    if (this.activePreviewImageIndex < 0) {
      this.activePreviewImageIndex = this.previewImageUrls.length - 1;
    }
  }

  /**
   * Opens and scrolls down to the reviews.
   */
  scrollToReviews() {
    this.expansionReviews.open();
    
    setTimeout(() => {
      this._document.getElementById('expansion-reviews').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }, 400);
  }

  /**
   * Processes the checkout.
   */
  async checkout() {
    this.isPreparingCheckout = true;

    // Clear the PayPal order number, if there is one.
    sessionStorage.removeItem('sc-paypal-order-number');

    if (this._imageService.getBgImage().getValue() === null) {
      alert('Please choose your own photo.');
      
      this._document.getElementById('main').scrollTo(0, 0);

      this.isPreparingCheckout = false;

      return false;
    }

    const printFile = this._imageService.getPrintFile();
    const arrayBuffer = this._base64BinaryService.decodeArrayBuffer(printFile);
    const filename = random(10);

    // Upload the print file to Dropbox.
    this._dropboxService.uploadFile(filename, arrayBuffer).subscribe((res: any) => {
      // Create the Shopify checkout.
      this._shopifyService.createCheckout(this.previewImageUrls[0].getValue(), this.variantsSubject.getValue()[this.selectedVariantId].id, filename) .then((checkout: any) => {
        this._store.dispatch(checkoutActions.create({
          data: checkout.data,
          image: checkout.image,
        }));

        this._router.navigate(['/checkout']);
      }).catch((err: any) => {
        this.isPreparingCheckout = false;
        console.error(err);
        return alert('There was an error checking out. Please contact us or try again later.');
      });
    }, (err: any) => {
      console.error(err);
      return alert('There was an error checking out. Please contact us or try again later.');
    });
  }

  /**
   * Initializes the initial preview image, matching the targetted niche.
   */
   private _initNicheImages() {
    const productNiche = this._activatedRoute.snapshot.params['niche'];

    if (productNiche) {
      this.previewImageUrls[0].next(`products/${productNiche}/1.jpg`);
      this.previewImageUrls[1].next(`products/${productNiche}/2.jpg`);
    }
  }
  
  /**
   * Initializes the product details as stored in Shopify.
   */
  private _initProductDetailsFromShopify() {
    if (isPlatformBrowser(this._platformId)) {
      if (!sessionStorage.getItem('sc-product')) {
        this._shopifyService.getProduct().then((resp: any) => {
          this.productSubject.next(resp);
          sessionStorage.setItem('sc-product', JSON.stringify(resp));
        });
      } else {
        this.productSubject.next(JSON.parse(sessionStorage.getItem('sc-product')));
      }
    }
  }

  /**
   * Initializes the reviews.
   */
  private _initReviews() {
    if (isPlatformBrowser(this._platformId)) {
      if (!sessionStorage.getItem('sc-reviews')) {
        this._customizeService.getReviews().subscribe((resp: any) => {
          this.reviewsSubject.next(resp);
          sessionStorage.setItem('sc-reviews', JSON.stringify(resp));
        });
      } else {
        this.reviewsSubject.next(JSON.parse(sessionStorage.getItem('sc-reviews')));
      }
    }
  }

  /**
   * Initializes the variants as stored in Shopify.
   */
  private _initVariantsFromShopify() {
    if (isPlatformBrowser(this._platformId)) {
      if (!sessionStorage.getItem('sc-variants')) {
        this._shopifyService.getProduct().then((product) => {
          this.variantsSubject.next(product.variants);
          this.selectedVariantId = 0;
          sessionStorage.setItem('sc-variants', JSON.stringify(product.variants));
        });
      } else {
        this.variantsSubject.next(JSON.parse(sessionStorage.getItem('sc-variants')));
        this.selectedVariantId = 0;
      }
    }
  }

  /**
   * Sets the preview image.
   */
  private _setCaseImage() {
    // If the background image or text is updated.
    if (isPlatformBrowser(this._platformId)) {
      if (!window.history.state) {
        return;
      }
      
      const isUpdated = window.history.state.updated;

      // If the state is updated, update the default preview image with the customer's personalized version.
      if (isUpdated) {
        if (this._imageService.getBgImage().getValue() !== '') {
          this._mainService.showLoader('Creating preview');
        }

        this._imageService.generatePreviews(
          this._imageService.getCroppedImage().getValue(),
          this._imageService.getImageStyle(),
          this._textService.getTextData(),
          this._textService.getTextImageUrl(),
          this._textService.getIsTextHidden(),
        ).subscribe((res: any) => {
          const data = res.data;

          for (let i = 0; i < res.data.previewImages.length; ++i) {
            this._imageService.setPreviewImageUrl(i, `data:image/${data.previewImages[i].format};base64,${data.previewImages[i].base64}`);
          }

          this._imageService.setPrintFile(`${data.printFile.base64}`);
          this._imageService.setBgImage(`data:image/${data.bgImage.format};base64,${data.bgImage.base64}`);
          
          this._mainService.hideLoader();
        }, (err: any) => {
          console.error(err);
        });
      }
    }
  }
}
