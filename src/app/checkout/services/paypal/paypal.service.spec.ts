import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PayPalService } from './paypal.service';

describe('PayPalService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: PayPalService = TestBed.inject(PayPalService);
    expect(service).toBeTruthy();
  });
});
