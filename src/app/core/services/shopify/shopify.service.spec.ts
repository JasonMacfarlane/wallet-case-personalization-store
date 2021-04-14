import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ApolloModule } from 'apollo-angular';

import { ShopifyService } from './shopify.service';

describe('ShopifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ApolloModule,
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: ShopifyService = TestBed.inject(ShopifyService);
    expect(service).toBeTruthy();
  });
});
