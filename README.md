# Angular2-Xmlrpc

An Angular (9+) service which provides XML-RPC communication methods.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.6. Dependencies are requiring Angular 9, but this can probably be easily adapted to anything greater or equal to Angular 2.

This is actually a port from the AngularJS library [Angular-Xmlrpc](https://github.com/ITrust/angular-xmlrpc). **NOTE**: IE support has been dropped altogether.

Installation
------------

    npm install angular2-xmlrpc --save


How to use it ?
---------------

First of all, add a dependency in your module:
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
export class AppModule { }
```
You can use it in your application as any other service, and inject it in the constructor as usual.
``` typescript
import { XmlrpcService } from 'angular2-xmlrpc'

constructor(..., private xmlrpc:XmlrpcService, ...) {
}
```
There is only one main method to call an XML-RPC method. In order to pass parameters, you have to wrap them in an array:
``` typescript
const xmlrpcCall = this.xmlrpc.callMethod(
  'http://localhost:8080/xmlrpc/endpoint',
  'method-name',
  ['string-param-1', 1, {'obj-param-3': {val1: 1, val2: 'x'}}]
)
```
The XML response from the server is wrapped in an `Observable`, and can be parsed to a JS object with the `parseResponse` method:
``` typescript
xmlrpcCall.subscribe(data => console.log(this.xmlrpc.parseResponse(data)))
```
