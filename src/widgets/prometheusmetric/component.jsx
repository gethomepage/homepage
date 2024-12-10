import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatValue(t, metric, rawValue) {
  if (!metric?.format) return rawValue;
  if (!rawValue) return "-";

  let value = rawValue;

  // Scale the value. Accepts either a number to multiply by or a string
  // like "12/345".
  const scale = metric?.format?.scale;
  if (typeof scale === "number") {
    value *= scale;
  } else if (typeof scale === "string" && scale.includes("/")) {
    const parts = scale.split("/");
    const numerator = parts[0] ? parseFloat(parts[0]) : 1;
    const denominator = parts[1] ? parseFloat(parts[1]) : 1;
    value = (value * numerator) / denominator;
  } else {
    value = parseFloat(value);
  }

  // Format the value using a known type and optional options.
  switch (metric?.format?.type) {
    case "text":
      break;
    default:
      value = t(`common.${metric.format.type}`, { value, ...metric.format?.options });
  }

  // Apply fixed prefix.
  const prefix = metric?.format?.prefix;
  if (prefix) {
    value = `${prefix}${value}`;
  }

  // Apply fixed suffix.
  const suffix = metric?.format?.suffix;
  if (suffix) {
    value = `${value}${suffix}`;
  }

  return value;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { metrics = [], refreshInterval = 10000 } = widget;

  let prometheusmetricError;

  const prometheusmetricData = new Map(
    metrics.slice(0, 4).map((metric) => {
      // disable the rule that hooks should not be called from a callback,
      // because we don't need a strong guarantee of hook execution order here.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: resultData, error: resultError } = useWidgetAPI(widget, "query", {
        query: metric.query,
        refreshInterval: Math.max(1000, metric.refreshInterval ?? refreshInterval),
      });
      if (resultError) {
        prometheusmetricError = resultError;
      }
      return [metric.key ?? metric.label, resultData];
    }),
  );

  if (prometheusmetricError) {
    return <Container service={service} error={prometheusmetricError} />;
  }

  if (!prometheusmetricData) {
    return (
      <Container service={service}>
        {metrics.slice(0, 4).map((item) => (
          <Block label={item.label} key={item.label} />
        ))}
      </Container>
    );
  }

  function getResultValue(data) {
    // Fetches the first metric result from the Prometheus query result data.
    // The first element in the result value is the timestamp which is ignored here.
    const resultType = data?.data?.resultType;
    const result = data?.data?.result;

    switch (resultType) {
      case "vector":
        return result?.[0]?.value?.[1];
      case "scalar":
        return result?.[1];
      default:
        return "";
    }
  }

  return (
    <Container service={service}>
      {metrics.map((metric) => (
        <Block
          label={metric.label}
          key={metric.key ?? metric.label}
          value={formatValue(t, metric, getResultValue(prometheusmetricData.get(metric.key ?? metric.label)))}
        />
      ))}
    </Container>
  );
}
