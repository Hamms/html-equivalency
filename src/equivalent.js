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

const allWhitespace = RegExp("^\\s*$");

const sanitize = function (node) {
  if (node.tagName === "img") {
    // empty alt attributes should be ignored
    if (node.properties && node.properties.alt === "") {
      delete node.properties.alt
    }

    // urls should be decoded (really we just want them to be standardized, but
    // decoding a decoded URI is a noop, whereas encoding an encoded URI will
    // double-encode it, so we standardize on decoded)
    if (node.properties && node.properties.src) {
      try {
        node.properties.src = decodeURI(node.properties.src);
      } catch (e) {
        // Ignore malformed URIs; these are probably just template strings
      }
    }
  }

  // marked generates ids for its headers; ignore those
  for (let i = 1; i < 7; i++) {
    if (node.tagName === "h" + i) {
      if (node.properties && node.properties.id) {
        delete node.properties.id;
      }
    }
  }

  if (node.tagName === "a") {
    // urls should be properly decoded
    if (node.properties && node.properties.href) {
      try {
        node.properties.href = decodeURI(node.properties.href);
      } catch (e) {
        // Ignore malformed URIs; these are probably just template strings
      }
    }
  }

  if (node.type === "root" && node.children && node.children.length) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      // some top-level nodes shouldn't be children of paragraphs
      if (
        child.tagName === 'p' &&
        child.children.length === 1 &&
        [
          'img',
          'br'
        ].includes(child.children[0].tagName)
      ) {
        node.children[i] = child.children[0];
      }
    }
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];

      // text nodes containing just whitespace are irrelevant
      if (child.type === "text" && allWhitespace.test(child.value)) {
        node.children.splice(i, 1);
        i--;
      }

      // spans should always be children of paragraphs
      if (child.tagName === "span" && node.tagName !== "p") {
        node.children[i] = {
          children: [child],
          properties: {},
          tagName: "p",
          type: "element",
        }
      }
    }
  }

  if (node.type === "text") {
    // Normalize whitespace.
    // According to https://www.w3.org/TR/css-text-3/#collapse:
    // 1. all spaces and tabs immediately before and after a line break are ignored
    node.value = node.value.replace(/[ \t]*([\n\r]+)[ \t]*/g, "$1");
    // 2. all tab characters are handled as space characters
    node.value = node.value.replace(/\t/g, " ");
    // 3. line breaks are converted to spaces
    node.value = node.value.replace(/[\n\r]/g, " ");
    // 4. any space immediately following another space is ignored
    node.value = node.value.replace(/ {2}/g, " ");
    // 5. sequences of spaces at the beginning and end of a line are removed
    node.value = node.value.replace(/^ */g, "");
    node.value = node.value.replace(/ *$/g, "");
  }

  if (node.properties) {
    Object.keys(node.properties).forEach(function(property) {
      const value = node.properties[property];
      if (value === "" || value === null){
        delete node.properties[property];
      }
    });
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
