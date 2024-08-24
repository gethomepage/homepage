import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: versionData, error: versionError } = useWidgetAPI(widget, "version");
  const endpoint = parseInt(versionData?.version, 10) >= 2 || versionData?.version === "nightly" ? "households" : "groups";

  const { data: mealieData, error: mealieError } = useWidgetAPI(widget, endpoint);

  if (versionError || mealieError || mealieData?.statusCode === 401) {
    return <Container service={service} error={versionError ?? mealieError ?? mealieData} />;
  }

  if (!mealieData) {
    return (
      <Container service={service}>
        <Block label="mealie.recipes" />
        <Block label="mealie.users" />
        <Block label="mealie.categories" />
        <Block label="mealie.tags" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="mealie.recipes" value={mealieData.totalRecipes} />
      <Block label="mealie.users" value={mealieData.totalUsers} />
      <Block label="mealie.categories" value={mealieData.totalCategories} />
      <Block label="mealie.tags" value={mealieData.totalTags} />
    </Container>
  );
}
