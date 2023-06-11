import { useTranslation } from "react-i18next";
import { BiError } from "react-icons/bi";

import Container from "./container";
import PrimaryText from "./primary_text";
import WidgetIcon from "./widget_icon";

export default function Error({ options }) {
  const { t } = useTranslation();

  return <Container options={options}>
    <PrimaryText>{t("widget.api_error")}</PrimaryText>
    <WidgetIcon icon={BiError} size="l" />
  </Container>;
}
