import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function secondsToTimeObj(seconds) {
  return {
    seconds: seconds % 60,
    minutes: Math.floor((seconds / 60) % 60),
    hours: Math.floor((seconds / 3600) % 60),
  };
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: prusalinkStats, error: prusalinkError } = useWidgetAPI(widget, "prusalink");
  const isPrinting = prusalinkStats?.state === "Printing";

  if (prusalinkError) {
    return <Container service={service} error={prusalinkError} />;
  }

  if (!isPrinting) {
    return (
      <Container service={service}>
        <Block label="prusalink.print_progress" value="-" />
        <Block label="prusalink.print_time" value="-" />
        <Block label="prusalink.print_time_left" value="-" />
      </Container>
    );
  }

  const progress = prusalinkStats.progress * 100;
  const printTime = secondsToTimeObj(prusalinkStats.printTime);
  const printTimeLeft = secondsToTimeObj(prusalinkStats.printTimeLeft);

  return (
    <Container service={service}>
      <Block label="prusalink.print_progress" value={t("common.percent", { value: progress })} />
      <Block
        label="prusalink.print_time"
        value={`${t("common.number", {
          value: printTime.hours,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "hour",
        })} ${t("common.number", {
          value: printTime.minutes,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "minute",
        })}`}
      />
      <Block
        label="prusalink.print_time_left"
        value={`${t("common.number", {
          value: printTimeLeft.hours,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "hour",
        })} ${t("common.number", {
          value: printTimeLeft.minutes,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "minute",
        })}`}
      />
    </Container>
  );
}
