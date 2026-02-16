import * as Icons from "react-icons/wi";
import { describe, expect, it } from "vitest";

import mapIcon from "./openmeteo-condition-map";

describe("utils/weather/openmeteo-condition-map", () => {
  it("maps known condition codes to day/night icons", () => {
    expect(mapIcon(95, "day")).toBe(Icons.WiDayThunderstorm);
    expect(mapIcon(95, "night")).toBe(Icons.WiNightAltThunderstorm);
  });

  it("falls back to a default icon for unknown codes", () => {
    expect(mapIcon(999999, "day")).toBe(Icons.WiDaySunny);
  });
});
