import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {

  const { widget } = service;

  const { data: githubData, error: githubError } = useWidgetAPI(widget);

  if (githubError) {
    return <Container service={service} error={githubError} />;
  }

  if (!githubData) {
    return (
      <Container service={service}>
        <Block label="open issues" />
        <Block label="stars" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="open issues" value={githubData.open_issues_count} />
      <Block label="stars" value={githubData.stargazers_count} />
    </Container>
  );
}
