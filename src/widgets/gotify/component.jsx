import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: appsData, error: appsError } = useWidgetAPI(widget, "application");
  const { data: messagesData, error: messagesError } = useWidgetAPI(widget, "message");
  const { data: clientsData, error: clientsError } = useWidgetAPI(widget, "client");

  if (appsError || messagesError || clientsError) {
    const finalError = appsError ?? messagesError ?? clientsError;
    return <Container service={service} error={finalError} />;
  }


  if (!appsData || !messagesData || !clientsData) {
    return (
      <Container service={service}>
        <Block label="gotify.apps" />
        <Block label="gotify.clients" />
        <Block label="gotify.messages" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gotify.apps" value={appsData?.length} />
      <Block label="gotify.clients" value={clientsData?.length} />
      <Block label="gotify.messages" value={messagesData?.messages?.length} />
    </Container>
  );
}
