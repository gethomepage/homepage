import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: spaceData, error: spaceError } = useWidgetAPI(widget, "space");
  const { data: keywordData, error: keywordError } = useWidgetAPI(widget, "keyword");

  if (spaceError || keywordError) {
    const finalError = spaceError ?? keywordError;
    return <Container service={service} error={finalError} />;
  }

  if (!spaceData || !keywordData) {
    return (
      <Container service={service}>
        <Block label="tandoor.users" />
        <Block label="tandoor.recipes" />
        <Block label="tandoor.keywords" />
      </Container>
    );
  }
  return (
    <Container service={service}>
      <Block label="tandoor.users" value={spaceData[0]?.user_count} />
      <Block label="tandoor.recipes" value={spaceData[0]?.recipe_count} />
      <Block label="tandoor.keywords" value={keywordData.count} />
    </Container>
  );
}
