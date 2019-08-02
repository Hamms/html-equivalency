# html-equivalency

Simple utility to determine if two collections of HTML will ultimately render
the same in the browser.

Used in particular to determine if switching from one markdown processor to
another will have significant side effects.

## Usage

```bash
$ node src/index.js first-input.json second-input.json > result.json
```

Where both `first-` and `second-input.json` are JSON files with identical
structures, for which the values are HTML strings. `results.json` will contain
only those values in the input files that will in fact render differently.

## Example

Running this against the following files:

```json
{
  "simple": "<h1>Basic Header</h1>",
  "extra whitespace": "\n\n<p>\n    Some   spaced\tcontent</p>\n\n",
  "actual differences": "<p>first paragraph</p><p>second paragraph</p>",
}
```

and

```json
{
  "simple": "<h1>Basic Header</h1>",
  "extra whitespace": "<p>Some spaced content</p>",
  "actual differences": "<span>first paragraph</span><br /><span>second paragraph</span>",
}
```

Will produce the following output: 

```json
{
  "actual differences": {
    "a": "<p>first paragraph</p><p>second paragraph</p>",
    "b": "<span>first paragraph</span><br /><span>second paragraph</span>",
  }
}
```
