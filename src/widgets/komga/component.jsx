import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {

  const { widget } = service;

  const { data: libraryData, error: libraryError } = useWidgetAPI(widget, "komga.libraries");
  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "komga.series");
  const { data: bookData, error: bookError } = useWidgetAPI(widget, "komga.books");

  if (libraryError || seriesError || bookError) {
    const finalError = libraryError ?? seriesError ?? bookError;
    return <Container error={finalError} />;
  }

  if (!libraryError || !seriesError || !bookError) {
    return (
      <Container service={service}>
        <Block label="komga.libraries" />
        <Block label="komga.series" />
        <Block label="komga.books" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="komga.libraries" value={parseInt(libraryData.measurements.value, 10) } />
      <Block label="komga.series" value={parseInt(seriesData.measurements.value, 10) } />
      <Block label="komga.books" value={parseInt(bookData.measurements.value, 10) } />
    </Container>
  );
}