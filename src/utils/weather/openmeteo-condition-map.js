import * as Icons from "react-icons/wi";

// see https://open-meteo.com/en/docs

const conditions = [
  {
    code: 1,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightAltCloudy,
    },
  },
  {
    code: 2,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightAltCloudy,
    },
  },
  {
    code: 3,
    icon: {
      day: Icons.WiDayCloudy,
      night: Icons.WiNightAltCloudy,
    },
  },
  {
    code: 45,
    icon: {
      day: Icons.WiDayFog,
      night: Icons.WiNightFog,
    },
  },
  {
    code: 48,
    icon: {
      day: Icons.WiDayFog,
      night: Icons.WiNightFog,
    },
  },
  {
    code: 51,
    icon: {
      day: Icons.WiDaySprinkle,
      night: Icons.WiNightAltSprinkle,
    },
  },
  {
    code: 53,
    icon: {
      day: Icons.WiDaySprinkle,
      night: Icons.WiNightAltSprinkle,
    },
  },
  {
    code: 55,
    icon: {
      day: Icons.WiDaySprinkle,
      night: Icons.WiNightAltSprinkle,
    },
  },
  {
    code: 56,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightAltSleet,
    },
  },
  {
    code: 57,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightAltSleet,
    },
  },
  {
    code: 61,
    icon: {
      day: Icons.WiDayShowers,
      night: Icons.WiNightAltShowers,
    },
  },
  {
    code: 63,
    icon: {
      day: Icons.WiDayShowers,
      night: Icons.WiNightAltShowers,
    },
  },
  {
    code: 65,
    icon: {
      day: Icons.WiDayShowers,
      night: Icons.WiNightAltShowers,
    },
  },
  {
    code: 66,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightAltSleet,
    },
  },
  {
    code: 67,
    icon: {
      day: Icons.WiDaySleet,
      night: Icons.WiNightAltSleet,
    },
  },
  {
    code: 71,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 73,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 75,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 77,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 80,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 81,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 82,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 85,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 86,
    icon: {
      day: Icons.WiDaySnow,
      night: Icons.WiNightAltSnow,
    },
  },
  {
    code: 95,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightAltThunderstorm,
    },
  },
  {
    code: 96,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightAltThunderstorm,
    },
  },
  {
    code: 99,
    icon: {
      day: Icons.WiDayThunderstorm,
      night: Icons.WiNightAltThunderstorm,
    },
  },
];

export default function mapIcon(weatherStatusCode, timeOfDay) {
  const mapping = conditions.find((condition) => condition.code === weatherStatusCode);
  console.log(weatherStatusCode, timeOfDay, mapping);

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
