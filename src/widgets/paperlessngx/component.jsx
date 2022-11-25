import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: inboxData, error: inboxError } = useWidgetAPI(widget, "inbox",
  {
    query: `tag:${widget.inboxTag}`,
    format: "json",
    fields: "count"
  });


  const { data: documentData, error: documentError } = useWidgetAPI(widget, "documents",
  {
    fields: "count",
    format: "json",
  });

  if (inboxError || documentError) {
    const finalError = inboxError ?? documentError;
    return <Container error={finalError} />;
  }

  if (!inboxData || !documentData) {
    return (
      <Container service={service}>
        <Block label="paperlessngx.inbox" />
        <Block label="paperlessngx.total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="paperlessngx.inbox" value={inboxData.count} />
      <Block label="paperlessngx.total" value={documentData.count} />
    </Container>
  );
}
