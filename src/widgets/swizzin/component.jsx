import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function SwizzinStats({ service }) {
  // eslint-disable-next-line no-unused-vars
  const { t } = useTranslation();

  const { widget } = service;

  const { data: ramData, error: ramError } = useWidgetAPI(widget, "ram");
  const { data: diskData, error: diskError } = useWidgetAPI(widget, "disk");

  if (ramError || diskError) {
    return <Container error={ramError || diskError} />;
  }

  if (!ramData || !diskData) {
    return (
      <Container service={service}>
        <Block label="RAM Free" />
        <Block label="Disk Free" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="RAM Free" value={ramData.ramfree} />
      <Block label="Disk Free" value={diskData["/mnt/media"].diskfree} />
    </Container>
  );
}

