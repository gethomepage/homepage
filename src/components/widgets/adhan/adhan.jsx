import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";
import { WiSunrise, WiDaySunny, WiSunset, WiMoonrise, WiNightClear } from "react-icons/wi";
import Container from "../widget/container";
import Raw from "../widget/raw";
import WidgetIcon from "../widget/widget_icon";

const textSizes = {
  "4xl": "text-4xl",
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xl: "text-xl",
  lg: "text-lg",
  md: "text-md",
  sm: "text-sm",
  xs: "text-xs",
};

export default function PrayerTimesWidget({ options }) {
  const { text_size: textSize, latitude, longitude, method } = options;
  const { t, i18n } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState({});

  useEffect(() => {
    const coordinates = new Coordinates(latitude || 21.42251, longitude || 39.826168);

    let params;
    switch (method) {
      case "MuslimWorldLeague":
        params = CalculationMethod.MuslimWorldLeague();
        break;
      case "Egyptian":
        params = CalculationMethod.Egyptian();
        break;
      case "Karachi":
        params = CalculationMethod.Karachi();
        break;
      case "UmmAlQura":
        params = CalculationMethod.UmmAlQura();
        break;
      case "Dubai":
        params = CalculationMethod.Dubai();
        break;
      case "MoonsightingCommittee":
        params = CalculationMethod.MoonsightingCommittee();
        break;
      case "NorthAmerica":
        params = CalculationMethod.NorthAmerica();
        break;
      case "Kuwait":
        params = CalculationMethod.Kuwait();
        break;
      case "Qatar":
        params = CalculationMethod.Qatar();
        break;
      case "Singapore":
        params = CalculationMethod.Singapore();
        break;
      case "Turkey":
        params = CalculationMethod.Turkey();
        break;
      default:
        params = CalculationMethod.UmmAlQura(); // default method
    }

    const times = new PrayerTimes(coordinates, new Date(), params);

    setPrayerTimes({
      Fajr: times.fajr.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" }),
      Dhuhr: times.dhuhr.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" }),
      Asr: times.asr.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" }),
      Maghrib: times.maghrib.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" }),
      Isha: times.isha.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" }),
    });
  }, [latitude, longitude, method, i18n.language]);

  return (
    <Container options={options} additionalClassNames="information-widget-prayer-times">
      <Raw>
        <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4">
          <div className="flex flex-row self-center flex-wrap justify-between gap-2">
            <div className="bg-theme-900/70 rounded h-full text-xs px-1 flex flex-row items-center justify-center">
              <WidgetIcon icon={WiSunrise} size="2" />
              <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "text-xs"]}`}>
                {t("prayerTimes.fajr")}: {prayerTimes.Fajr}
              </span>
            </div>
            <div className="bg-theme-900/70 rounded h-full text-xs px-1 flex flex-row items-center justify-center">
              <WidgetIcon icon={WiDaySunny} size="2" />
              <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "text-xs"]}`}>
                {t("prayerTimes.dhuhr")}: {prayerTimes.Dhuhr}
              </span>
            </div>
            <div className="bg-theme-900/70 rounded h-full text-xs px-1 flex flex-row items-center justify-center">
              <WidgetIcon icon={WiSunset} size="2" />
              <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "text-xs"]}`}>
                {t("prayerTimes.asr")}: {prayerTimes.Asr}
              </span>
            </div>
            <div className="bg-theme-900/70 rounded h-full text-xs px-1 flex flex-row items-center justify-center">
              <WidgetIcon icon={WiMoonrise} size="2" />
              <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "text-xs"]}`}>
                {t("prayerTimes.maghrib")}: {prayerTimes.Maghrib}
              </span>
            </div>
            <div className="bg-theme-900/70 rounded h-full text-xs px-1 flex flex-row items-center justify-center">
              <WidgetIcon icon={WiNightClear} size="2" />
              <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "text-xs"]}`}>
                {t("prayerTimes.isha")}: {prayerTimes.Isha}
              </span>
            </div>
          </div>
        </div>
      </Raw>
    </Container>
  );
}
