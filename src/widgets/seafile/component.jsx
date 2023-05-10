import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: seafileData, error: seafileError } = useWidgetAPI(widget);

  if (seafileError) {
    return <Container service={service} error={seafileError} />;
  }

  if (!seafileData) {
    return (
      <Container service={service}>
        <Block label="seafile.users" />
        <Block label="seafile.groups" />
        <Block label="seafile.libraries" />
        <Block label="seafile.storage" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="seafile.users" value={t("common.number", { value: seafileData.users_count })} />
      <Block label="seafile.groups" value={t("common.number", { value: seafileData.groups_count })} />
      <Block label="seafile.libraries" value={t("common.number", { value: seafileData.repos_count })} />
      <Block
        label="seafile.storage"
        value={t("common.bytes", { value: seafileData.total_storage, maximumFractionDigits: 1 })}
      />
    </Container>
  );
}
