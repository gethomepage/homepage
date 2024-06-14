---
title: API Guide
description: Get comfortable with making API calls from inside your widget.
---

Homepage provides the `useWidgetAPI` hook to help you fetch data from an API. This hook insures that the data is fetched using a proxy, and is critical for security.

Here is an example of how the `useWidgetAPI` hook looks:

```js title="Fetch data from the stats endpoint"
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(widget, "stats");
}
```

## `useWidgetAPI`

`useWidgetAPI` takes three possible arguments:

- `widget`: The widget metadata object.
- `endpoint`: The name of the endpoint to fetch data from.
- `params`: An optional object containing query parameters to pass to the API.

### `widget`

The `widget` argument is the metadata object for the widget. It contains information about the API endpoint, proxy handler, and mappings. This object is used by the `useWidgetAPI` hook to fetch data from the API. This is generally passed in as a prop from the parent component.

### `endpoint`

The `endpoint` argument is the name of the endpoint to fetch data from. This is [defined in the widget metadata object](metadata.md#endpoint). The `useWidgetAPI` hook uses this argument to determine which endpoint to fetch data from.

If no endpoint is provided, the `useWidgetAPI` hook will call the API endpoint defined in the widget metadata object directly.

### `params`

The `params` argument is an optional object containing query parameters to pass to the API. This is useful for filtering data or passing additional information to the API. This object is passed directly to the API endpoint as query parameters.

Here is an example of how to use the `params` argument:

```js title="Fetch data from the stats endpoint with query parameters"
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(widget, "stats", { start: "2021-01-01", end: "2021-12-31" });
}
```

The `params` must be [whitelisted in the widget metadata object](metadata.md#params). This is done to prevent arbitrary query parameters from being passed to the API.
