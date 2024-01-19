---
title: Mealie
description: Mealie Widget Configuration
---

[Mealie](https://github.com/mealie-recipes/mealie) - Mealie is a self hosted recipe manager and meal planner with a RestAPI backend and a reactive frontend application built in Vue for a pleasant user experience for the whole family. Easily add recipes into your database by providing the url and mealie will automatically import the relevant data or add a family recipe with the UI editor

Generate a user API key under `Profile > Manage Your API Tokens > Generate`.

Allowed fields: `["recipes", "users", "categories", "tags"]`.

```yaml
widget:
  type: mealie
  url: http://mealie-frontend.host.or.ip
  key: mealieapitoken
```
