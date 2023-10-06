import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");
  const { data: roomsData, error: roomsError } = useWidgetAPI(widget, "rooms");
  const { data: peersData, error: peersError } = useWidgetAPI(widget, "peers");

  if (usersError || roomsError || peersError) {
    return <Container service={service} error={usersError ?? roomsError ?? peersError} />;
  }

  if (!usersData || !roomsData || !peersData) {
    return (
      <Container service={service}>
        <Block label="synapse.users" />
        <Block label="synapse.rooms" />
        <Block label="synapse.peers" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="synapse.users" value={t("common.number", { value: usersData.total })} />
      <Block label="synapse.rooms" value={t("common.number", { value: roomsData.total_rooms })} />
      <Block label="synapse.peers" value={t("common.number", { value: peersData.total })} />
    </Container>
  );
}
