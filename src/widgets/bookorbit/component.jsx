import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

function countLabel(kind) {
  if (kind === "audiobook") return "bookorbit.audiobooks";
  if (kind === "comic") return "bookorbit.comics";
  return "bookorbit.books";
}

function progressLabel(kind) {
  return kind === "audiobook" ? "bookorbit.listening" : "bookorbit.reading";
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: bookorbitData, error: bookorbitError } = useWidgetAPI(widget);

  if (bookorbitError) {
    return <Container service={service} error={bookorbitError} />;
  }

  const number = (value) => t("common.number", { value: value ?? 0 });

  // A widget scoped to one library would report "1" every time, so the block is dropped.
  const singleLibrary = bookorbitData?.libraries === 1;

  if (!bookorbitData) {
    return (
      <Container service={service}>
        {!singleLibrary && <Block label="bookorbit.libraries" />}
        <Block label="bookorbit.books" field="bookorbit.books" />
        <Block label="bookorbit.reading" field="bookorbit.reading" />
        <Block label="bookorbit.finished" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {!singleLibrary && <Block label="bookorbit.libraries" value={number(bookorbitData.libraries)} />}
      <Block
        label={bookorbitData.label ?? countLabel(bookorbitData.mediaKind)}
        field="bookorbit.books"
        value={number(bookorbitData.books)}
      />
      <Block
        label={progressLabel(bookorbitData.mediaKind)}
        field="bookorbit.reading"
        value={number(bookorbitData.reading)}
      />
      <Block label="bookorbit.finished" value={number(bookorbitData.finished)} />
    </Container>
  );
}
