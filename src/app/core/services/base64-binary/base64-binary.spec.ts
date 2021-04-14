import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Base64BinaryService } from './base64-binary.service';

describe('Base64BinaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: Base64BinaryService = TestBed.inject(Base64BinaryService);
    expect(service).toBeTruthy();
  });
});
