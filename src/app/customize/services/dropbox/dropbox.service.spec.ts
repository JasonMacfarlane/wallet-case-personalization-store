import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DropboxService } from './dropbox.service';

describe('DropboxService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: DropboxService = TestBed.inject(DropboxService);
    expect(service).toBeTruthy();
  });
});
