import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const BACKREST_DEFAULT_FIELDS = ["num_success_latest", "num_failure_latest", "num_failure_30", "bytes_added_30"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();

  const service = withWidgetFields(configuredService, BACKREST_DEFAULT_FIELDS, MAX_ALLOWED_FIELDS);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "summary");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="backrest.num_plans" />
        <Block label="backrest.num_success_latest" />
        <Block label="backrest.num_failure_latest" />
        <Block label="backrest.num_success_30" />
        <Block label="backrest.num_failure_30" />
        <Block label="backrest.bytes_added_30" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="backrest.num_plans" value={t("common.number", { value: data.numPlans })} />
      <Block label="backrest.num_success_latest" value={t("common.number", { value: data.numSuccessLatest })} />
      <Block label="backrest.num_failure_latest" value={t("common.number", { value: data.numFailureLatest })} />
      <Block label="backrest.num_success_30" value={t("common.number", { value: data.numSuccess30Days })} />
      <Block label="backrest.num_failure_30" value={t("common.number", { value: data.numFailure30Days })} />
      <Block label="backrest.bytes_added_30" value={t("common.bytes", { value: data.bytesAdded30Days })} />
    </Container>
  );
}
