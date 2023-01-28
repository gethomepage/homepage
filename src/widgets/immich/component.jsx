import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: immichData } = useWidgetAPI(widget);

  if (immichData?.statusCode) { // Unauthorized
    return <Container error={immichData?.statusCode} />;
  }

  return (
    <Container service={service}>
      <Block label="immich.users" value={immichData?.usageByUser.length} />
      <Block label="immich.photos" value={immichData?.photos} />
      <Block label="immich.videos" value={immichData?.videos} />
      <Block label="immich.storage" value={immichData?.usage} />
    </Container>
  );
}
