const equivalencies = require('./data/equivalent.json');
const nonEquivalencies = require('./data/nonEquivalent.json');
const recursivelyProcessAll = require('@code-dot-org/redactable-markdown/src/utils/misc').recursivelyProcessAll;

const compare = require("../src/index");

const test = require('tape');

test('equivalencies', function (t) {
  recursivelyProcessAll(function (source) {
    t.test(source, function (st) {
      st.plan(1)
      const result = compare(source);
      st.equal(result, undefined)
    });
  }, equivalencies);
  t.end()
});

test("non-equivalencies", function (t) {
  recursivelyProcessAll(function (source) {
    t.test(source, function (st) {
      st.plan(1)
      const result = compare(source);
      st.notEqual(result, undefined);
    });
  }, nonEquivalencies);
  t.end()
});
