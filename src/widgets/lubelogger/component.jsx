import { useTranslation } from "react-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  let { data: vehicleInfo, error } = useWidgetAPI(widget, "vehicleinfo");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!vehicleInfo) {
    return (
      <Container service={service}>
        <Block label="lubelogger.vehicles" />
        <Block label="lubelogger.serviceRecords" />
        <Block label="lubelogger.reminders" />
      </Container>
    );
  }

  const { vehicleID } = widget;
  if (vehicleID) {
    vehicleInfo = vehicleInfo.filter((v) => v.vehicleData.id === vehicleID);
  }
  const totalReminders = vehicleInfo.reduce(
    (acc, val) => acc + val.veryUrgentReminderCount + val.urgentReminderCount + val.notUrgentReminderCount,
    0,
  );
  const totalServiceRecords = vehicleInfo.reduce((acc, val) => acc + val.serviceRecordCount, 0);

  if (vehicleID) {
    if (vehicleInfo.length === 0) {
      error = { message: "Vehicle not found" };
      return <Container service={service} error={error} />;
    }

    const nextReminder = vehicleInfo[0].nextReminder
      ? t("common.date", { value: vehicleInfo[0].nextReminder.dueDate })
      : t("lubelogger.none");
    return (
      <Container service={service}>
        <Block
          label="lubelogger.vehicle"
          value={`${vehicleInfo[0].vehicleData.year} ${vehicleInfo[0].vehicleData.model}`}
        />
        <Block label="lubelogger.serviceRecords" value={totalServiceRecords} />
        <Block label="lubelogger.reminders" value={totalReminders} />
        <Block label="lubelogger.nextReminder" value={nextReminder} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="lubelogger.vehicles" value={vehicleInfo.length} />
      <Block label="lubelogger.serviceRecords" value={totalServiceRecords} />
      <Block label="lubelogger.reminders" value={totalReminders} />
    </Container>
  );
}
