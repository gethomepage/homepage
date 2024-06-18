---
title: Metadata Guide
description: Explore all the metadata properties that can be used to configure a widget in Homepage.
---

Here, we will go over how to create and configure Homepage widget metadata. Metadata is a JS object that contains information about the widget, such as the API endpoint, proxy handler, and mappings. This metadata is used by Homepage to fetch data from the API and pass it to the widget.

## Widgets Configuration

Here are some examples of how to configure a widget's metadata object.

=== "Basic Example"

    ```js
    import genericProxyHandler from "utils/proxy/handlers/generic";

    const widgetExample = {
      api: "{url}/api/{endpoint}",
      proxyHandler: genericProxyHandler,

      mappings: {
        stats: { endpoint: "stats" }
      },
    };
    ```

=== "Advanced Example"

    ```js
    import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
    import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";

    const widgetExample = {
      api: "{url}/api/{endpoint}",
      proxyHandler: credentialedProxyHandler,

      mappings: {
        stats: {
          endpoint: "stats",
          validate: ["total", "average"],
          params: ["start", "end"],
        },
        notices: {
          endpoint: "notices",
          map: (data) => {
            total: asJson(data).length;
          },
        },
        warnings: {
          endpoint: "notices",
          map: (data) => {
            total: jsonArrayFilter(data, (alert) => alert.type === "warning").length;
          },
        },
      },
    };
    ```

A widget's metadata is quite powerful and can be configured in many different ways.

## Configuration Properties

### `api`

The `api` property is a string that represents the URL of the API endpoint that the widget will use to fetch data. The URL can contain placeholders that will be replaced with actual values at runtime. For example, the `{url}` placeholder will be replaced with the URL of the configured widget, and the `{endpoint}` placeholder will be replaced with the value of the `endpoint` property in the `mappings` object.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
};
```

### `proxyHandler`

The `proxyHandler` property is a function that will be used to make the API request. Homepage includes some built-in proxy handlers that can be used out of the box:

Here is an example of the generic proxy handler that makes unauthenticated requests to the specified API endpoint.

=== "widget.js"

    ```js
    const widgetExample = {
      api: "{url}/api/{endpoint}",
      proxyHandler: genericProxyHandler,
    };
    ```

=== "services.yaml"

    ```yaml
    - Services:
        - Your Widget:
            icon: yourwidget.svg
            href: https://example.com/
            widget:
              type: yourwidget
              url: http://127.0.0.1:1337
    ```

If you are looking to learn more about proxy handlers, please refer to the guide here: [Proxies Guide](proxies.md).

### `mappings`

The `mappings` property is an object that contains information about the API endpoint, such as the endpoint name, validation rules, and parameter names. The `mappings` object can contain multiple endpoints, each with its own configuration.

!!! note "Security Note"

    The `mappings` or `allowedEndpoints` property is required for the widget to fetch data from more than a static URL. Homepage uses a whitelist approach to ensure that widgets only access allowed endpoints.

```js
import { asJson } from "utils/proxy/api-helpers";

const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/stats?start=...&end=...`
    stats: {
      endpoint: "stats",
      validate: ["total", "average"],
      params: ["start", "end"],
    },
    // `/api/notices`
    notices: {
      endpoint: "notices",
      map: (data) => {
        total: asJson(data).length;
      },
    },
  },
};
```

#### `endpoint`

The `endpoint` property is a string that represents the name of the API endpoint that the widget will use to fetch data. This value will be used to replace the `{endpoint}` placeholder in the `api` property.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/stats`
    stats: {
      endpoint: "stats",
    },
  },
};
```

#### `validate`

The `validate` property is an array of strings that represent the keys that should be validated in the API response. If the response does not contain all of the specified keys, the widget will not render.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/stats`
    stats: {
      endpoint: "stats",
      validate: ["total", "average"],
    },
  },
};
```

This configuration will ensure that the API response contains the `total` and `average` keys before the widget is rendered.

#### `params`

The `params` property is an array of strings that represent the keys that should be passed as parameters to the API endpoint. These keys will be replaced with the actual values at runtime.

=== "widget.js"

    ```js
    const widgetExample = {
      api: "{url}/api/{endpoint}",
      mappings: {
        // `/api/stats?start=...&end=...`
        stats: {
          endpoint: "stats",
          params: ["start", "end"],
        },
      },
    };
    ```

=== "component.jsx"

      ```js
      const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats", {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      });
      ```

This configuration will pass the `start` and `end` keys as parameters to the API endpoint. The values are passed as an object to the `useWidgetAPI` hook.

#### `map`

The `map` property is a function that will be used to transform the API response before it is passed to the widget. This function is passed the raw API response and should return the transformed data.

```js
import { asJson } from "utils/proxy/api-helpers";

const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/notices`
    notices: {
      endpoint: "notices",
      map: (data) => {
        total: asJson(data).length;
      },
    },
    // `/api/notices`
    warnings: {
      endpoint: "notices",
      map: (data) => {
        total: asJson(data).filter((alert) => alert.type === "warning").length;
      },
    },
  },
};
```

#### `method`

The `method` property is a string that represents the HTTP method that should be used to make the API request. The default value is `GET`.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/stats`
    stats: {
      endpoint: "stats",
      method: "POST",
    },
  },
};
```

#### `headers`

The `headers` property is an object that contains additional headers that should be included in the API request. If your endpoint requires specific headers, you can include them here.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/stats`
    stats: {
      endpoint: "stats",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
};
```

#### `body`

The `body` property is an object that contains the data that should be sent in the request body. This property is only used when the `method` property is set to `POST` or `PUT`.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  mappings: {
    // `/api/graphql`
    stats: {
      endpoint: "graphql",
      method: "POST",
      body: {
        query: `
          query {
            stats {
              total
              average
            }
          }
        `,
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
};
```

### `allowedEndpoints`

The `allowedEndpoints` property is a RegExp that represents the allowed endpoints that the widget can use. If the widget tries to access an endpoint that is not allowed, the request will be blocked.

`allowedEndpoints` can be used when endpoint validation is simple and can be done using a regular expression, and more control is not required.

!!! note "Security Note"

    The `mappings` or `allowedEndpoints` property is required for the widget to fetch data from more than a static URL. Homepage uses a whitelist approach to ensure that widgets only access allowed endpoints.

```js
const widgetExample = {
  api: "{url}/api/{endpoint}",
  allowedEndpoints: /^stats|notices$/,
};
```

This configuration will only allow the widget to access the `stats` and `notices` endpoints.
