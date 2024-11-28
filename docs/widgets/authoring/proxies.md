---
title: Proxies Guide
description: Learn about proxy handlers in Homepage, and how to securely fetch data from an API.
---

Homepage includes a set of built-in proxy handlers that can be used to fetch data from an API. We will go over how to use these proxy handlers and briefly cover how to create your own.

## Available Proxy Handlers

Homepage comes with a few built-in proxy handlers that can be used to fetch data from an API. These handlers are located in the `utils/proxy/handlers` directory.

### `genericProxyHandler`

A proxy handler that makes generally unauthenticated requests to the specified API endpoint.

```js
import genericProxyHandler from "utils/proxy/handlers/generic";

const widgetExample = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,
};
```

You can also pass API keys from the widget configuration to the proxy handler, for authenticated requests.

=== "widget.js"

    ```js
    import genericProxyHandler from "utils/proxy/handlers/generic";

    const widgetExample = {
      api: "{url}/api/{endpoint}?key={key}",
      proxyHandler: genericProxyHandler,
    };
    ```

=== "services.yaml"

    ```yaml
    # Widget Configuration
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://example.com
          key: your-api-key
    ```

### `credentialedProxyHandler`

A proxy handler that makes authenticated requests by setting request headers. Credentials are pulled from the widgets configuration.

By default the key is passed as an `X-API-Key` header. If you need to pass the key as something else, either add a case to the credentialedProxyHandler or create a new proxy handler.

=== "widget.js"

    ```js
    import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

    const widgetExample = {
      api: "{url}/api/{endpoint}?key={key}",
      proxyHandler: credentialedProxyHandler,
    };
    ```

=== "services.yaml"

    ```yaml
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://127.0.0.1:1337
          key: your-api-key
    ```

### `jsonrpcProxyHandler`

A proxy handler that makes authenticated JSON-RPC requests to the specified API endpoint, either using username + password or an API token.
The endpoint is the method to call and queryParams are used as the parameters.

=== "component.js"

    ```js
    import Container from "components/services/widget/container";
    import useWidgetAPI from "utils/proxy/use-widget-api";

    export default function Component({ service }) {
      const { widget } = service;

      const { data, error } = useWidgetAPI(widget, 'trigger', { "triggerids": "14062", "output": "extend", "selectFunctions": "extend" });
    }
    ```

=== "widget.js"

    ```js
    import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

    const widgetExample = {
      api: "{url}/api/jsonrpc",
      proxyHandler: jsonrpcProxyHandler,

      mappings: {
        total: { endpoint: "total" },
        average: { endpoint: "average" },
        trigger: { endpoint: "trigger.get" },
      },
    };
    ```

=== "services.yaml"

    ```yaml
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://127.0.0.1:1337
          username: your-username
          password: your-password
    ```

    ```yaml
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://127.0.0.1:1337
          key: your-api-token
    ```

### `synologyProxyHandler`

A proxy handler that makes authenticated requests to the specified Synology API endpoint. This is used exclusively for Synology DSM services.

=== "widget.js"

    ```js
    import synologyProxyHandler from "utils/proxy/handlers/synology";

    const widgetExample = {
      api: "{url}/webapi/{cgiPath}?api={apiName}&version={maxVersion}&method={apiMethod}",
      proxyHandler: synologyProxyHandler,

      mappings: {
        system_storage: {
          apiName: "SYNO.Core.System",
          apiMethod: 'info&type="storage"',
          endpoint: "system_storage",
        }
      },
    };
    ```

=== "services.yaml"

    ```yaml
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://127.0.0.1:1337
          username: your-username
          password: your-password
    ```

## Creating a Custom Proxy Handler

You can create your own proxy handler to fetch data from an API. A proxy handler is a function that takes a configuration object and returns a function that makes the API request.

The proxy handler function takes three arguments:

- `req`: The request object.
- `res`: The response object.
- `map`: A function that maps the API response to the widget data.

The proxy handler function should return a promise that resolves to the API response.

Here is an example of a simple proxy handler that fetches data from an API and passes it to the widget:

```js
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("customProxyHandler");

export default async function customProxyHandler(req, res, map) {
  const { url } = req.query;

  const [status, contentType, data] = await httpProxy(url);

  return res.status(status).send(data);
}
```

Proxy handlers are a complex topic and require a good understanding of JavaScript and the Homepage codebase. If you are new to Homepage, we recommend using the built-in proxy handlers.
