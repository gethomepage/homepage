import * as Icons from "react-icons/wi";
import { describe, expect, it } from "vitest";

import mapIcon from "./openmeteo-condition-map";

describe("utils/weather/openmeteo-condition-map", () => {
  it("maps clear sky (code 0) to sun during the day and clear-night icon at night", () => {
    expect(mapIcon(0, "day")).toBe(Icons.WiDaySunny);
    expect(mapIcon(0, "night")).toBe(Icons.WiNightClear);
  });

  it("maps known condition codes to day/night icons", () => {
    expect(mapIcon(95, "day")).toBe(Icons.WiDayThunderstorm);
    expect(mapIcon(95, "night")).toBe(Icons.WiNightAltThunderstorm);
  });

  it("maps rain shower and snow codes correctly", () => {
    [80].forEach((code) => {
      expect(mapIcon(code, "day")).toBe(Icons.WiDaySprinkle);
      expect(mapIcon(code, "night")).toBe(Icons.WiNightAltSprinkle);
    });
    [81].forEach((code) => {
      expect(mapIcon(code, "day")).toBe(Icons.WiDayShowers);
      expect(mapIcon(code, "night")).toBe(Icons.WiNightAltShowers);
    });
    [82].forEach((code) => {
      expect(mapIcon(code, "day")).toBe(Icons.WiDayStormShowers);
      expect(mapIcon(code, "night")).toBe(Icons.WiNightAltStormShowers);
    });
    [85, 86].forEach((code) => {
      expect(mapIcon(code, "day")).toBe(Icons.WiDaySnow);
      expect(mapIcon(code, "night")).toBe(Icons.WiNightAltSnow);
    });
  });

  it("falls back to a default icon for unknown codes", () => {
    expect(mapIcon(999999, "day")).toBe(Icons.WiDaySunny);
  });
});
