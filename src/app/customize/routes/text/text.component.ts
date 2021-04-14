import { ChangeDetectorRef, ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { FocusMonitor } from '@angular/cdk/a11y';

import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators'

import { fabric } from 'fabric';

import { MainService } from '../../../core/services/main/main.service';

import { ImageService } from '../../services/image/image.service';
import { TextService }  from '../../services/text/text.service';

interface TextData {
  angle: number;
  bg: {
    color: string,
    padding: number;
    position: { left: number, top: number },
    radius: number,
  };
  position: { x: number, y: number },
  text: {
    color: string,
    font: string;
    size: number;
    value: string;
  };
}

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent implements OnInit {
  @ViewChild('image', { static: true })
  image: ElementRef;

  private _bounds: any;
  private _canvas: any;
  private _enableTextEditing = false;
  private _group: any;

  private readonly _canvasHeight: number;
  private readonly _canvasWidth: number;
  private readonly _groupPadding: number;

  readonly fontSizeMin = 10;
  readonly fontSizeMax = 60;

  private _fontSizeDefault: number;

  activeTab: string;
  backupObject: any;
  isTextHidden: boolean;
  textData: TextData;
  windowHeight: string;

  // The image URL (base64).
  imageUrl: string;

  private _closeSubscription: Subscription;
  private _nextSubscription: Subscription;

  constructor(
    private _cdRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    public _imageService: ImageService,
    public _mainService: MainService,
    private _matBottomSheet: MatBottomSheet,
    private _router: Router,
    public _textService: TextService,
  ) {
    this._canvasHeight = 2114;
    this._canvasWidth = 1229;
    this._groupPadding = 5;

    this.activeTab = 'text';
    this.backupObject = null;
    this.isTextHidden = false;
    this.windowHeight = this._mainService.getWindowHeight();

    this.imageUrl = this._imageService.getBgImage().getValue();

    if (this.imageUrl === null) {
      this._router.navigate(['/']);
    }

    this._closeSubscription = this._mainService.closeComponent$.pipe(first()).subscribe(() => {
      this.close();
    });

    this._nextSubscription = this._mainService.nextComponent$.pipe(first()).subscribe(() => {
      this.saveText();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = this._mainService.getWindowHeight();
  }

  ngOnInit() {
    this._textService.loadFonts(() => {
      const data = this._textService.getTextData();

      this.textData = this._scaleTextData(data, true);
      this._cdRef.detectChanges();

      this._fontSizeDefault = this.textData.text.size;

      this._buildCanvas();

      this._mainService.hideLoader();
    });

    this._textService.setIsTextHidden(false);
    this.isTextHidden = false;
  }

  ngOnDestroy() {
    this._closeSubscription.unsubscribe();
    this._nextSubscription.unsubscribe();
  }

  /**
   * Opens the font sheet.
   * @param {any} e event
   */
  openFontSheet(e: any) {
    const btn = e.target;
    const value = this.textData.text.value;

    this._focusMonitor.stopMonitoring(btn);

    this._matBottomSheet.open(MenuFontComponent, { data: { value: value } });
  }

  /**
   * Opens the text color sheet.
   * @param {any} e event
   */
  openTextColorSheet(e: any) {
    const btn = e.target;
    const value = this.textData.text.value;
    const fontFamily = this.textData.text.font;

    this._focusMonitor.stopMonitoring(btn);

    this._matBottomSheet.open(MenuTextColorComponent, { data: { value: value, fontFamily: fontFamily } });
  }

  /**
   * Opens the background color sheet.
   * @param {any} e event
   */
  openBgColorSheet(e: any) {
    const btn = e.target;
    const value = this.textData.text.value;
    const fontFamily = this.textData.text.font;
    const color = this.textData.text.color;

    this._focusMonitor.stopMonitoring(btn);

    this._matBottomSheet.open(MenuBgColorComponent, { data: { color: color, value: value, fontFamily: fontFamily } });
  }

  /**
   * Sets the font family.
   * @param {string} fontFamily font family
   */
  setFontFamily(fontFamily: string) {
    this.textData.text.font = fontFamily;

    this._group.set('fontFamily', fontFamily);
    this._canvas.requestRenderAll();
  }

  /**
   * Toggles the text visibility.
   */
  toggleTextVisibility() {
    const isTextHidden = this._textService.getIsTextHidden();

    if (isTextHidden) {
      this._textService.setIsTextHidden(false);
      this._canvas.add(this._group);
    } else {
      this._textService.setIsTextHidden(true);
      this._canvas.remove(this._group);
    }
  }

  /**
   * Updates the font size.
   * @param {any} e event
   */
  updateFontSize(e: any) {
    this.textData.text.size = e.value;
    this._canvas.remove(this._group);

    const newGroup = this._generateGroup(this.textData);
    this._canvas.add(newGroup);
  }

  /**
   * Toggles which side of the case is visible.
   * @param {string} side front or back
   */
  toggleSide(side: string) {
    let img: any;

    for(let obj of this._canvas.getObjects()) {
      if (obj.id === 'image') {
        img = obj;
      }
    }

    switch(side) {
      case 'front':
        img.left = -this._canvas.width;
        break;

      case 'back':
        img.left = 0;
        break;

      default:
        break;
    }

    this._canvas.requestRenderAll();
  }

  /**
   * Saves the text.
   */
  saveText() {
    this._mainService.showLoader();

    const imageHeight = this.image.nativeElement.offsetHeight;
    const printFileHeight = this._canvasHeight;
    const factor = printFileHeight / imageHeight;

    const scaledTextData = this._scaleTextData(this.textData, false);

    const url = this._group.toDataURL({ multiplier: factor });
    this._textService.setTextData(scaledTextData);
    this._textService.setTextImageUrl(url);

    this._router.navigate(['/'], { state: { updated: true } });
  }

  /**
   * Closes the component.
   */
  close() {
    this._router.navigate(['/'], { state: { updated: false } });
  }

  /**
   * Returns the scaled text data.
   * @param {TextData} data text data including angle, background, position and text
   * @param {boolean} scaleDown true if scaling down, false is scaling up
   * @returns scaled text data
   */
  private _scaleTextData(data: TextData, scaleDown: boolean): TextData {
    const imageHeight = this.image.nativeElement.offsetHeight;
    const printFileHeight = this._canvasHeight;
    const factor = printFileHeight / imageHeight;

    const textData = {
      angle: data.angle,
      bg: {
        color: data.bg.color,
        padding: scaleDown ? (data.bg.padding / factor) : (data.bg.padding * factor),
        position: {
          left: scaleDown ? (data.bg.position.left / factor) : (data.bg.position.left * factor),
          top: scaleDown ? (data.bg.position.top / factor) : (data.bg.position.top * factor),
        },
        radius: scaleDown ? (data.bg.radius / factor) : (data.bg.radius * factor),
      },
      position: {
        x: scaleDown ? (data.position.x / factor) : (data.position.x * factor),
        y: scaleDown ? (data.position.y / factor) : (data.position.y * factor),
      },
      text: {
        color: data.text.color,
        font: data.text.font,
        size: scaleDown ? (data.text.size / factor) : (data.text.size * factor),
        value: data.text.value,
      },
    };

    return textData;
  }

  /**
   * Builds the canvas.
   */
  private _buildCanvas() {
    const imageHeight = this.image.nativeElement.offsetHeight;
    const imageWidth = this.image.nativeElement.offsetWidth;

    this._canvas = new fabric.Canvas('c');

    const ratio = this._canvasWidth / this._canvasHeight;

    let canvasHeight: number;
    let canvasWidth: number;

    let objPrevPosition = { left: 0, top: 0 };

    if ((imageHeight / imageWidth) <= ratio) {
      canvasHeight = imageWidth * ratio;
      canvasWidth = imageWidth;
    } else {
      canvasHeight = imageHeight;
      canvasWidth = canvasHeight * ratio;
    }

    this._canvas.setDimensions({
      height: canvasHeight,
      width: canvasWidth,
    });

    fabric.Image.fromURL(this.imageUrl, (img: any) => {
      const image = img.set({
        id: 'image',
        left: -this._canvas.width,
        scaleX: (this._canvas.width / img.width) * 2,
        scaleY: canvasHeight / img.height,
        selectable: false,
      });

      // Build border bounds
      const boundsOuter = new fabric.Rect({
        fill: '#ff0000',
        height: this._canvas.height,
        left: 0,
        opacity: 0,
        originX: 'left',
        originY: 'top',
        selectable: false,
        top: 0,
        width: this._canvas.width,
      });

      const clipPath = new fabric.Rect({
        absolutePositioned: true,
        height: this._canvas.height * 0.810785241249,
        left: this._canvas.width * (0.154597233523 * 1.2),
        selectable: false,
        top: this._canvas.height * 0.095553453169,
        width: this._canvas.width * (0.6834825061 * 0.9),
      });

      const boundsInner = new fabric.Rect({
        absolutePositioned: true,
        fill: 'rgba(0,0,0,0)',
        height: this._canvas.height * 0.810785241249,
        id: 'bounds',
        left: this._canvas.width * (0.154597233523 * 1.2),
        selectable: false,
        top: this._canvas.height * 0.095553453169,
        width: this._canvas.width * (0.6834825061 * 0.9),
      });

      this._bounds = boundsInner;

      clipPath.inverted = true;

      boundsOuter.clipPath = clipPath;

      const group = this._generateGroup(this.textData);

      this._canvas.add(image);
      this._canvas.add(boundsOuter);
      this._canvas.add(boundsInner);

      this._canvas.add(group).setActiveObject(group);
    });

    // Keep text within canvas.
    this._canvas.on('object:moving', (e: any) => {
      const obj = e.target;

      if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
        return;
      }

      obj.setCoords();

      if (obj.getBoundingRect().top < (this._bounds.top - this._groupPadding) ||
        obj.getBoundingRect().left < (this._bounds.left - this._groupPadding)) {
          obj.top = Math.max(obj.top, this._bounds.top);
          obj.left = Math.max(obj.left, this._bounds.left);
      }

      if ((obj.getBoundingRect().top + obj.getBoundingRect().height - this._bounds.top) > (this._bounds.height + this._groupPadding) ||
        (obj.getBoundingRect().left + obj.getBoundingRect().width - this._bounds.left) > (this._bounds.width + this._groupPadding)) {
          obj.top = Math.min(obj.top, this._bounds.height + this._bounds.top + (this._groupPadding * 2) - obj.getBoundingRect().height);
          obj.left = Math.min(obj.left, this._bounds.width + this._bounds.left + (this._groupPadding * 2) - obj.getBoundingRect().width);
      }

      const objectMiddle = obj.left + (obj.width * obj.scaleX) / 2;
      const snapZone = 15;

      if (objectMiddle > ((this._bounds.width) / 2) + this._bounds.left - snapZone &&
        objectMiddle < ((this._bounds.width) / 2) + this._bounds.left + snapZone) {
          obj.set({
            left: ((this._bounds.width) / 2) + this._bounds.left - (obj.width * obj.scaleX) / 2,
        }).setCoords();
      }
    });

    // After object moved.
    this._canvas.on('object:moved', (e: any) => {
      const obj = e.target;

      let textData = this.textData;

      textData.position.x = obj.left;
      textData.position.y = obj.top;

      this.textData = textData;
    });

    // After object rotated.
    this._canvas.on('object:rotated', (e) => {
      const obj = e.target;

      let textData = this.textData;

      textData.angle = obj.angle;

      this.textData = textData;
    });

    this._canvas.on('mouse:down:before', (e) => {
      const obj = e.target;
      const prevSelectedObj = this._canvas.getActiveObject();

      if (!obj || !prevSelectedObj) {
        return;
      }

      if (obj.id === prevSelectedObj.id) {
        this._enableTextEditing = true;
      } else {
        this._enableTextEditing = false;
      }

      objPrevPosition = { left: obj.left, top: obj.top };
    });

    this._canvas.on('mouse:up', (e) => {
      if (e.target === null || e.transform === null || e.transform.action === 'scale') {
        return;
      }

      const obj = e.target;

      if (!obj || obj.group) {
        return;
      }

      const pos = { left: obj.left, top: obj.top };
      const errorPrecision = 3;

      if (this._enableTextEditing) {
        if (
          (pos.left < (objPrevPosition.left + errorPrecision) && pos.left > objPrevPosition.left - errorPrecision) &&
          (pos.top < (objPrevPosition.top + errorPrecision) && pos.top > objPrevPosition.top - errorPrecision)
        ) {
          this._enableTextEditing = false;

          const id = obj.id;

          if (id !== 'text') {
            return;
          }

          const textData = this.textData;

          const bg = obj.getObjects()[0];
          const textbox = obj.getObjects()[1];

          this._canvas.remove(obj);

          this._canvas.add(bg);
          this._canvas.add(textbox);

          this._canvas.setActiveObject(textbox);

          obj.set('left', (this._canvas.width / 2) - (obj.width / 2));
          obj.set('top', 30);

          textbox.enterEditing();
          textbox.selectAll();

          textbox.on('editing:exited', () => {
            const group = this._generateGroup(textData);

            this._canvas.remove(bg);
            this._canvas.remove(textbox);

            this._canvas.add(group).setActiveObject(group);
          });
        }
      }
    });

    this._canvas.on('text:changed', (e: any) => {
      const objTextbox = e.target;
      const group = e.target.group;

      let textData = this.textData;
      let bg = null;

      this._canvas.getObjects().forEach((obj: any) => {
        if ((obj.id === objTextbox.id) && (obj.get('type') === 'rect')) {
          bg = obj;
        }
      });

      textData.text.value = objTextbox.text;

      if (bg) {
        bg.height = objTextbox.height + 12;
      }

      this.textData = textData;
    });

    this._textService.fontChange$.subscribe(fontFamily => {
      this.textData.text.font = fontFamily;
      this.textData.text.size = this._fontSizeDefault;
      this._cdRef.detectChanges();
      this._canvas.remove(this._group);

      const group = this._generateGroup(this.textData);

      this._canvas.add(group).setActiveObject(group);
    });

    this._textService.textColorChange$.subscribe(color => {
      const objTextbox = this._group.getObjects()[1];

      let textData = this.textData;

      textData.text.color = color;
      objTextbox.set('fill', color);

      this._canvas.requestRenderAll();
    });

    this._textService.bgColorChange$.subscribe(color => {
      const bgObj = this._group.getObjects()[0];

      let textData = this.textData;

      textData.bg.color = color;
      bgObj.set('fill', color);

      this._canvas.requestRenderAll();
    });
  }

  /**
   * Generates a text group.
   * @param {TextData} textData text data including angle, background, position and text
   * @returns {any} group text group
   */
  private _generateGroup(textData: TextData) {
    const textbox = new fabric.Textbox(textData.text.value, {
      angle: textData.angle,
      fill: textData.text.color,
      fontFamily: textData.text.font,
      fontSize: textData.text.size,
      hasControls: false,
      selectable: false,
      textAlign: 'center',
      width: this._bounds.width - (this._groupPadding * 2),
    });

    const bg = new fabric.Rect({
      angle: textData.angle,
      fill: textData.bg.color,
      height: textbox.height + textData.bg.padding,
      left: textData.bg.position.left,
      originX: 'left',
      originY: 'top',
      rx: textData.bg.radius,
      ry: textData.bg.radius,
      selectable: false,
      top: textData.bg.position.top,
      width: textbox.width + textData.bg.padding,
    });

    const group = new fabric.Group([bg, textbox], {
      angle: textData.angle,
      borderColor: '#fff',
      cornerColor: 'rgba(0,0,0,0)',
      id: 'text',
      left: textData.position.x,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      padding: this._groupPadding,
      top: textData.position.y,
    });

    this._group = group;

    return group;
  }
}

@Component({
  selector: 'menu-font',
  templateUrl: './menu-font.component.html',
})
export class MenuFontComponent implements OnInit {
  fontFamilies: string[];
  textValue: string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: any,
    private _bottomSheetRef: MatBottomSheetRef<MenuFontComponent>,
    private _textService: TextService,
  ) {
    this.textValue = '';
  }

  ngOnInit() {
    this.fontFamilies = this._textService.getFontFamilies();
    this.textValue = this._data.value;
  }

  /**
   * Sets the font family.
   * @param fontFamily font family
   */
  setFontFamily(fontFamily: string) {
    this._textService.emitFontChange(fontFamily);
    this._bottomSheetRef.dismiss();
  }
}

@Component({
  selector: 'menu-text-color',
  templateUrl: './menu-text-color.component.html',
})
export class MenuTextColorComponent implements OnInit {
  colors: string[];
  fontFamily: string;
  textValue: string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: any,
    private _bottomSheetRef: MatBottomSheetRef<MenuTextColorComponent>,
    private _textService: TextService,
  ) {
    this.fontFamily = '';
    this.textValue = '';
  }

  ngOnInit() {
    this.colors = this._textService.getTextColors();
    this.textValue = this._data.value;
    this.fontFamily = this._data.fontFamily;
  }

  /**
   * Sets the text color.
   * @param {string} color text color
   */
  setColor(color: string) {
    this._textService.emitTextColorChange(color);
    this._bottomSheetRef.dismiss();
  }
}

@Component({
  selector: 'menu-bg-color',
  templateUrl: './menu-bg-color.component.html',
})
export class MenuBgColorComponent implements OnInit {
  bgColors: string[];
  color: string;
  fontFamily: string;
  textValue: string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: any,
    private _bottomSheetRef: MatBottomSheetRef<MenuBgColorComponent>,
    private _textService: TextService,
  ) {
    this.fontFamily = '';
    this.textValue = '';
  }

  ngOnInit() {
    this.bgColors = this._textService.getBgColors();
    this.color = this._data.color;
    this.textValue = this._data.value;
    this.fontFamily = this._data.fontFamily;
  }

  /**
   * Sets the background color.
   * @param {string} color background color
   */
  setColor(color: string) {
    this._textService.emitBgColorChange(color);
    this._bottomSheetRef.dismiss();
  }
}
