// prettyBytes taken from https://github.com/sindresorhus/pretty-bytes

/* eslint-disable no-param-reassign */
const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

const BIBYTE_UNITS = ["B", "kiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

const BIT_UNITS = ["b", "kbit", "Mbit", "Gbit", "Tbit", "Pbit", "Ebit", "Zbit", "Ybit"];

const BIBIT_UNITS = ["b", "kibit", "Mibit", "Gibit", "Tibit", "Pibit", "Eibit", "Zibit", "Yibit"];

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (number, locale, options) => {
  let result = number;
  if (typeof locale === "string" || Array.isArray(locale)) {
    result = number.toLocaleString(locale, options);
  } else if (locale === true || options !== undefined) {
    result = number.toLocaleString(undefined, options);
  }

  return result;
};

function prettyBytes(number, options) {
  if (!Number.isFinite(number)) {
    throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
  }

  options = {
    bits: false,
    binary: false,
    ...options,
  };

  // eslint-disable-next-line no-nested-ternary
  const UNITS = options.bits ? (options.binary ? BIBIT_UNITS : BIT_UNITS) : options.binary ? BIBYTE_UNITS : BYTE_UNITS;

  if (options.signed && number === 0) {
    return ` 0 ${UNITS[0]}`;
  }

  const isNegative = number < 0;
  // eslint-disable-next-line no-nested-ternary
  const prefix = isNegative ? "-" : options.signed ? "+" : "";

  if (isNegative) {
    number = -number;
  }

  let localeOptions;

  if (options.minimumFractionDigits !== undefined) {
    localeOptions = { minimumFractionDigits: options.minimumFractionDigits };
  }

  if (options.maximumFractionDigits !== undefined) {
    localeOptions = { maximumFractionDigits: options.maximumFractionDigits, ...localeOptions };
  }

  if (number < 1) {
    const numberString = toLocaleString(number, options.locale, localeOptions);
    return `${prefix + numberString} ${UNITS[0]}`;
  }

  const exponent = Math.min(
    Math.floor(options.binary ? Math.log(number) / Math.log(1024) : Math.log10(number) / 3),
    UNITS.length - 1,
  );
  number /= (options.binary ? 1024 : 1000) ** exponent;

  if (!localeOptions) {
    number = number.toPrecision(3);
  }

  const numberString = toLocaleString(Number(number), options.locale, localeOptions);

  const unit = UNITS[exponent];

  return `${prefix + numberString} ${unit}`;
}

function uptime(uptimeInSeconds, i18next) {
  const mo = Math.floor(uptimeInSeconds / (3600 * 24 * 31));
  const d = Math.floor((uptimeInSeconds % (3600 * 24 * 31)) / (3600 * 24));
  const h = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
  const m = Math.floor((uptimeInSeconds % 3600) / 60);
  const s = Math.floor(uptimeInSeconds % 60);

  const moDisplay = mo > 0 ? mo + i18next.t("common.months") : "";
  const dDisplay = d > 0 ? d + i18next.t("common.days") : "";
  const hDisplay = h > 0 && mo === 0 ? h + i18next.t("common.hours") : "";
  const mDisplay = m > 0 && mo === 0 && d === 0 ? m + i18next.t("common.minutes") : "";
  const sDisplay = s > 0 && mo === 0 && d === 0 && h === 0 ? s + i18next.t("common.seconds") : "";

  return (moDisplay + dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
}

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  serializeConfig: false,
  use: [
    {
      init: (i18next) => {
        i18next.services.formatter.add("bytes", (value, lng, options) =>
          prettyBytes(parseFloat(value), { locale: lng, ...options }),
        );

        i18next.services.formatter.add("rate", (value, lng, options) => {
          const k = options.binary ? 1024 : 1000;
          const sizes = options.bits
            ? options.binary
              ? BIBIT_UNITS
              : BIT_UNITS
            : options.binary
            ? BIBYTE_UNITS
            : BYTE_UNITS;

          if (value === 0) return `0 ${sizes[0]}/s`;

          const dm = options.decimals ? options.decimals : 0;

          const i = options.binary ? 2 : Math.floor(Math.log(value) / Math.log(k));

          const formatted = new Intl.NumberFormat(lng, { maximumFractionDigits: dm, minimumFractionDigits: dm }).format(
            parseFloat(value / k ** i),
          );

          return `${formatted} ${sizes[i]}/s`;
        });

        i18next.services.formatter.add("percent", (value, lng, options) =>
          new Intl.NumberFormat(lng, { style: "percent", ...options }).format(parseFloat(value) / 100.0),
        );
        i18next.services.formatter.add("date", (value, lng, options) =>
          new Intl.DateTimeFormat(lng, { ...options }).format(new Date(value)),
        );
        i18next.services.formatter.add("uptime", (value, lng) => uptime(value, i18next));
      },
      type: "3rdParty",
    },
  ],
};
