# html-equivalency

Determine if a given bit of markdown will ultimately render the same in the browser after being parsed into HTML by either marked or remark.

## Usage

```bash
$ node src/index.js some-markdown.json results.json
```

Where `some-markdown.json` is a JSON file for which any keys should be treated as markdown, and `results.json` will contain an object mirroring that in `some-markdown.json` but for which any markdown that does resolve to different values will be replaced by an object containing the two HTML results.

## Example

Running this against the following file:

```json
{
  "headers": "# header",
  "alt text": "![](example.com/img.jpg)",
  "breaks": "line ending with two spaces  \nfollowing line"
}
```

Will produce the following output: 

```json
{
  "headers": {
    "marked": "<h1 id=\"header\">header</h1>\n",
    "remark": "<h1>header</h1>\n"
  },
  "alt text": {
    "marked": "<p><img src=\"example.com/img.jpg\" alt=\"\"></p>\n",
    "remark": "<p><img src=\"example.com/img.jpg\"></p>\n"
  },
  "breaks": {
    "marked": "<p>line ending with two spaces<br>following line</p>\n",
    "remark": "<p>line ending with two spaces<br>\nfollowing line</p>\n"
  }
}
```

Two of these three examples (alt text and a newline) are obviously examples of ways in which this is currently insufficient, since those differences shouldn't actually matter.
