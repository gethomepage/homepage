import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const formatSecs = (totalSecs) => {
  let secs = totalSecs;
  const days = Math.floor(secs / 86400);
  secs -= days * 86400;
  let hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  let mins = Math.floor(secs / 60);
  secs -= mins * 60;

  if (hours < 10) hours = `0${hours}`;
  if (mins < 10) mins = `0${mins}`;
  if (secs < 10) secs = `0${secs}`;

  return days === 0 ? `${hours}:${mins}:${secs}` : `${days}:${hours}:${mins}:${secs}`;
};

export default function Component({ service }) {
  const { widget } = service;

  const { data: printerStats, error: printerStatsError } = useWidgetAPI(widget, "printer_stats", {
    refreshInterval: 1500,
  });
  const { data: jobStats, error: jobStatsError } = useWidgetAPI(widget, "job_stats", {
    refreshInterval: 1500,
  });

  if (printerStatsError) {
    return <Container error={printerStatsError} />;
  }

  if (!printerStats) {
    return (
      <Container service={service}>
        <Block label="octoPrint.printer_state" />
      </Container>
    );
  }

  if (printerStats === 500) {
    return (
      <Container service={service}>
        <Block label="octoPrint.printer_state" value={printerStats.state.text} />
      </Container>
    );
  }

  const state = printerStats.state.text;

  if (state === "Printing" || state === "Paused") {
    if (jobStatsError) {
      return <Container error={jobStatsError} />;
    }

    if (!jobStats) {
      return (
        <Container service={service}>
          <Block label="octoPrint.job_time_elapsed" />
          <Block label="octoPrint.job_time_left" />
          <Block label="octoPrint.job_completion" />
        </Container>
      );
    }

    const { printTimeLeft, printTime, completion } = jobStats.progress;

    return (
      <>
        <Container service={service}>
          <Block label="octoPrint.printer_state" value={printerStats.state.text} />
          <Block label="octoPrint.temp_tool" value={`${printerStats.temperature.tool0.actual}°`} />
          <Block label="octoPrint.temp_bed" value={`${printerStats.temperature.bed.actual}°`} />
        </Container>
        <Container service={service}>
          <Block label="octoPrint.job_completion" value={`${completion.toFixed(2)}%`} />
          <Block label="octoPrint.job_time_elapsed" value={formatSecs(printTime)} />
          <Block label="octoPrint.job_time_left" value={formatSecs(printTimeLeft)} />
        </Container>
      </>
    );
  }

  return (
    <Container service={service}>
      <Block label="octoPrint.printer_state" value={printerStats.state.text} />
      <Block label="octoPrint.temp_tool" value={`${printerStats.temperature.tool0.actual}°`} />
      <Block label="octoPrint.temp_bed" value={`${printerStats.temperature.bed.actual}°`} />
    </Container>
  );
}
