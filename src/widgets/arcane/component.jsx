import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["running", "stopped", "total", "image_updates"];
  } else if (widget.fields.length > MAX_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_FIELDS);
  }

  if (widget?.env == null || widget.env === "") {
    return <Container service={service} error={t("arcane.environment_required")} />;
  }

  const { data: containers, error: containersError } = useWidgetAPI(widget, "containers");
  const { data: images, error: imagesError } = useWidgetAPI(widget, "images");
  const { data: updates, error: updatesError } = useWidgetAPI(widget, "updates");

  const error = containersError ?? imagesError ?? updatesError;
  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!containers || !images || !updates) {
    return (
      <Container service={service}>
        <Block label="docker.running" field="arcane.running" />
        <Block label="dockhand.stopped" field="arcane.stopped" />
        <Block label="dockhand.total" field="arcane.total" />
        <Block label="arcane.images" field="arcane.images" />
        <Block label="resources.used" field="arcane.images_used" />
        <Block label="arcane.images_unused" field="arcane.images_unused" />
        <Block label="arcane.image_updates" field="arcane.image_updates" />
      </Container>
    );
  }

  const runningContainers = containers?.runningContainers ?? 0;
  const totalContainers = containers?.totalContainers ?? 0;
  const stoppedContainers = containers?.stoppedContainers ?? 0;
  const totalImages = images?.totalImages ?? 0;
  const imagesInuse = images?.imagesInuse ?? 0;
  const imagesUnused = images?.imagesUnused ?? 0;
  const imagesWithUpdates = updates?.imagesWithUpdates ?? 0;

  return (
    <Container service={service}>
      <Block label="docker.running" field="arcane.running" value={t("common.number", { value: runningContainers })} />
      <Block label="dockhand.stopped" field="arcane.stopped" value={t("common.number", { value: stoppedContainers })} />
      <Block label="dockhand.total" field="arcane.total" value={t("common.number", { value: totalContainers })} />
      <Block label="arcane.images" field="arcane.images" value={t("common.number", { value: totalImages })} />
      <Block label="resources.used" field="arcane.images_used" value={t("common.number", { value: imagesInuse })} />
      <Block
        label="arcane.images_unused"
        field="arcane.images_unused"
        value={t("common.number", { value: imagesUnused })}
      />
      <Block
        label="arcane.image_updates"
        field="arcane.image_updates"
        value={t("common.number", { value: imagesWithUpdates })}
      />
    </Container>
  );
}
