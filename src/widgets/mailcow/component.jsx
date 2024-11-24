import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: resultData, error: resultError } = useWidgetAPI(widget, "domains");

  if (resultError || (resultData && Object.keys(resultData).length === 0)) {
    return <Container service={service} error={resultError ?? { message: "No domains found" }} />;
  }

  if (!resultData) {
    return (
      <Container service={service}>
        <Block label="mailcow.mailboxes" />
        <Block label="mailcow.aliases" />
        <Block label="mailcow.quarantined" />
      </Container>
    );
  }

  const domains = resultData.length;
  const mailboxes = resultData.reduce((acc, val) => acc + parseInt(val.mboxes_in_domain, 10), 0);
  const mails = resultData.reduce((acc, val) => acc + parseInt(val.msgs_total, 10), 0);
  const storage = resultData.reduce((acc, val) => acc + parseInt(val.bytes_total, 10), 0);

  return (
    <Container service={service}>
      <Block label="mailcow.domains" value={t("common.number", { value: domains })} />
      <Block label="mailcow.mailboxes" value={t("common.number", { value: mailboxes })} />
      <Block label="mailcow.mails" value={t("common.number", { value: mails })} />
      <Block label="mailcow.storage" value={t("common.bytes", { value: storage })} />
    </Container>
  );
}
