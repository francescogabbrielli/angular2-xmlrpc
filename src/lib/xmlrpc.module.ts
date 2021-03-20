import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { XmlrpcService } from './xmlrpc.service';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: []
})
export class XmlrpcModule {}
