import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: bookmarksData, error: bookmarksError } = useWidgetAPI(widget, "bookmarks");
  const { data: tagsData, error: tagsError } = useWidgetAPI(widget, "tags");

  if (bookmarksError || tagsError) {
    return <Container service={service} error={bookmarksError || tagsError} />;
  }

  if (!bookmarksData || !tagsData) {
    return (
      <Container service={service}>
        <Block label="linkding.bookmarks" />
        <Block label="linkding.tags" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="linkding.bookmarks" value={bookmarksData?.count ?? 0} />
      <Block label="linkding.tags" value={tagsData?.count ?? 0} />
    </Container>
  );
}
