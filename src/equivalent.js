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

const sanitize = function (node) {
  if (node.tagName === "img") {
    // empty alt attributes should be ignored
    if (node.properties && node.properties.alt === "") {
      delete node.properties.alt
    }
  }

  if (node.children) {
    // text nodes containing just whitespace are irrelevant
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].type === "text" && node.children[i].value === "\n") {
        node.children.splice(i, 1);
        i--;
      }
    }
  }
}

/**
 * Determine if two HAST nodes are equivalent.
 *
 * Each HAST node is an object with potentially seven values of the following
 * types:
 *
 * {
 *  "children": "array",
 *  "data": "object", (doesn't matter)
 *  "position": "object", (doesn't matter)
 *  "properties": "object",
 *  "tagName": "string",
 *  "type": "string",
 *  "value": "string"
 * }
 *
 * Two of those values - 'data' and 'position' - contain meta information about
 * the parsing and are not relevant for purposes of determining equivalence.
 *
 * Two HAST nodes are considered equivalent if all their non-children properties
 * are identical and all their children are equivalent.
 *
 * This is probably basically equivalent to just removing all 'data' and
 * 'position' values recursively throughout the HAST tree and doing a JSON
 * comparision, but it provides the potential for customization.
 *
 * @see https://github.com/syntax-tree/hast#element
 */
function nodesEquivalent(left, right) {
  sanitize(left);
  sanitize(right);

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
    if (JSON.stringify(left.properties) !== JSON.stringify(right.properties)) {
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
