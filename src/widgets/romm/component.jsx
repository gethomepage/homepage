import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: response, error: responseError } = useWidgetAPI(widget, "statistics");

  if (responseError) {
    return (
      <Container service={service}>
        <Block label="Error" value={responseError.message} />
      </Container>
    );
  }

  if (responseError) {
    return <Container service={service} error={responseError} />;
  }

  if (response) {
    const platforms = response.filter((x) => x.rom_count !== 0).length;
    const totalRoms = response.reduce((total, stat) => total + stat.rom_count, 0);
    return (
      <Container service={service}>
        <Block label="romm.platforms" value={platforms} />
        <Block label="romm.totalRoms" value={totalRoms} />
      </Container>
    );
  }
}
