import ltx from 'ltx'

const Element = ltx.Element

// TODO ltx PR for null/undefined children
ltx.createElement = function createElement (name, attrs /*, child1, child2, ...*/) {
  var el = new Element(name, attrs)

  for (var i = 2; i < arguments.length; i++) {
    if (arguments[i] instanceof Element) {
      el.cnode(arguments[i])
    }
  }

  return el
}

export default ltx
