import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const priorityLabels = {
  1: "min",
  2: "low",
  3: "default",
  4: "high",
  5: "urgent",
};

function Truncated({ text }) {
  return (
    <span className="grid w-full" title={text}>
      <span className="truncate">{text}</span>
    </span>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: messagesData, error: messagesError } = useWidgetAPI(widget, "messages");

  if (messagesError) {
    return <Container service={service} error={messagesError} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = ["title", "message", "priority", "lastReceived"];
  } else if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  if (!messagesData) {
    return (
      <Container service={service}>
        {widget.fields.map((field) => (
          <Block key={field} label={`ntfy.${field}`} />
        ))}
      </Container>
    );
  }

  const titleText = messagesData.title ?? t("ntfy.none");
  const messageText = messagesData.message ?? t("ntfy.noMessages");
  const tagsText = messagesData.tags?.length > 0 ? messagesData.tags.join(", ") : t("ntfy.none");

  const fieldValues = {
    title: <Truncated text={titleText} />,
    message: <Truncated text={messageText} />,
    priority: t(`ntfy.${priorityLabels[messagesData.priority] ?? "default"}`),
    lastReceived: messagesData.time
      ? t("common.relativeDate", { value: messagesData.time * 1000 })
      : t("ntfy.noMessages"),
    tags: <Truncated text={tagsText} />,
  };

  return (
    <Container service={service}>
      {widget.fields.map((field) => (
        <Block key={field} label={`ntfy.${field}`} value={fieldValues[field]} />
      ))}
    </Container>
  );
}
