# Angular2-Xmlrpc

An Angular2+ service which provides XML-RPC communication methods.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.6.

This is actually a port from the AngularJS library [Angular-Xmlrpc](https://github.com/ITrust/angular-xmlrpc). **NOTE**: IE support has been dropped altogether.

Installation
------------

    npm install angular2-xmlrpc --save


How to use it ?
---------------

First of all, add in you application a dependency in your module:
``` typescript
import { XmlrpcModule } from 'angular2-xmlrpc'

@NgModule({
  ...
  imports: [
    ...
    XmlrpcModule
  ],
  ...
})
```
You can use it in your application as any other service, and inject it in the constructor as usual.
``` typescript
import { XmlrpcService } from 'angular2-xmlrpc'

constructor(..., private xmlrpc:XmlrpcService, ...) {
}
```
In order to pass parameters, you have to wrap them in an array:
``` typescript
let xmlrpcCall = this.xmlrpc.callMethod(
  'http://localhost:8080/xmlrpc/endpoint',
  'method-name',
  ['string-param-1', 1, {'obj-param-3': {val1: 1, val2: 'x'}}]
)
```
Response from the server is an `Observable` and can be parsed to a JS object with the `parseResponse` method:
``` typescript
xmlrpcCall.subscribe(data => console.log(this.xmlrpc.parseResponse(data)))
```
