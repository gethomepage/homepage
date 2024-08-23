import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { t } = useTranslation();

  const { data: response, error: responseError } = useWidgetAPI(widget, "statistics");

  if (responseError) {
    return (
      <Container service={service}>
        <Block label="Error" value={responseError.message} />
      </Container>
    );
  }

  if (!response) {

    return (
      <Container service={service}>
        <Block label="romm.platforms" />
        <Block label="romm.roms" />
        <Block label="romm.saves" />
        <Block label="romm.states" />
        <Block label="romm.screenshots" />
        <Block label="romm.totalfilesize" />
      </Container>
    );
  }

  if (response) {
    const totalFilesizeGB = (response.FILESIZE / 1024 ** 3).toFixed(2);

    return (
      <Container service={service}>
        <Block label="romm.platforms" value={t("common.number", { value: response.PLATFORMS })} />
        <Block label="romm.roms" value={t("common.number", { value: response.ROMS })} />
        <Block label="romm.saves" value={t("common.number", { value: response.SAVES })} />
        <Block label="romm.states" value={t("common.number", { value: response.STATES })} />
        <Block label="romm.screenshots" value={t("common.number", { value: response.SCREENSHOTS })} />
        <Block label="romm.totalfilesize" value={t("common.filesize", { value: totalFilesizeGB })} />
      </Container>
    );
  }
}
