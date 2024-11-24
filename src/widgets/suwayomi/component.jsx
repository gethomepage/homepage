import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: suwayomiData, error: suwayomiError } = useWidgetAPI(widget);

  if (suwayomiError) {
    return <Container service={service} error={suwayomiError} />;
  }

  if (!suwayomiData) {
    if (!widget.fields || widget.fields.length === 0) {
      widget.fields = ["download", "nondownload", "read", "unread"];
    } else if (widget.fields.length > 4) {
      widget.fields = widget.fields.slice(0, 4);
    }
    return (
      <Container service={service}>
        {widget.fields.map((field) => (
          <Block key={field} label={`suwayomi.${field}`} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {suwayomiData.map((data) => (
        <Block key={data.label} label={data.label} value={t("common.number", { value: data.count })} />
      ))}
    </Container>
  );
}
