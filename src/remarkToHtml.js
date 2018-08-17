const RedactableMarkdownParser = require('@code-dot-org/redactable-markdown/src/redactableMarkdownParser');

const remarkParser = RedactableMarkdownParser.create();

/**
 * By default, and as per markdown standards, redactable markdown will not treat
 * XML blocks as top-level blocks, but will instead wrap all of them in
 * paragraph tags if they are not already in a paragraph.
 *
 * Unfortunately, we actually leverage that property of marked to allow us to
 * visually differentiate between inline and regular embedded Blockly blocks:
 * https://github.com/code-dot-org/code-dot-org/blob/9aed16a2e6b8aeaf3c97e6959f3ec62c61356024/apps/src/templates/instructions/utils.js#L76
 *
 * If we change how that's done, we can take away this plugin.
 */
const xmlAsTopLevelBlock = function () {
  this.Parser.prototype.options.blocks.push('xml');
}

const stripStyles = function () {
  const visitors = this.Compiler.prototype.visitors;
  const originalHtml = visitors.html;
  visitors.html = function (node, parent) {
    const originalResult = originalHtml.call(this, node, parent);
    return originalResult.indexOf('<style>') !== -1 ? '' : originalResult;
  }
}

const expandableImages = function () {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const originalImage = tokenizers.link;
  tokenizers.link = function (eat, value, silent) {
    const link = originalImage.call(this, eat, value, silent);
    if (link && link.type === "image" && link.alt && link.alt.endsWith("expandable")) {
      link.type = "span";
      link.data = {
        hName: 'span',
        hProperties: {
          dataUrl: link.url,
          className: "expandable-image"
        }
      }
      link.children = [{
        type: 'text',
        value: link.alt.substr(0, -1 * "expandable".length).trim()
      }];
    }

    return link;
  }
  tokenizers.link.locator = originalImage.locator;
}

remarkParser.parser.use([
  xmlAsTopLevelBlock,
  expandableImages
]);

remarkParser.compilerPlugins.push(stripStyles);

module.exports = function remarkToHtml (source) {
  return remarkParser.sourceToHtml(source);
}
