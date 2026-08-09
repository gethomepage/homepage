import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["mode", "active", "up", "down"];

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields?.length) {
    widget.fields = DEFAULT_FIELDS;
  }

  const includeConnections = ["up", "down", "connections"].some((field) => widget.fields.includes(field));
  const includeVersion = widget.fields.includes("version");

  const { data: configsData, error: configsError } = useWidgetAPI(widget, "configs");
  const { data: proxiesData, error: proxiesError } = useWidgetAPI(widget, "proxies");
  const { data: connectionsData, error: connectionsError } = useWidgetAPI(
    widget,
    includeConnections ? "connections" : "",
  );
  const { data: versionData, error: versionError } = useWidgetAPI(widget, includeVersion ? "version" : "");

  if (configsError || proxiesError || connectionsError || versionError) {
    const finalError = configsError ?? proxiesError ?? connectionsError ?? versionError;
    return <Container service={service} error={finalError} />;
  }

  if (!configsData || !proxiesData || (includeConnections && !connectionsData) || (includeVersion && !versionData)) {
    return (
      <Container service={service}>
        <Block label="clash.mode" />
        <Block label="clash.active" />
        <Block label="clash.up" />
        <Block label="clash.down" />
        <Block label="clash.connections" />
        <Block label="clash.latency" />
        <Block label="clash.version" />
      </Container>
    );
  }

  const groupName = widget.group || "GLOBAL";
  const activeProxy = proxiesData.proxies?.[groupName]?.now;
  const history = proxiesData.proxies?.[activeProxy]?.history;
  const latency = history?.length ? history[history.length - 1].delay : undefined;
  const latencyValue = latency > 0 ? t("common.ms", { value: latency }) : "-";

  return (
    <Container service={service}>
      <Block field="clash.mode" label="clash.mode" value={configsData.mode} />
      <Block field="clash.active" label="clash.active" value={activeProxy} />
      <Block field="clash.up" label="clash.up" value={t("common.bytes", { value: connectionsData?.uploadTotal })} />
      <Block
        field="clash.down"
        label="clash.down"
        value={t("common.bytes", { value: connectionsData?.downloadTotal })}
      />
      <Block
        field="clash.connections"
        label="clash.connections"
        value={t("common.number", { value: connectionsData?.connections?.length })}
      />
      <Block field="clash.latency" label="clash.latency" value={latencyValue} />
      <Block field="clash.version" label="clash.version" value={versionData?.version} />
    </Container>
  );
}
