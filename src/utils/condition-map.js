// Code primarely based on Flame's ConditionMap class
// https://github.com/pawelmalak/flame/blob/master/client/src/components/UI/Icons/WeatherIcon/IconMapping.ts

import * as Icons from "react-icons/wi";

const conditions = [
  {
    code: 1000,
    icon: {
      day: Icons.WiDaySunny,
      night: Icons.WiNightClear,
    },
  },
  {
    code: 1003,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightPartlyCloudy,
    },
  },
  {
    code: 1006,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightCloudy,
    },
  },
  {
    code: 1009,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightCloudy,
    },
  },
  {
    code: 1030,
    icon: {
      day: Icons.WiDayFog,
      night: Icons.WiNightFog,
    },
  },
  {
    code: 1063,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1066,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1069,
    icon: {
      day: Icons.WiDayRainMix,
      night: Icons.WiNightRainMix,
    },
  },
  {
    code: 1072,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightSleet,
    },
  },
  {
    code: 1087,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightThunderstorm,
    },
  },
  {
    code: 1114,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1117,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1135,
    icon: {
      day: Icons.WiDayFog,
      night: Icons.WiNightFog,
    },
  },
  {
    code: 1147,
    icon: {
      day: Icons.WiDayFog,
      night: Icons.WiNightFog,
    },
  },
  {
    code: 1150,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1153,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1168,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightSleet,
    },
  },
  {
    code: 1171,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightSleet,
    },
  },
  {
    code: 1180,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1183,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1186,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1189,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1192,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1195,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1198,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightSleet,
    },
  },
  {
    code: 1201,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightSleet,
    },
  },
  {
    code: 1204,
    icon: {
      day: Icons.WiDayRainMix,
      night: Icons.WiNightRainMix,
    },
  },
  {
    code: 1207,
    icon: {
      day: Icons.WiDayRainMix,
      night: Icons.WiNightRainMix,
    },
  },
  {
    code: 1210,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1213,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1216,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1219,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1222,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1225,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1237,
    icon: {
      day: Icons.WiDayHail,
      night: Icons.WiNightHail,
    },
  },
  {
    code: 1240,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1243,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1246,
    icon: {
      day: Icons.WiDayRain,
      night: Icons.WiNightRain,
    },
  },
  {
    code: 1249,
    icon: {
      day: Icons.WiDayRainMix,
      night: Icons.WiNightRainMix,
    },
  },
  {
    code: 1252,
    icon: {
      day: Icons.WiDayRainMix,
      night: Icons.WiNightRainMix,
    },
  },
  {
    code: 1255,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1258,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightSnow,
    },
  },
  {
    code: 1261,
    icon: {
      day: Icons.WiDayHail,
      night: Icons.WiNightHail,
    },
  },
  {
    code: 1264,
    icon: {
      day: Icons.WiDayHail,
      night: Icons.WiNightHail,
    },
  },
  {
    code: 1273,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightThunderstorm,
    },
  },
  {
    code: 1276,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightThunderstorm,
    },
  },
  {
    code: 1279,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightThunderstorm,
    },
  },
  {
    code: 1282,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightThunderstorm,
    },
  },
];

export default function mapIcon(weatherStatusCode, timeOfDay) {
  const mapping = conditions.find((condition) => condition.code === weatherStatusCode);

  if (mapping) {
    if (timeOfDay === "day") {
      return mapping.icon.day;
    }

    if (timeOfDay === "night") {
      return mapping.icon.night;
    }
  }

  return Icons.WiDaySunny;
}
