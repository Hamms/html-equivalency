/**
 * create a markdown renderer using marked identical to that defined in
 * https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/util/StylelessRenderer.js
 */
const marked = require('marked');

const EXPANDABLE = 'expandable';

/**
 * Create a customized markdown renderer.
 *
 * @param {Object} options
 * @param {boolean} options.stripStyles Remove <style> tags that were included
 *   in the markdown
 * @param {boolean} options.expandableImages Replace images that have the word
 *   "expandable" at the end of their alt-text with a span tag. The span will
 *   have the class "expandable-image" and the image url will be in a data
 *   field.
 */
function makeRenderer(options={}) {
  const renderer = new marked.Renderer();
  if (options.stripStyles) {
    renderer.html = function (html) {
      return html.indexOf('<style>') !== -1 ? '' : html;
    };
  }
  if (options.expandableImages) {
    renderer.normalImage = renderer.image;
    renderer.image = function (href, title, text) {
      if (!text.endsWith(EXPANDABLE)) {
        return renderer.normalImage(href, title, text);
      }

      text = text.substr(0, -1 * EXPANDABLE.length).trim();
      return `<span data-url="${href}" class="expandable-image">${text}</span>`;
    };
  }
  return renderer;
}

const renderer = makeRenderer({stripStyles: true, expandableImages: true});

module.exports = function markedToHtml (source) {
  return marked(source, { renderer });
}
