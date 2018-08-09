const rehype = require('rehype-parse');
const unified = require('unified');

const htmlToHast = function (html) {
  return unified().use(rehype, {
    fragment: true
  }).parse(html)
}

module.exports = function htmlEquivalent(left, right) {
  return nodesEquivalent(
    htmlToHast(left),
    htmlToHast(right)
  );
}

function nodesEquivalent(left, right) {

  // https://github.com/syntax-tree/hast#element
  // Each node has potentially seven values:
  // {
  //  "children": "object",
  //  "data": "object", (doesn't matter)
  //  "position": "object", (doesn't matter)
  //  "properties": "object",
  //  "tagName": "string",
  //  "type": "string",
  //  "value": "string"
  //}

  if (left.type !== right.type) {
    return false;
  }

  if (left.tagName !== right.tagName) {
    return false;
  }

  if (left.value !== right.value) {
    return false;
  }

  if (!(left.properties === undefined && right.properties === undefined)) {
    // use simple JSON equivalence for this, since we don't expect it to be a
    // particularly complex object but it might have nested arrays
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return false;
    }
  }

  const leftChildren = left.children ? left.children.length : 0;
  const rightChildren = right.children ? right.children.length : 0;
  if (leftChildren !== rightChildren) {
    return false;
  }

  if (leftChildren === 0) {
    return true;
  }

  return left.children.every(function (leftChild, i) {
    const rightChild = right.children[i];
    return nodesEquivalent(leftChild, rightChild);
  });
}
