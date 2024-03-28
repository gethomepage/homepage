import { useTranslation } from "next-i18next";

export default function Error() {
  const { t } = useTranslation();

  return <div className="absolute bottom-2 left-2 z-20 text-red-400 text-xs opacity-75">{t("widget.api_error")}</div>;
}
