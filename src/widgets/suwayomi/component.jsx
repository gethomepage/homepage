import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

/**
 * @param {string[]|null} Fields
 * @returns {string[]}
 */
function makeFields(Fields = []) {
  let fields = Fields ?? [];
  if (fields.length === 0) {
    fields = ["download", "nondownload", "read", "unread"];
  }
  if (fields.length > 4) {
    fields.length = 4;
  }
  fields = fields.map((f) => f.toLowerCase());

  return fields;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  /** @type {{widget: { fields: string[]|null }}} */
  const { widget } = service;

  /** @type { { data: { label: string, count: number }[], error: unknown }} */
  const { data: suwayomiData, error: suwayomiError } = useWidgetAPI(widget);

  if (suwayomiError) {
    return <Container service={service} error={suwayomiError} />;
  }

  if (!suwayomiData) {
    const fields = makeFields(widget.fields);
    return (
      <Container service={service}>
        {fields.map((field) => (
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
