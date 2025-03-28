import useSWR from "swr";
import { LuGlobe, LuGlobeLock } from "react-icons/lu";

import Error from "../widget/error";
import Container from "../widget/container";
import PrimaryText from "../widget/primary_text";
import WidgetIcon from "../widget/widget_icon";

export default function Ipify({ options }) {
  const { data, error } = useSWR(`/api/widgets/ipify?${new URLSearchParams({ ...options }).toString()}`);

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Container options={options} additionalClassNames="information-widget-ipify">
        <PrimaryText>-</PrimaryText>
        <WidgetIcon icon={LuGlobeLock} />
      </Container>
    );
  }

  return (
    <Container options={options} additionalClassNames="information-widget-ipify">
      <PrimaryText>{data.ip}</PrimaryText>
      <WidgetIcon icon={LuGlobe} />
    </Container>
  );
}
