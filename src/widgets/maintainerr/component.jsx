import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["itemsHandled", "episodesHandled", "moviesHandled", "reclaimable"];
const MAX_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields?.length) {
    widget.fields = DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_FIELDS);
  }

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="maintainerr.itemsHandled" />
        <Block label="maintainerr.episodesHandled" />
        <Block label="maintainerr.moviesHandled" />
        <Block label="maintainerr.showsHandled" />
        <Block label="maintainerr.seasonsHandled" />
        <Block label="maintainerr.reclaimable" />
        <Block label="maintainerr.movieReclaimable" />
        <Block label="maintainerr.showReclaimable" />
        <Block label="maintainerr.totalCapacity" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="maintainerr.itemsHandled"
        value={t("common.number", { value: data.cleanupTotals?.itemsHandled ?? 0 })}
      />
      <Block
        label="maintainerr.episodesHandled"
        value={t("common.number", { value: data.cleanupTotals?.episodesHandled ?? 0 })}
      />
      <Block
        label="maintainerr.moviesHandled"
        value={t("common.number", { value: data.cleanupTotals?.moviesHandled ?? 0 })}
      />
      <Block
        label="maintainerr.showsHandled"
        value={t("common.number", { value: data.cleanupTotals?.showsHandled ?? 0 })}
      />
      <Block
        label="maintainerr.seasonsHandled"
        value={t("common.number", { value: data.cleanupTotals?.seasonsHandled ?? 0 })}
      />
      <Block
        label="maintainerr.reclaimable"
        value={t("common.bytes", { value: data.collectionSummary?.activeSizeBytes ?? 0 })}
      />
      <Block
        label="maintainerr.movieReclaimable"
        value={t("common.bytes", { value: data.collectionSummary?.movieSizeBytes ?? 0 })}
      />
      <Block
        label="maintainerr.showReclaimable"
        value={t("common.bytes", { value: data.collectionSummary?.showSizeBytes ?? 0 })}
      />
      <Block label="maintainerr.totalCapacity" value={t("common.bytes", { value: data.totals?.totalSpace ?? 0 })} />
    </Container>
  );
}
