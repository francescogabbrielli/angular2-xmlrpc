import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing'

import { XmlrpcService } from './xmlrpc.service';

describe('XmlrpcService', () => {
  let service: XmlrpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(XmlrpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
