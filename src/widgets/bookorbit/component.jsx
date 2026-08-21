import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

// A widget scoped to one library reports "1 library" in every case, so that block is
// dropped; the library's own name labels the count block instead.
function configuredLibraryCount(libraries) {
  if (libraries === undefined || libraries === null || libraries === "") {
    return 0;
  }

  const entries = Array.isArray(libraries) ? libraries : libraries.toString().split(",");
  const named = entries.map((entry) => entry.toString().trim()).filter((entry) => entry.length > 0);

  return named.length === 1 && named[0].toLowerCase() === "all" ? 0 : named.length;
}

// BookOrbit classifies a book by its file format, and the blocks follow that rather than
// the names given to libraries: a library of audio files holds audiobooks, and audiobooks
// are listened to. The kind is worked out server side from the formats a library holds.
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

  // Before the data lands the config is all there is to go on; once it has, the number of
  // libraries actually matched is what decides, since a name may match nothing.
  const singleLibrary = bookorbitData ? bookorbitData.libraries === 1 : configuredLibraryCount(widget.libraries) === 1;

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
