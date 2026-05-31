import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="apcups.status" />
        <Block label="apcups.load" />
        <Block label="apcups.bcharge" />
        <Block label="apcups.timeleft" />
        <Block label="apcups.linev" />
        <Block label="apcups.battv" />
        <Block label="apcups.nominv" />
        <Block label="apcups.nombattv" />
        <Block label="apcups.nompower" />
        <Block label="apcups.sense" />
        <Block label="apcups.lotrans" />
        <Block label="apcups.hitrans" />
        <Block label="apcups.mbattchg" />
        <Block label="apcups.mintimel" />
        <Block label="apcups.maxtime" />
        <Block label="apcups.alarmdel" />
        <Block label="apcups.lastxfer" />
        <Block label="apcups.numxfers" />
        <Block label="apcups.tonbatt" />
        <Block label="apcups.cumonbatt" />
        <Block label="apcups.selftest" />
        <Block label="apcups.battdate" />
        <Block label="apcups.model" />
        <Block label="apcups.upsname" />
        <Block label="apcups.cable" />
        <Block label="apcups.driver" />
        <Block label="apcups.starttime" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="apcups.status"    value={data.status} />
      <Block label="apcups.load"      value={data.load} />
      <Block label="apcups.bcharge"   value={data.bcharge} />
      <Block label="apcups.timeleft"  value={data.timeleft} />
      <Block label="apcups.linev"     value={data.linev} />
      <Block label="apcups.battv"     value={data.battv} />
      <Block label="apcups.nominv"    value={data.nominv} />
      <Block label="apcups.nombattv"  value={data.nombattv} />
      <Block label="apcups.nompower"  value={data.nompower} />
      <Block label="apcups.sense"     value={data.sense} />
      <Block label="apcups.lotrans"   value={data.lotrans} />
      <Block label="apcups.hitrans"   value={data.hitrans} />
      <Block label="apcups.mbattchg"  value={data.mbattchg} />
      <Block label="apcups.mintimel"  value={data.mintimel} />
      <Block label="apcups.maxtime"   value={data.maxtime} />
      <Block label="apcups.alarmdel"  value={data.alarmdel} />
      <Block label="apcups.lastxfer"  value={data.lastxfer} />
      <Block label="apcups.numxfers"  value={data.numxfers} />
      <Block label="apcups.tonbatt"   value={data.tonbatt} />
      <Block label="apcups.cumonbatt" value={data.cumonbatt} />
      <Block label="apcups.selftest"  value={data.selftest} />
      <Block label="apcups.battdate"  value={data.battdate} />
      <Block label="apcups.model"     value={data.model} />
      <Block label="apcups.upsname"   value={data.upsname} />
      <Block label="apcups.cable"     value={data.cable} />
      <Block label="apcups.driver"    value={data.driver} />
      <Block label="apcups.starttime" value={data.starttime} />
    </Container>
  );
}
