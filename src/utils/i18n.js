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

i18n.services.formatter.add("rate", (value, lng, options) => {
  if (value === 0) return "0 Bps";

  const bits = options.bits ? value : value / 8;
  const k = 1024;
  const dm = options.decimals ? options.decimals : 0;
  const sizes = ["Bps", "Kbps", "Mbps", "Gbps", "Tbps", "Pbps", "Ebps", "Zbps", "Ybps"];

  const i = Math.floor(Math.log(bits) / Math.log(k));

  const formatted = new Intl.NumberFormat(lng, { maximumFractionDigits: dm, minimumFractionDigits: dm }).format(
    parseFloat(bits / k ** i)
  );

  return `${formatted} ${sizes[i]}`;
});

i18n.services.formatter.add("percent", (value, lng, options) =>
  new Intl.NumberFormat(lng, { style: "percent", ...options }).format(parseFloat(value) / 100.0)
);

export default i18n;
