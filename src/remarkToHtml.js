const RedactableMarkdownParser = require('@code-dot-org/redactable-markdown/src/redactableMarkdownParser');

const remarkParser = RedactableMarkdownParser.create();

module.exports = function remarkToHtml (source) {
  return remarkParser.sourceToHtml(source);
}
