---
title: BookOrbit
description: BookOrbit Widget Configuration
---

Learn more about [BookOrbit](https://github.com/bookorbit/bookorbit).

BookOrbit issues short-lived access tokens rather than API keys, so the widget signs in with your BookOrbit username and password and renews the token as it expires.

Allowed fields: `["libraries", "books", "reading", "finished"]`

| Field       | Renders as                  | Shows                                                                             |
| ----------- | --------------------------- | --------------------------------------------------------------------------------- |
| `libraries` | Libraries                   | How many libraries the widget covers. Left out when a single library is selected. |
| `books`     | Books / Audiobooks / Comics | Number of titles held in those libraries.                                         |
| `reading`   | Reading / Listening         | Titles started but not finished.                                                  |
| `finished`  | Finished                    | Titles marked finished.                                                           |

The field name never changes, only the label, so `fields: ["books"]` picks the item count whether it renders Books, Audiobooks or Comics.

```yaml
widget:
  type: bookorbit
  url: https://bookorbit.host.or.ip
  username: username
  password: password
  libraries: [eBooks, Audiobooks] # optional, defaults to all if excluded
  label: Reading room # optional, defaults to the media kind
```

## Optional fields

| Option      | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `libraries` | This field is optional and defaults to `all` when left out. Library names or ids can be used for specific libraries instead, for example `eBooks`, `[eBooks, Audiobooks]`, `[1, 2]`. Wrap more than one value in `[]`; a single value needs none.<br><br>Picking a single library drops the library count block, since it would read "1" every time.                                                                                                                                                                                                                                                                                                         |
| `label`     | This optional field overrides the item count label, so a library of PDFs can read PDFs rather than Books.<br><br>Left out, the label follows BookOrbit's own convention of classifying an item by its file format, with the majority of files deciding:<br><br>`m4b` `mp3` `m4a` `opus` `ogg` `flac` &rarr; Audiobooks / Listening<br>`cbz` `cbr` `cb7` `cbx` &rarr; Comics / Reading<br>everything else, `epub` and `pdf` among them &rarr; Books / Reading<br><br>A stray ebook among the audiobooks does not change the naming, since the majority decides. A selection spanning several kinds, or a library with nothing in it, reads Books and Reading. |
