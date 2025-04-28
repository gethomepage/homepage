import classNames from "classnames";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import * as shvl from "utils/config/shvl";
import useWidgetAPI from "utils/proxy/use-widget-api";

function getValue(field, data) {
  let value = data;
  let lastField = field;
  let key = "";

  // Support APIs that return arrays or scalars directly.
  if (typeof field === "undefined") {
    return value;
  }

  // shvl is easier, everything else is kept for backwards compatibility.
  if (typeof field === "string") {
    return shvl.get(data, field, null) ?? data[field] ?? null;
  }

  while (typeof lastField === "object") {
    key = Object.keys(lastField)[0] ?? null;

    if (key === null) {
      break;
    }

    value = value[key];
    lastField = lastField[key];
  }

  if (typeof value === "undefined") {
    return null;
  }

  return value[lastField] ?? null;
}

function getSize(data) {
  if (Array.isArray(data) || typeof data === "string") {
    return data.length;
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).length;
  }

  return NaN;
}

function formatValue(t, mapping, rawValue) {
  let value = rawValue;

  // Remap the value.
  const remaps = mapping?.remap ?? [];
  for (let i = 0; i < remaps.length; i += 1) {
    const remap = remaps[i];
    if (remap?.any || remap?.value === value) {
      value = remap.to;
      break;
    }
  }

  // Scale the value. Accepts either a number to multiply by or a string
  // like "12/345".
  const scale = mapping?.scale;
  if (typeof scale === "number") {
    value *= scale;
  } else if (typeof scale === "string") {
    const parts = scale.split("/");
    const numerator = parts[0] ? parseFloat(parts[0]) : 1;
    const denominator = parts[1] ? parseFloat(parts[1]) : 1;
    value = (value * numerator) / denominator;
  }

  // Format the value using a known type.
  switch (mapping?.format) {
    case "number":
      value = t("common.number", { value: parseInt(value, 10) });
      break;
    case "float":
      value = t("common.number", { value });
      break;
    case "percent":
      value = t("common.percent", { value });
      break;
    case "duration":
      value = t("common.duration", { value });
      break;
    case "bytes":
      value = t("common.bytes", { value });
      break;
    case "bitrate":
      value = t("common.bitrate", { value });
      break;
    case "date":
      value = t("common.date", {
        value,
        lng: mapping?.locale,
        dateStyle: mapping?.dateStyle ?? "long",
        timeStyle: mapping?.timeStyle,
      });
      break;
    case "relativeDate":
      value = t("common.relativeDate", {
        value,
        lng: mapping?.locale,
        style: mapping?.style,
        numeric: mapping?.numeric,
      });
      break;
    case "size":
      value = t("common.number", { value: getSize(value) });
      break;
    case "text":
    default:
    // nothing
  }

  // Apply fixed prefix.
  const prefix = mapping?.prefix;
  if (prefix) {
    value = `${prefix} ${value}`;
  }

  // Apply fixed suffix.
  const suffix = mapping?.suffix;
  if (suffix) {
    value = `${value} ${suffix}`;
  }

  return value;
}

function getColor(mapping, customData) {
  const value = getValue(mapping.additionalField.field, customData);
  const { color } = mapping.additionalField;

  switch (color) {
    case "adaptive":
      try {
        const number = parseFloat(value);
        return number > 0 ? "text-emerald-300" : "text-rose-300";
      } catch (e) {
        return "";
      }
    case "black":
      return `text-black`;
    case "white":
      return `text-white`;
    case "theme":
      return `text-theme-500`;
    default:
      return "";
  }
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { mappings = [], refreshInterval = 10000, display = "block" } = widget;
  const { data: customData, error: customError } = useWidgetAPI(widget, null, {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (customError) {
    return <Container service={service} error={customError} />;
  }

  if (!customData) {
    switch (display) {
      case "dynamic-list":
        return (
          <Container service={service}>
            <div className="flex flex-col w-full">
              <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs animate-pulse">
                <div className="font-thin pl-2">Loading...</div>
              </div>
            </div>
          </Container>
        );
      case "list":
        return (
          <Container service={service}>
            <div className="flex flex-col w-full">
              {mappings.map((mapping) => (
                <div
                  key={mapping.label}
                  className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs animate-pulse"
                >
                  <div className="font-thin pl-2">{mapping.label}</div>
                  <div className="flex flex-row text-right">
                    <div className="font-bold mr-2">-</div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        );

      default:
        return (
          <Container service={service}>
            {mappings.slice(0, 4).map((item) => (
              <Block label={item.label} key={item.label} />
            ))}
          </Container>
        );
    }
  }

  switch (display) {
    case "dynamic-list":
      let listItems = customData;
      if (mappings.items) listItems = shvl.get(customData, mappings.items, null);
      let error;
      if (!listItems || !Array.isArray(listItems)) {
        error = { message: "Unable to find items" };
      }
      const name = mappings.name;
      const label = mappings.label;
      if (!name || !label) {
        error = { message: "Name and label properties are required" };
      }
      if (error) {
        return <Container service={service} error={error}></Container>;
      }

      const target = mappings.target;
      if (mappings.limit && parseInt(mappings.limit, 10) > 0) {
        listItems.splice(mappings.limit);
      }

      return (
        <Container service={service}>
          <div className="flex flex-col w-full">
            {listItems.length === 0 ? (
              <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs">
                <div className="font-thin pl-2">No items found</div>
              </div>
            ) : (
              listItems.map((item, index) => {
                const itemName = shvl.get(item, name, item[name]) ?? "";
                const itemLabel = shvl.get(item, label, item[label]) ?? "";

                const itemUrl = target
                  ? [...target.matchAll(/\{(.*?)\}/g)]
                      .map((match) => match[1])
                      .reduce((url, targetTemplate) => {
                        const value = shvl.get(item, targetTemplate, item[targetTemplate]) ?? "";
                        return url.replaceAll(`{${targetTemplate}}`, value);
                      }, target)
                  : null;
                const className =
                  "bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs";

                return itemUrl ? (
                  <a
                    key={`${itemName}-${index}`}
                    className={classNames(className, "hover:bg-theme-300/50 dark:hover:bg-theme-800/20")}
                    href={itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="font-thin pl-2">{itemName}</div>
                    <div className="flex flex-row text-right">
                      <div className="font-bold mr-2">{formatValue(t, mappings, itemLabel)}</div>
                    </div>
                  </a>
                ) : (
                  <div key={`${itemName}-${index}`} className={className}>
                    <div className="font-thin pl-2">{itemName}</div>
                    <div className="flex flex-row text-right">
                      <div className="font-bold mr-2">{formatValue(t, mappings, itemLabel)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Container>
      );
    case "list":
      return (
        <Container service={service}>
          <div className="flex flex-col w-full">
            {mappings.map((mapping) => (
              <div
                key={mapping.label}
                className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs"
              >
                <div className="font-thin pl-2">{mapping.label}</div>
                <div className="flex flex-row text-right">
                  <div className="font-bold mr-2">{formatValue(t, mapping, getValue(mapping.field, customData))}</div>
                  {mapping.additionalField && (
                    <div className={`font-bold mr-2 ${getColor(mapping, customData)}`}>
                      {formatValue(t, mapping.additionalField, getValue(mapping.additionalField.field, customData))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      );

    default:
      return (
        <Container service={service}>
          {mappings.slice(0, 4).map((mapping) => (
            <Block
              label={mapping.label}
              key={mapping.label}
              value={formatValue(t, mapping, getValue(mapping.field, customData))}
            />
          ))}
        </Container>
      );
  }
}
