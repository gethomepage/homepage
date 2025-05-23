import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");
  const { data: modelsData, error: modelsError } = useWidgetAPI(widget, "models");

  if (usersError || modelsError) {
    return <Container service={service} error={usersError ?? modelsError} />;
  }

  if (!usersData || !modelsData) {
    return (
      <Container service={service}>
        <Block label="openwebui.users" />
        <Block label="openwebui.models" />
      </Container>
    );
  }

  const activeModelsCount = modelsData.filter((model => model.is_active === true)).length;

  return (
    <Container service={service}>
      <Block label="openwebui.users" value={t("common.number", { value: usersData.total })} />
      <Block label="openwebui.models" value={t("common.number", { value: activeModelsCount })} />
    </Container>
  );
}
