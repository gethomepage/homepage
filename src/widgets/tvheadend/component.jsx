import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Subscription from "widgets/tvheadend/subscription";

function timeAgo(ticks) {
  const now = Date.now(); // Current time in milliseconds
  const inputTime = ticks * 1000; // Convert the input ticks from seconds to milliseconds
  const difference = now - inputTime; // Difference in milliseconds

  const seconds = Math.floor((difference / 1000) % 60);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function timeAgoToString(ticks) {
  const { hours, minutes, seconds } = timeAgo(ticks);
  const parts = [];
  if (hours > 0) {
    parts.push(hours);
  }
  parts.push(minutes);
  parts.push(seconds);

  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: dvrData, error: dvrError } = useWidgetAPI(widget, "dvr", {
    refreshInterval: 60000,
  });
  const { data: subscriptionsData, error: subscriptionsError } = useWidgetAPI(widget, "subscriptions", {
    refreshInterval: 5000,
  });

  if (dvrError || subscriptionsError) {
    const finalError = dvrError ?? subscriptionsError;
    return <Container service={service} error={finalError} />;
  }

  if (!dvrData || !subscriptionsData) {
    return (
      <Container service={service}>
        <Block label="tvheadend.upcoming" />
        <Block label="tvheadend.finished" />
        <Block label="tvheadend.failed" />
      </Container>
    );
  }

  const upcomingCount = dvrData.entries.filter((entry) => entry.sched_status === "scheduled").length;
  const finishedCount = dvrData.entries.filter((entry) => entry.sched_status === "completed").length;
  const failedCount = dvrData.entries.filter((entry) => entry.sched_status === "failed").length;

  const hasSubscriptions = Array.isArray(subscriptionsData.entries) && subscriptionsData.entries.length > 0;

  return (
    <>
      <Container service={service}>
        <Block label="tvheadend.upcoming" value={t("common.number", { value: upcomingCount })} />
        <Block label="tvheadend.finished" value={t("common.number", { value: finishedCount })} />
        <Block label="tvheadend.failed" value={t("common.number", { value: failedCount })} />
      </Container>
      {hasSubscriptions &&
        subscriptionsData.entries
          .filter(
            (entry) =>
              entry.channel && 
              entry.id &&
              entry.start && // Only include valid entries
              entry.state === "Running", // and being watched (Idle=downloading)
          )
          .sort((a, b) => a.channel.localeCompare(b.channel))
          .map((subscription) => (
            <Subscription
              key={subscription.id}
              channel={subscription.channel}
              sinceStart={timeAgoToString(subscription.start)}
            />
          ))}
    </>
  );
}
