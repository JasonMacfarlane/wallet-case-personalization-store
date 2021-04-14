import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { MainService } from './core/services/main/main.service';

import { SnackbarComponent } from './shared/components/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isRoot = true;
  title = '';

  showLoaderSubject = new BehaviorSubject<boolean>(false);
  loaderMessageSubject = new BehaviorSubject<string>('');
  
  constructor(
    @Inject(DOCUMENT) private document: any,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private mainService: MainService,
    private router: Router,
    private snackBar: MatSnackBar,
    private titleService: Title,
  ) { }

  ngOnInit() {
    this._initLoader();
    this._initRouteChange();
    this._initSnackbar();
  }

  /**
   * Go to next component.
   */
  next() {
    this.mainService.nextComponent();
  }

  /**
   * Close the component.
   */
  close() {
    this.mainService.closeComponent();
  }

  /**
   * Initializes the component loader.
   */
  private _initLoader() {
    this.mainService.showLoader$.subscribe((val) => {
      this.showLoaderSubject.next(val);
      this.cd.detectChanges();
    });

    this.mainService.loaderMessage$.subscribe((val) => {
      this.loaderMessageSubject.next(val);
      this.cd.detectChanges();
    });
  }

  /**
   * Initializes the route change.
   */
  private _initRouteChange() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }

        return route;
      }),
      mergeMap((route) => route.data)
    ).subscribe((data) => {
      this.isRoot = data.isRoot;
      this.title = data.title;
      this.titleService.setTitle(`${data.title}`);
      this.document.getElementById('main').scrollTo(0, 0);
    });
  }

  /**
   * Initializes the snackbar.
   */
  private _initSnackbar() {
    this.mainService.snackBar$.subscribe((data) => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: { isError: data.isError, message: data.message },
        duration: 5000,
        verticalPosition: 'top',
      });
    });
  }
}
