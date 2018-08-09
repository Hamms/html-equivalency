const markedToHtml = require('./markedToHtml');
const remarkToHtml = require('./remarkToHtml');

const ioUtils = require('@code-dot-org/redactable-markdown/src/utils/io');
const recursivelyProcessAll = require('@code-dot-org/redactable-markdown/src/utils/misc').recursivelyProcessAll;

const htmlEquivalent = require('./equivalent');

const compare = function (source) {
  const markedResult = markedToHtml(source);
  const remarkResult = remarkToHtml(source);
  if (!htmlEquivalent(markedResult, remarkResult)) {
    return {
      marked: markedResult,
      remark: remarkResult
    }
  }
}

const compareAll = function (data) {
  return recursivelyProcessAll(compare, data)
}

module.exports = compare;

const deleteEmptyObjects = function (data) {
  Object.keys(data).forEach(function (key) {
    if (data[key] === undefined) {
      delete data[key];
    } else if (typeof data[key] === 'object') {
      deleteEmptyObjects(data[key]);
      if (Object.keys(data[key]).length === 0) {
        delete data[key];
      }
    }
  });

  return data;
}

ioUtils.readFromFileOrStdin(process.argv[2])
  .then(ioUtils.parseAsSerialized)
  .then(compareAll)
  .then(deleteEmptyObjects)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, process.argv[3]));
