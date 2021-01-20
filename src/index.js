const ioUtils = require("@code-dot-org/redactable-markdown/src/utils/io");
const recursivelyProcessAll = require("@code-dot-org/redactable-markdown/src/utils/misc")
  .recursivelyProcessAll;

const htmlEquivalent = require("./equivalent");

const findNonEquivalent = recursivelyProcessAll.bind(null, (left, right) => {
  const result = htmlEquivalent(left, right);

  if (result === true) {
    return null;
  } else {
    return {
      left,
      right,
      result
    };
  }
});

const deleteEmptyObjects = data =>
  Object.entries(data).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return acc;
    }

    if (typeof value === "object") {
      value = deleteEmptyObjects(value);
      if (Object.keys(value).length === 0) {
        return acc;
      }
    }

    acc[key] = value;
    return acc;
  }, {});

if (process.argv.length < 4) {
  console.error(
    [
      "usage: node index.js SOMEFILE.json ANOTHERFILE.json [OUTPUTFILE.json]",
      "The structure of the content in the two input files must be identical, and the ultimate values must all be HTML strings.",
      "Any HTML strings in the two input files that parse into NON-EQUIVALENT HTML will be output to the output file if specified, or stdout if not"
    ].join("\n\n")
  );
  process.exit();
}

Promise.all([
  ioUtils.readFromFileOrStdin(process.argv[2]).then(ioUtils.parseAsSerialized),
  ioUtils.readFromFileOrStdin(process.argv[3]).then(ioUtils.parseAsSerialized)
])
  .then(findNonEquivalent)
  .then(deleteEmptyObjects)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, process.argv[4]));
