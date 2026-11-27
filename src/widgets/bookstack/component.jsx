import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["shelves", "books", "chapters", "pages"];

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const { data: stats, error: statsError } = useWidgetAPI(widget, "stats");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="bookstack.shelves" />
        <Block label="bookstack.books" />
        <Block label="bookstack.chapters" />
        <Block label="bookstack.pages" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="bookstack.shelves" value={stats.shelves} />
      <Block label="bookstack.books" value={stats.books} />
      <Block label="bookstack.chapters" value={stats.chapters} />
      <Block label="bookstack.pages" value={stats.pages} />
    </Container>
  );
}
