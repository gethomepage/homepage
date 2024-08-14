---
title: Widget Tutorial
description: Follow along with this guide to learn how to create a custom widget for Homepage. We'll cover the basic structure of a widget, how to use translations, and how to fetch data from an API.
---

In this guide, we'll walk through the process of creating a custom widget for Homepage. We'll cover the basic structure of a widget, how to use translations, and how to fetch data from an API. By the end of this guide, you'll have a solid understanding of how to build your own custom widget.

**Prerequisites:**

- Basic knowledge of React and JavaScript
- Familiarity with the Homepage platform
- Understanding of JSON and API interactions

Throughout this guide, we'll use `yourwidget` as a placeholder for the unique name of your custom widget. Replace `yourwidget` with the actual name of your widget. It should contain only lowercase letters and no spaces.

This guide makes use of a fake API, which would return a JSON response as such, when called with the `v1/info` endpoint:

```json
{ "key1": 123, "key2": 456, "key3": 789 }
```

## Set up the widget definition

Create a new folder for your widget in the `src/widgets` directory. Name the folder `yourwidget`.

Inside the `yourwidget` folder, create a new file named `widget.js`. This file will contain the metadata for your widget.

Open the `widget.js` file and add the following code:

```js title="src/widgets/yourwidget/widget.js"
import genericProxyHandler from "utils/proxy/handlers/generic"; // (1)!

const widget = /* (2)! */ {
  api: "{url}/{endpoint}" /* (3)! */,
  proxyHandler: genericProxyHandler /* (1)! */,

  mappings: /* (4)! */ {
    info: /* (5)! */ {
      endpoint: "v1/info" /* (6)! */,
    },
  },
};

export default widget;
```

1. We import the `genericProxyHandler` from the `utils/proxy/handlers/generic` module. The `genericProxyHandler` is a generic handler that can be used to fetch data from an API. We then assign the `genericProxyHandler` to the `proxyHandler` property of the `widget` object. There are other handlers available that you can use depending on your requirements. You can also create custom handlers if needed.
2. We define a `widget` object that contains the metadata for the widget.
3. The API endpoint to fetch data from. You can use placeholders like `{url}` and `{endpoint}` to dynamically generate the API endpoint based on the widget configuration.
4. An object that contains mappings for different endpoints. Each mapping should have an `endpoint` property that specifies the endpoint to fetch data from.
5. A mapping named `info` that specifies the `v1/info` endpoint to fetch data from. This would be called from the component as such: `#!js useWidgetAPI(widget, "info");`
6. The `endpoint` property of the `info` mapping specifies the endpoint to fetch data from. There are other properties you can pass to the mapping, such as `method`, `headers`, and `body`.

!!! warning "Important"

    All widgets that fetch data from dynamic endpoints should have either `mappings` or an `allowedEndpoints` property.

## Including translation strings in your widget

Refer to the [translations guide](translations.md) for more details. The Homepage community prides itself on being multilingual, and we strongly encourage you to add translations for your widgets.

## Create the widget component

Create a new file for your widgets component, named `component.jsx`, in the `src/widgets/yourwidget` directory. We'll build the contents of the `component.jsx` file step by step.

First, we'll import the necessary dependencies:

```js title="src/widgets/yourwidget/component.jsx" linenums="1"
import { useTranslation } from "next-i18next"; // (1)!

import Container from "components/services/widget/container"; // (2)!
import Block from "components/services/widget/block"; // (3)!
import useWidgetAPI from "utils/proxy/use-widget-api"; // (4)!
```

1. `#!js useTranslation()` is a hook provided by `next-i18next` that allows us to access the translation strings
2. `#!jsx <Container>` and `#!jsx <Block>` are custom components that we'll use to structure our widget.
3. `#!jsx <Container>` and `#!jsx <Block>` are custom components that we'll use to structure our widget.
4. `#!js useWidgetAPI(widget, endpoint)` is a custom hook that we'll use to fetch data from an API.

---

Next, we'll define a functional component named `Component` that takes a `service` prop.

```js title="src/widgets/yourwidget/component.jsx" linenums="7"
export default function Component({ service }) {}
```

---

We grab the helper functions from the `useTranslation` hook.

```js title="src/widgets/yourwidget/component.jsx" linenums="8"
const { t } = useTranslation();
```

---

We destructure the `widget` object from the `service` prop. The `widget` object contains the metadata for the widget, such as the API endpoint to fetch data from.

```js title="src/widgets/yourwidget/component.jsx" linenums="9"
const { widget } = service;
```

---

Now, the fun part! We use the `useWidgetAPI` hook to fetch data from an API. The `useWidgetAPI` hook takes two arguments: the `widget` object and the API endpoint to fetch data from. The `useWidgetAPI` hook returns an object with `data` and `error` properties.

```js title="src/widgets/yourwidget/component.jsx" linenums="10"
const { data, error } = useWidgetAPI(widget, "info");
```

!!! tip "API Tips"

    You'll see here how part of the API url is built using the `url` and `endpoint` properties from the widget definition.

    In this case, we're fetching data from the `info` endpoint.  The `info` endpoint is defined in the `mappings` object.  So the full API endpoint will be `"{url}/v1/info"`.

    The mapping and endpoint are often the same, but must be defined regardless.

---

Next, we check if there's an error or no data.

If there's an error, we return a `Container` and pass it the `service` and `error` as props. The `Container` component will handle displaying the error message.

```js title="src/widgets/yourwidget/component.jsx" linenums="12"
if (error) {
  return <Container service={service} error={error} />;
}
```

---

If there's no data, we return a `Container` component with three `Block` components, each with a `label`.

```js title="src/widgets/yourwidget/component.jsx" linenums="16"
if (!data) {
  return (
    <Container service={service}>
      <Block label="yourwidget.key1" />
      <Block label="yourwidget.key2" />
      <Block label="yourwidget.key3" />
    </Container>
  );
}
```

This will render the widget with placeholders for the data, i.e., a skeleton view.

!!! tip "Translation Tips"

      The `label` prop in the `Block` component corresponds to the translation key we defined earlier in the `common.js` file.  All text and numerical content should be translated.

---

If there is data, we return a `Container` component with three `Block` components, each with a `label` and a `value`.

Here we use the `t` function from the `useTranslation` hook to translate the data values. The `t` function takes the translation key and an object with variables to interpolate into the translation string.

We're using the `common.number` translation key to format the data values as numbers. This allows for easy localization of numbers, such as using commas or periods as decimal separators.

There are a large number of `common` numerical translation keys available, which you can learn more about in the [Translation Guide](translations.md).

```js title="src/widgets/yourwidget/component.jsx" linenums="26"
return (
  <Container service={service}>
    <Block label="yourwidget.key1" value={t("common.number", { value: data.key1 })} />
    <Block label="yourwidget.key2" value={t("common.number", { value: data.key2 })} />
    <Block label="yourwidget.key3" value={t("common.number", { value: data.key3 })} />
  </Container>
);
```

---

Here's the complete `component.jsx` file:

```js title="src/widgets/yourwidget/component.jsx" linenums="1"
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "info");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="yourwidget.key1" />
        <Block label="yourwidget.key2" />
        <Block label="yourwidget.key3" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="yourwidget.key1" value={t("common.number", { value: data.key1 })} />
      <Block label="yourwidget.key2" value={t("common.number", { value: data.key2 })} />
      <Block label="yourwidget.key3" value={t("common.number", { value: data.key3 })} />
    </Container>
  );
}
```

## Add the widget to the Homepage

To add your widget to the Homepage, you need to register it in the `src/widgets/widgets.js` file.

Open the `src/widgets/widgets.js` file and import the `Component` from your widget's `component.jsx` file. Please keep the alphabetical order.

```js
// ...
import yourwidget from "./yourwidget/widget";
// ...
```

Add `yourwidget` to the `widgets` object. Please keep the alphabetical order.

```js
const widgets = {
  // ...
  yourwidget: yourwidget,
  // ...
};
```

You also need to add the widget to the `components` object in the `src/widgets/components.js` file.

Open the `src/widgets/components.js` file and import the `Component` from your widget's `component.jsx` file.

Please keep the alphabetical order.

```js
const components = {
  // ...
  yourwidget: dynamic(() => import("./yourwidget/component")),
  // ...
};
```

## Using the widget

You can now use your custom widget in your Homepage. Open your `services.yaml` file and add a new service with the `yourwidget` widget.

```yaml
- Services:
    - Your Widget:
        icon: yourwidget.svg
        href: https://example.com/
        widget:
          type: yourwidget
          url: http://127.0.0.1:1337
```

!!! tip "API Tips"

    You'll see here how part of the API url is built using the `url` and `endpoint` properties from the widget definition.

    We defined the api endpoint as `"{url}/{endpoint}"`.  This is where the `url` is defined.  So the full API endpoint will be `http://127.0.0.1:1337/{endpoint}`.

---

That's it! You've successfully created a custom widget for Homepage. If you have any questions or need help, feel free to reach out to the Homepage community for assistance. Happy coding!
