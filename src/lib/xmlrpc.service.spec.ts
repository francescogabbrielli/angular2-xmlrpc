import { TestBed } from '@angular/core/testing'
import { HttpRequest } from '@angular/common/http'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

import { XmlrpcService } from './xmlrpc.service'

describe('XmlrpcService', () => {
  let service: XmlrpcService
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [XmlrpcService]
    })
    service = TestBed.inject(XmlrpcService)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should parse XML-RPC response', () => {
    const mockResponse =
      "<?xml version='1.0'?><methodResponse><params><param><value><int>5</int></value></param></params></methodResponse>"
    expect(service.parseResponse(mockResponse)).toEqual(5)
  })

  it('should return param*param', () => {
    const param = Math.floor(Math.random() * Math.floor(10)) + 2
    console.log("PARAM", param)
    const url = 'http://mockaddress'

    const mockResponse =
      "<?xml version=\"1.0\"?><methodResponse><params><param><value><int>" +
      (param * param) +
      "</int></value></param></params></methodResponse>"

    service.callMethod(url, 'square', [param]).subscribe(
      data => {
        console.log("RESPONSE", data)
        expect(service.parseResponse(data)).toEqual(param*param)
      }
    )

    const req = httpTestingController.expectOne((hr: HttpRequest<any>) => {
      expect(hr.url).toBe(url)
      expect(hr.method).toBe('POST')
      expect(service.parseResponse(hr.body)).toEqual(param)
      return true
    })

    req.flush(mockResponse)

    httpTestingController.verify()
  })

})
