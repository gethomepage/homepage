import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

function toKimaiDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function startOfToday(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(now) {
  const d = startOfToday(now);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function sumDurationSeconds(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.reduce((acc, e) => acc + (typeof e.duration === "number" ? e.duration : 0), 0);
}

function formatHours(seconds) {
  if (seconds <= 0) return "0h";
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const now = new Date();

  const todayBegin = toKimaiDateTime(startOfToday(now));
  const weekBegin = toKimaiDateTime(startOfWeek(now));
  const end = toKimaiDateTime(now);

  const { data: todayData, error: todayError } = useWidgetAPI(widget, "timesheets", {
    begin: todayBegin,
    end,
    size: 200,
  });

  const { data: weekData, error: weekError } = useWidgetAPI(widget, "timesheets", {
    begin: weekBegin,
    end,
    size: 200,
  });

  const { data: activeData, error: activeError } = useWidgetAPI(widget, "active");

  if (todayError || weekError || activeError) {
    return <Container service={service} error={todayError ?? weekError ?? activeError} />;
  }

  if (!todayData || !weekData || !activeData) {
    return (
      <Container service={service}>
        <Block label="kimai.active" />
        <Block label="kimai.today" />
        <Block label="kimai.week" />
      </Container>
    );
  }

  const activeEntry = Array.isArray(activeData) && activeData.length > 0 ? activeData[0] : null;
  let activeValue = t("kimai.idle");
  if (activeEntry) {
    const elapsedSeconds = Math.max(0, Math.floor((now - new Date(activeEntry.begin)) / 1000));
    const projectName = activeEntry.project?.name ?? activeEntry.activity?.name ?? t("kimai.tracking");
    activeValue = `${projectName} · ${t("common.duration", { value: elapsedSeconds })}`;
  }

  return (
    <Container service={service}>
      <Block label="kimai.active" value={activeValue} />
      <Block label="kimai.today" value={formatHours(sumDurationSeconds(todayData))} />
      <Block label="kimai.week" value={formatHours(sumDurationSeconds(weekData))} />
    </Container>
  );
}
