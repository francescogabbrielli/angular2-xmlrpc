export class NodeNotFoundError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}


export class Helper {
  
  private readonly PREDEFINED_TAG_IGNORES = ['SCRIPT', 'STYLE', 'HEAD', 'IFRAME', 'OBJECT']
  private readonly PREDEFINED_TAG_VALUES:{[index:string]:string} = {IMG:" ", BR:"\n"}

  constructor() {}

  /**
   * Creates an XML document
   */
  createDocument(opt_rootTagName:string, opt_namespaceUri?:string):Document {
    if (opt_namespaceUri && !opt_rootTagName)
      throw Error("Can't create document with namespace and no root tag");
    if (document.implementation && document.implementation.createDocument)
      return document.implementation.createDocument(opt_namespaceUri || '', opt_rootTagName || '', null);
    throw Error('Your browser does not support creating new documents');
  }

  /**
   * Creates a XML node and set the child(ren) node(s)
   */
  createNode(doc:Document, nodeName:string, children?:any):Element {
    let elt = doc.createElement(nodeName);
    let typeOf = (obj:Object) => Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
    let appendChild = (child:any) => {
      if(typeOf(child) === 'object' && child.nodeType !== 1) {
        for(let i in child)
          elt.appendChild((typeof child[i] == 'string') ? doc.createTextNode(child[i]) : child[i]);
      } else {
        elt.appendChild((typeof child == 'string') ? doc.createTextNode(child) : child);
      }
    }
    if (children) {
      if (Array.isArray(children))
        children.forEach(appendChild);
      else
        appendChild(children);
    }
    return elt;
  }

  /**
   * Generate an ID for XMLRPC request
   */
  generateId():string {
      return 'xmlrpc-'+(new Date().getTime())+'-'+Math.floor(Math.random()*1000);
  }

  /**
   * Creates an XML document from a string
   */
  loadXml(xml:string):XMLDocument {
    if (typeof DOMParser != 'undefined')
      return new DOMParser().parseFromString(xml, 'application/xml')
    throw Error('Your browser does not support loading xml documents')
  }

  private getProperty(obj:any, prop:string) {
    return obj[prop]
  }

  private getOwnerDocument(node:Node):Document {
    return (node.nodeType == 9 ? node : node.ownerDocument) as Document
  }

  /**
   * Return a single node with the given name in the given node
   */
  selectSingleNode(node:Node, path:string):Node {
    const doc = this.getOwnerDocument(node)
    if (document.implementation.hasFeature('XPath', '3.0')) {
      const resolver = doc.createNSResolver(doc.documentElement)
      const result = doc.evaluate(path, node, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      if (result.singleNodeValue)
        return result.singleNodeValue
    }
    throw new NodeNotFoundError('Node not found: ' + path)
  }

  /**
   * Returns the string content of a node
   */
  getTextContent(node:Node, normalizedWhitespace?:boolean):string {
    const buf:string[] = []
    if (node.nodeName in this.PREDEFINED_TAG_IGNORES) {
        // ignore certain tags
    } else if (node.nodeType == 3) {
      if (normalizedWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''))
      } else {
        buf.push(node.nodeValue || '')
      }
    } else if (node.nodeName in this.PREDEFINED_TAG_VALUES) {
      buf.push(this.PREDEFINED_TAG_VALUES[node.nodeName])
    } else {
      let child = node.firstChild
      while (child) {
        buf.push(this.getTextContent(child, normalizedWhitespace))
        child = child.nextSibling
      }
    }
    return buf.join('')
  }

  /**
   * Returns all the nodes in a array that are inside the given node with the given path
   */
  selectNodes(node:Node, path:string):Node[] {
    const doc = this.getOwnerDocument(node)
    if (document.implementation.hasFeature('XPath', '3.0')) {
      const resolver = doc.createNSResolver(doc.documentElement)
      const nodes = doc.evaluate(path, node, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      const results:Node[] = []
      for (let i=0; i<nodes.snapshotLength; i++)
        results.push(nodes.snapshotItem(i) as Node);
      return results
    }
    return []
  }

}
