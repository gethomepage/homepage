import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: infoData, error: infoError } = useWidgetAPI(widget);

  if (!widget.fields) {
    widget.fields = ["total", "categories", "views"];
  }

  if (infoError) {
    return <Container service={service} error={infoError} />;
  }

  if (!infoData) {
    return (
      <Container service={service}>
        <Block label="fireshare.total" />
        <Block label="fireshare.categories" />
        <Block label="fireshare.views" />
        <Block label="fireshare.private" />
        <Block label="fireshare.public" />
      </Container>
    );
  }

  const total = infoData.videos.length;
  const categoriesSet = new Set();
  infoData.videos.forEach(video => {
    const category = video.path.split('/')[0];
    categoriesSet.add(category);
  });
  const categoriesCount = categoriesSet.size;
  const totalViews = infoData.videos.reduce((acc, video) => acc + video.view_count, 0);
  const privateCount = infoData.videos.filter(video => video.info.private).length;
  const publicCount = total - privateCount;

  return (
    <Container service={service}>
      <Block label="fireshare.total" value={total} />
      <Block label="fireshare.categories" value={categoriesCount} />
      <Block label="fireshare.views" value={totalViews} />
      <Block label="fireshare.private" value={privateCount} />
      <Block label="fireshare.public" value={publicCount} />
    </Container>
  );
}
