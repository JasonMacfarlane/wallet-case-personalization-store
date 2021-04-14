import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ApolloModule } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';

import { CompleteComponent } from './complete.component';

const checkoutSubject = new BehaviorSubject<any>({ email: 'test@email.com' });

describe('CompleteComponent', () => {
  let component: CompleteComponent;
  let fixture: ComponentFixture<CompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ApolloModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [
        CompleteComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteComponent);
    component = fixture.componentInstance;
    component.checkout$ = checkoutSubject.asObservable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
