import { useTranslation } from "next-i18next/pages";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const FIELDS = ["status", "currentIP", "timeSinceLastUpdate", "previousIP"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();

  const defaultFields = FIELDS;
  const service = withWidgetFields(configuredService, defaultFields);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, null);

  if (error) {
      return (
          <Container service={service} error={error} />
      )
  }
  if (!data) {
      return (
        <Container service={service}>
          <Block label="ddnsupdater.domain" />
          <Block label="ddnsupdater.provider" />
          <Block label="ddnsupdater.status" />
          <Block label="ddnsupdater.currentIP" />
          <Block label="ddnsupdater.timeSinceLastUpdate" />
          <Block label="ddnsupdater.previousIP" />
        </Container>
      )
  }

  // If there is data:
  return (
    <Container service={service}>
      <Block label="ddnsupdater.domain" value={ data.domain } />
      <Block label="ddnsupdater.provider" value={ data.provider } />
      <Block label="ddnsupdater.status" value={ data.status } />
      <Block label="ddnsupdater.timeSinceLastUpdate" value={ data.timeSinceLastUpdate } />
      <Block label="ddnsupdater.currentIP" value={ data.currentIP } />
      <Block label="ddnsupdater.previousIP" value={ data.previousIP } />
    </Container>
  );
}