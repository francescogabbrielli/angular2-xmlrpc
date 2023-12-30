import { Helper } from './helper'

type Converter = (doc:Document, input:any) => Node

export class Js2xml {

  helper:Helper

  private readonly js2xmlMethod:{[index:string]:Converter} = {
    'nil': this.null2xml,
    'string': this.string2xml,
    'number': this.number2xml,
    'boolean': this.boolean2xml,
    'array': this.array2xml,
    'object': this.struct2xml,
    'date': this.date2xml,
    'uint8array': this.uint8array2xml,
  }

  constructor(helper:Helper) {
    this.helper = helper
  }

  /**
   * Convert Null to XmlRpc valid value (as xml element)
   */
  private null2xml(doc:Document, input:any):Node {
    return this.helper.createNode(doc, 'nil');
  }

  /**
   * Convert a string to a valid xmlrpc value (as xml element).
   */
  private string2xml(doc:Document, input:string):Node {
    return this.helper.createNode(doc, 'string', input);
  }

  /**
   * Convert a number to a valid xmlrpc value (as xml element).
   */
  private number2xml(doc:Document, input:number):Node {
    let type  = 'int'
    let value = parseInt(''+input)
    const f   = parseFloat(''+input)
    if (value != f) {
        type  = 'double';
        value = f;
    }
    return this.helper.createNode(doc, type, value.toString());
  }

  /**
   * Convert a boolean to a valid xmlrpc value (as xml element).
   */
  private boolean2xml(doc:Document, input:boolean):Node {
    return this.helper.createNode(doc, 'boolean', (input ? '1' : '0'));
  }

  /**
   * Convert an Array object to a valid xmlrpc value (as xml element).
   */
  private array2xml(doc:Document, input:any[]):Node {
    const elements:Node[] = [];
    for (let i=0; i < input.length; i++)
      elements.push(this.convert(doc, input[i]));
    return this.helper.createNode(doc, 'array',
      this.helper.createNode(doc, 'data', elements));
  }

  /**
   * Convert an object to a valid xmlrpc value (as xml element).
   */
  private struct2xml(doc:Document, input:Object):Node {
    const elements:Node[] = []
    let k: keyof typeof input;
    for (k in input) {
      elements.push(
        this.helper.createNode(doc, 'member',
          [this.helper.createNode(doc, 'name', k), this.convert(doc, input[k])]))
    }
    return this.helper.createNode(doc, 'struct', elements)
  }

  /**
   * Convert a DateTime object to a valid xmlrpc value (as xml element).
   */
  private date2xml(doc:Document, input:Date):Node {
    const str = [
      input.getFullYear(),
      (input.getMonth() + 1 < 10)? '0' + (input.getMonth() + 1):input.getMonth() + 1,
      (input.getDate() < 10)? '0' + (input.getDate()):input.getDate(),
      'T',
      (input.getHours() < 10)? '0' + (input.getHours()):input.getHours(), ':',
      (input.getMinutes() < 10)? '0' + (input.getMinutes()):input.getMinutes(), ':',
      (input.getSeconds() < 10)? '0' + (input.getSeconds()):input.getSeconds()
    ]
    return this.helper.createNode(doc, 'dateTime.iso8601', str.join(''))
  }

  /**
   * Convert a typed array to base64 xml encoding
   */
  private uint8array2xml(doc:Document, input:any[]):Node {
    const base64 = btoa(String.fromCharCode.apply(null, input))
    return this.helper.createNode(doc, 'base64', base64)
  }

  /**
   * Convert a javascript object to a valid xmlrpc value (as xml element).
   */
  convert(doc:Document, input:any):Node {
    const type = input!==null && (typeof input!=="undefined") ?
        Object.prototype.toString.call(input).slice(8, -1).toLowerCase() : 'nil'
    let method = this.js2xmlMethod['string']
    try {
      method = this.js2xmlMethod[type]
    } catch(e) {
      console.log(e)
    }
    return this.helper.createNode(doc, 'value', method.call(this, doc, input))
  }

}
