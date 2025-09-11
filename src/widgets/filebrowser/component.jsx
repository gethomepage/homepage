import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usage, error: usageError } = useWidgetAPI(widget, "usage");

  if (usageError) {
    return <Container service={service} error={usageError} />;
  }

  if (!usage) {
    return (
      <Container service={service}>
        <Block label="filebrowser.available" />
        <Block label="filebrowser.used" />
        <Block label="filebrowser.total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="filebrowser.available"
        value={t("common.bytes", { value: (usage?.total ?? 0) - (usage?.used ?? 0) })}
      />
      <Block label="filebrowser.used" value={t("common.bytes", { value: usage?.used ?? 0 })} />
      <Block label="filebrowser.total" value={t("common.bytes", { value: usage?.total ?? 0 })} />
    </Container>
  );
}
