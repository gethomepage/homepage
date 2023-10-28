import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: listData, error: listError } = useWidgetAPI(widget, "list");

  if (listError) {
    return <Container service={service} error={listError} />;
  }

  const tasks = listData?.data?.tasks;
  if (!tasks) {
    return (
      <Container service={service}>
        <Block label="downloadstation.leech" />
        <Block label="downloadstation.download" />
        <Block label="downloadstation.seed" />
        <Block label="downloadstation.upload" />
      </Container>
    );
  }

  const rateDl = tasks.reduce((acc, task) => acc + (task?.additional?.transfer?.speed_download ?? 0), 0);
  const rateUl = tasks.reduce((acc, task) => acc + (task?.additional?.transfer?.speed_upload ?? 0), 0);
  const completed = tasks.filter((task) => task?.additional?.transfer?.size_downloaded === task?.size)?.length || 0;
  const leech = tasks.length - completed || 0;

  return (
    <Container service={service}>
      <Block label="downloadstation.leech" value={t("common.number", { value: leech })} />
      <Block label="downloadstation.download" value={t("common.byterate", { value: rateDl })} />
      <Block label="downloadstation.seed" value={t("common.number", { value: completed })} />
      <Block label="downloadstation.upload" value={t("common.byterate", { value: rateUl })} />
    </Container>
  );
}
