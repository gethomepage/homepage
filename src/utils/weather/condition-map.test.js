import * as Icons from "react-icons/wi";
import { describe, expect, it } from "vitest";

import mapIcon from "./condition-map";

describe("utils/weather/condition-map", () => {
  it("maps known condition codes to day/night icons", () => {
    expect(mapIcon(1000, "day")).toBe(Icons.WiDaySunny);
    expect(mapIcon(1000, "night")).toBe(Icons.WiNightClear);
  });

  it("falls back to a default icon for unknown codes", () => {
    expect(mapIcon(999999, "day")).toBe(Icons.WiDaySunny);
  });
});
