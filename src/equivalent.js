const rehype = require('rehype-parse');
const unified = require('unified');

const htmlToHast = function (html) {
  return unified().use(rehype, {
    fragment: true
  }).parse(html)
}

module.exports = function htmlEquivalent(left, right) {
  return treesEquivalent(
    htmlToHast(left),
    htmlToHast(right)
  );
}

function treesEquivalent(left, right) {
  const leftString = JSON.stringify(left);
  const rightString = JSON.stringify(right);
  return leftString === rightString;
}
