import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: netdataData, error: netdataError } = useWidgetAPI(widget, "info");

  if (netdataError) {
    return <Container service={service} error={netdataError} />;
  }

  if (!netdataData) {
    return (
      <Container service={service}>
        <Block label="netdata.warnings" />
        <Block label="netdata.criticals" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="netdata.warnings" value={t("common.number", { value: netdataData.alarms.warning })} />
      <Block label="netdata.criticals" value={t("common.number", { value: netdataData.alarms.critical })} />
    </Container>
  );
}
