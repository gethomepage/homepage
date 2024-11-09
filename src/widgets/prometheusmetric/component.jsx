import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatValue(t, metric, rawValue) {
  if (!rawValue) return "-";

  let value = rawValue;

  // Scale the value. Accepts either a number to multiply by or a string
  // like "12/345".
  const scale = metric?.format?.scale;
  if (typeof scale === "number") {
    value *= scale;
  } else if (typeof scale === "string") {
    const parts = scale.split("/");
    const numerator = parts[0] ? parseFloat(parts[0]) : 1;
    const denominator = parts[1] ? parseFloat(parts[1]) : 1;
    value = (value * numerator) / denominator;
  }

  // Format the value using a known type and optional options.
  switch (metric?.format?.type) {
    case "bytes":
      value = t("common.bytes", { value, ...metric.format?.options });
      break;
    case "bits":
      value = t("common.bits", { value, ...metric.format?.options });
      break;
    case "bbytes":
      value = t("common.bbytes", { value, ...metric.format?.options });
      break;
    case "bbits":
      value = t("common.bbits", { value, ...metric.format?.options });
      break;
    case "byterate":
      value = t("common.byterate", { value, ...metric.format?.options });
      break;
    case "bibyterate":
      value = t("common.bibyterate", { value, ...metric.format?.options });
      break;
    case "bitrate":
      value = t("common.bitrate", { value, ...metric.format?.options });
      break;
    case "bibitrate":
      value = t("common.bibitrate", { value, ...metric.format?.options });
      break;
    case "percent":
      value = t("common.percent", { value, ...metric.format?.options });
      break;
    case "number":
      value = t("common.number", { value, ...metric.format?.options });
      break;
    case "ms":
      value = t("common.ms", { value, ...metric.format?.options });
      break;
    case "date":
      value = t("common.date", { value, ...metric.format?.options });
      break;
    case "duration":
      value = t("common.duration", { value, ...metric.format?.options });
      break;
    case "relativeDate":
      value = t("common.relativeDate", { value, ...metric.format?.options });
      break;
    case "text":
    default:
    // nothing
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

  const prometheusmetricErrors = [];

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
        prometheusmetricErrors.push(resultError);
      }
      return [metric.key ?? metric.label, resultData];
    }),
  );

  if (prometheusmetricErrors.length) {
    // Only shows first metric query error in the container
    return <Container service={service} error={prometheusmetricErrors[0]} />;
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
        return ""
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
