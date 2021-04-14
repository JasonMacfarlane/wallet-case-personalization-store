import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StripeService } from './stripe.service';

describe('StripeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: StripeService = TestBed.inject(StripeService);
    expect(service).toBeTruthy();
  });
});
