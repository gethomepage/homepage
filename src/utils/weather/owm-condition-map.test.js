import * as Icons from "react-icons/wi";
import { describe, expect, it } from "vitest";

import mapIcon from "./owm-condition-map";

describe("utils/weather/owm-condition-map", () => {
  it("maps known condition codes to day/night icons", () => {
    expect(mapIcon(804, "day")).toBe(Icons.WiCloudy);
    expect(mapIcon(500, "night")).toBe(Icons.WiNightAltRain);
  });

  it("falls back to a default icon for unknown codes", () => {
    expect(mapIcon(999999, "day")).toBe(Icons.WiDaySunny);
  });
});
