---
title: Prometheus Metric
description: Prometheus Metric Widget Configuration
---

Learn more about [Querying Prometheus](https://prometheus.io/docs/prometheus/latest/querying/basics/).

This widget can show metrics for your service defined by PromQL queries which are requested from a running Prometheus instance.

Quries can be defined in the `metrics` array of the widget along with a label to be used to present the metric value. You can optionally specify a global `refreshInterval` in milliseconds and/or define the `refreshInterval` per metric. Inside the optional `format` object of a metric various formatting styles and transformations can be applied (see below).

```yaml
widget:
  type: prometheusmetric
  url: https://prometheus.host.or.ip
  refreshInterval: 10000 # optional - in milliseconds, defaults to 10s
  metrics:
    - label: Metric 1
      query: alertmanager_alerts{state="active"}
    - label: Metric 2
      query: apiserver_storage_size_bytes{node="mynode"}
      format:
        type: bytes
    - label: Metric 3
      query: avg(prometheus_notifications_latency_seconds)
      format:
        type: number
        suffix: s
        options:
          maximumFractionDigits: 4
    - label: Metric 4
      query: time()
      refreshInterval: 1000 # will override global refreshInterval
      format:
        type: date
        scale: 1000
        options:
          timeStyle: medium
```

## Formatting

Supported values for `format.type` are `text`, `number`, `percent`, `bytes`, `bits`, `bbytes`, `bbits`, `byterate`, `bibyterate`, `bitrate`, `bibitrate`, `date`, `duration`, `relativeDate`, and `text` which is the default.

The `dateStyle` and `timeStyle` options of the `date` format are passed directly to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) and the `style` and `numeric` options of `relativeDate` are passed to [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat). For the `number` format, options of [Intl.NumberFormat](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) can be used, e.g. `maximumFractionDigits` or `minimumFractionDigits`.

### Data Transformation

You can manipulate your metric value with the following tools: `scale`, `prefix` and `suffix`, for example:

```yaml
- query: my_custom_metric{}
  label: Metric 1
  format:
    type: number
    scale: 1000 # multiplies value by a number or fraction string e.g. 1/16
- query: my_custom_metric{}
  label: Metric 2
  format:
    type: number
    prefix: "$" # prefixes value with given string
- query: my_custom_metric{}
  label: Metric 3
  format:
    type: number
    suffix: "€" # suffixes value with given string
```
