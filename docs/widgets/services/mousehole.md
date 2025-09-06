---
title: Mousehole
description: Mousehole Widget Configuration
---

Learn more about [Mousehole](https://github.com/t-mart/mousehole).

Mousehole is a background service that updates seedbox IP addresses for MAM (MyAnonaMouse) and provides status information through an API.

## Basic Example

```yaml
widget:
  type: mousehole
  url: http://localhost:5010
```

## Full Example

```yaml
widget:
  type: mousehole
  url: http://localhost:5010 # Required - URL of your Mousehole instance
```
