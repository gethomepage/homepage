import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import prettyBytes from "pretty-bytes";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    ns: ["common"],
    debug: process.env.NODE_ENV === "development",
    defaultNS: "common",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

i18n.services.formatter.add("bytes", (value, lng, options) =>
  prettyBytes(parseFloat(value), { locale: lng, ...options })
);
i18n.services.formatter.add("percent", (value, lng, options) =>
  new Intl.NumberFormat(lng, { style: "percent", ...options }).format(parseFloat(value) / 100.0)
);

export default i18n;
