import ltx from 'ltx'

const Element = ltx.Element

// TODO ltx PR for null/undefined children
ltx.createElement = function createElement (name, attrs /*, child1, child2, ...*/) {
  var el = new Element(name, attrs)

  for (var i = 2; i < arguments.length; i++) {
    const child = arguments[i]
    if (child instanceof Element || typeof child === 'string') {
      el.cnode(child)
    }
  }

  return el
}

export {Element}

export const {parse} = ltx

export default ltx
