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

function objectsEquivalent(left, right) {
  if (typeof left !== typeof right) {
    return false;
  }

  const leftProps = Object.keys(left);
  const rightProps = Object.keys(right);

  if (leftProps.length != rightProps.length) {
      return false;
  }

  return leftProps.every(function (propName) {
    return left[propName] === right[propName];
  });
}

function nodesEquivalent(left, right) {

  // Each node has seven values:
  // {
  //  "type": "string",
  //  "children": "object",
  //  "data": "object",
  //  "position": "object", (doesn't matter)
  //  "tagName": "string",
  //  "properties": "object",
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
    if (!objectsEquivalent(left.properties, right.properties)) {
      return false;
    }
  }

  if (!(left.data === undefined && right.data === undefined)) {
    if (!objectsEquivalent(left.data, right.data)) {
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
