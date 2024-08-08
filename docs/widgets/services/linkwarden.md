---
title: Linkwarden
description: Linkwarden Widget Configuration
---

Learn more about [Linkwarden](https://linkwarden.app/).

Allowed fields: `["links", "collections", "tags"]`.

```yaml
widget:
  type: linkwarden
  url: http://linkwarden.host.or.ip
  key: myApiKeyHere # On your Linkwarden install, go to Settings > Access Tokens. Generate a token.
```

Use `mode` to show a list of recent bookmarks.

```yaml
widget:
  type: linkwarden
  url: http://linkwarden.host.or.ip
  key: myApiKeyHere
  mode: ["recent"]
```

Use `params` to set which collections and/or tags to display links from.

Examples:

```yaml
params:
  collectionIds: ["8", "13", "6"] # ID's of collections
```

or

```yaml
params:
  tagIds: ["84", "66", "88", "69"] # ID's of tags
```

or

```yaml
params:
  collectionIds: ["8", "13", "6"] # ID's of collections
  tagIds: ["84", "66", "88", "69"] # ID's of tags
```

```yaml
widget:
  type: linkwarden
  url: http://linkwarden.host.or.ip
  key: myApiKeyHere
  params:
    collectionIds: ["8", "13", "6"] # ID's of collections
    tagIds: ["84", "66", "88", "69"] # ID's of tags
```
