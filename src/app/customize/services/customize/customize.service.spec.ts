import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CustomizeService } from './customize.service';

describe('CustomizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: CustomizeService = TestBed.inject(CustomizeService);
    expect(service).toBeTruthy();
  });
});
