import { Helper } from './helper'

type Converter = (input:Node)=>Object|null

export class Xml2js {

  helper:Helper

  private readonly xml2jsMethod:{[index:string]:Converter} = {
    'nil': (input:Node) => null,
    'string': this.xml2string,
    'base64': this.xml2string,
    'int': this.xml2number,
    'i8': this.xml2number,
    'i4': this.xml2number,
    'double': this.xml2number,
    'boolean': this.xml2boolean,
    'struct': this.xml2struct,
    'array': this.xml2array,
    'datetime': this.xml2datetime,
    'datetime.iso8601': this.xml2datetime
  }

  constructor(helper:Helper) {
    this.helper = helper
  }

  /**
   * Convert an xmlrpc string value (as an xml tree) to a javascript string.
   *
   * @param {!Node} input Xmlrpc string to convert.
   * @return {string} Javascript conversion of input.
   * @protected
   */
  private xml2string(input:Node):string {
      return this.helper.getTextContent(input, false)
  }

  /**
   * Convert an xmlrpc number (int or double) value to a javascript number.
   */
  private xml2number(input:Node):number {
    return parseFloat(this.helper.getTextContent(input))
  }

  /**
   * Convert an xmlrpc boolean value to a javascript boolean.
   */
  private xml2boolean(input:Node):boolean {
      const value = this.helper.getTextContent(input).toLowerCase();
      return value==='1' || value==='true';
  }

  /**
   * Convert an xmlrpc struct value to a javascript object.
   */
  private xml2struct(input:Node):Object {
      const memberNodes = this.helper.selectNodes(input, 'member')
      const obj:{[index:string]:Object} = {}
      for (let i=0; i < memberNodes.length; i++) {
        try {
          let node = this.helper.selectSingleNode(memberNodes[i], 'name')
          const label = this.helper.getTextContent(node)
          node = this.helper.selectSingleNode(memberNodes[i], 'value')
          const val = this.convert(node)
          if (val)
            obj[label] = val
        } catch(e) {
          console.log(e)
        }
      }
      return obj;
  }

  /**
   * Convert an xmlrpc array value to a javascript array.
   */
  private xml2array(input:Node):any[] {
    let valueNodes = this.helper.selectNodes(input, 'data/value');
    if (!valueNodes.length)
      valueNodes = this.helper.selectNodes(input, './value');
    if (!valueNodes.length)
      return [];
    return valueNodes.map(this.convert);
  }

  /**
   * Convert an xmlrpc dateTime value to an itrust.date.DateTime.
   */
  private xml2datetime(input:Node):Date {
      let value = this.helper.getTextContent(input);
      if (!value)
          return new Date();
      if (value[value.length-1]=='T') {
          value = value.substring(0, value.length-1);
      }
      let parts = value.match(/\d+/g);
      if(parts && parts.length>5 && value.indexOf('-') == -1){
          const toSplit = parts[0];
          parts[0] = toSplit.substring(0,4);
          parts.splice(1, 0, toSplit.substring(4,6));
          parts.splice(2, 0, toSplit.substring(6));
          return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(parts[3]),
            parseInt(parts[4]),
            parseInt(parts[5]));
      }
      throw Error("Date error: " + value)
  }

  /**
   * Convert an xmlrpc value (as an xml tree) to a javascript object.
   */
  convert(input:Node):Object|null {
      const elt = this.helper.selectSingleNode(input, './*')
      if (!elt)
          return null

      try {
        return this.xml2jsMethod[elt.nodeName.toLowerCase()].call(this,elt)
      } catch(e) {
        return this.xml2struct(elt)
      }
  }

}
