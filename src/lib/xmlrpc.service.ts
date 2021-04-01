import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { Observable, throwError } from 'rxjs'
import { catchError, retry } from 'rxjs/operators'

import { Helper, NodeNotFoundError } from './helper'
import { Js2xml } from './js2xml'
import { Xml2js } from './xml2js'

@Injectable({
  providedIn: 'root',
})
export class XmlrpcService {

  private readonly helper:Helper
  private readonly js2xml:Js2xml
  private readonly xml2js:Xml2js

  /** HTTP headers */
  private headers:HttpHeaders

  constructor(private http:HttpClient) {
    this.helper = new Helper()
    this.js2xml = new Js2xml(this.helper)
    this.xml2js = new Xml2js(this.helper)
    this.headers = new HttpHeaders()
  }

  /**
   * Serialize a XML document to string.
   */
  private serialize(xml:Document) {
    if (typeof XMLSerializer != 'undefined')
      return new XMLSerializer().serializeToString(xml)
    throw Error('Your browser does not support serializing XML documents')
  }

  /**
   * Creates a xmlrpc call of the given method with given params.
   */
  private createCall(method:string, params:any[]):string {
    const doc = this.helper.createDocument('methodCall')
    doc.firstChild!.appendChild(this.helper.createNode(doc, 'methodName', method))
    if (params && params.length > 0) {
      const paramsNode = this.helper.createNode(doc, 'params')
      for (let i=0; i < params.length; i++)
        paramsNode.appendChild(this.helper.createNode(doc, 'param', this.js2xml.convert(doc, params[i])))
      doc.firstChild!.appendChild(paramsNode)
    }
    const ret = this.serialize(doc)
    return ret.replace(/[\s\xa0]+$/, '')
  }

  /**
   * Call an XML-RPC method
   *
   * @param url the complete URL of the XML-RPC service
   * @param method the method name
   * @param params the array of parameters (arguments)
   * @return an Observable of the result
   */
  callMethod(url:string, method:string, params:any[]):Observable<any> {
    const xmlstr = this.createCall(method, params)
    return this.http.post<any>(url, xmlstr, {
      headers: this.headers,
      observe: 'body',
      responseType: 'text' as 'json'
    })
  }

  /**
   * Parse an xmlrpc response and return the js object.
   *
   * @param response the xmlrpc response (XML)
   * @return
   *  - undefined: for empty response
   *  - null: for 'nil' value
   *  - Object: the value as an Object
   *
   * @throws {@link Error} on fault response (or unexpected server error)
   */
  parseResponse(response:string):Object|null|undefined {
    const doc = this.helper.loadXml(response)
    const rootNode = doc.firstChild
    if (!rootNode)
      return undefined

    let error:boolean = false
    try {
      this.helper.selectSingleNode(rootNode, '//fault')
      error = true
    } catch(e) {
      if (!(e instanceof NodeNotFoundError))
        throw e
    }
    const node = this.helper.selectSingleNode(rootNode, '//value')
    const value = this.xml2js.convert(node)
    if (error)
      throw new Error(String(value))
    return value
  }

  setHeaders(headers: { [name: string]: string | string[] }):HttpHeaders {
    this.headers = new HttpHeaders(headers)
    return this.headers
  }

}
