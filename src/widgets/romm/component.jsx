import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const ROMM_DEFAULT_FIELDS = ["platforms", "totalRoms", "saves", "states"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { widget } = service;
  const { t } = useTranslation();
  const { data: response, error: responseError } = useWidgetAPI(widget, "statistics");

  if (responseError) {
    return <Container service={service} error={responseError} />;
  }

  if (!widget.fields?.length > 0) {
    widget.fields = ROMM_DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!response) {
    return (
      <Container service={service}>
        <Block label="romm.platforms" />
        <Block label="romm.totalRoms" />
        <Block label="romm.saves" />
        <Block label="romm.states" />
        <Block label="romm.screenshots" />
        <Block label="romm.totalfilesize" />
      </Container>
    );
  }

  if (response) {
    return (
      <Container service={service}>
        <Block label="romm.platforms" value={t("common.number", { value: response.PLATFORMS })} />
        <Block label="romm.totalRoms" value={t("common.number", { value: response.ROMS })} />
        <Block label="romm.saves" value={t("common.number", { value: response.SAVES })} />
        <Block label="romm.states" value={t("common.number", { value: response.STATES })} />
        <Block label="romm.screenshots" value={t("common.number", { value: response.SCREENSHOTS })} />
        <Block label="romm.totalfilesize" value={t("common.bytes", { value: response.FILESIZE })} />
      </Container>
    );
  }
}
