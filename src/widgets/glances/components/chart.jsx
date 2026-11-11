import { PureComponent } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

import CustomTooltip from "./custom_tooltip";

export function yAxisRange(chartMin, chartMax) {
  const min = parseFloat(chartMin);
  const max = parseFloat(chartMax);
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (!hasMin && !hasMax) return undefined;
  if (hasMin && hasMax && min >= max) return undefined;

  return [hasMin ? min : 0, hasMax ? max : "auto"];
}

class Chart extends PureComponent {
  render() {
    const { dataPoints, formatter, label, chartMin, chartMax } = this.props;
    const range = yAxisRange(chartMin, chartMax);

    return (
      <div className="absolute -top-10 -left-2 h-[calc(100%+3em)] w-[calc(100%+1em)] z-0">
        <div className="overflow-clip z-10 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints}>
              {range && <YAxis hide domain={range} />}
              <defs>
                <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--color-500))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="rgb(var(--color-500))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                name={label[0]}
                isAnimationActive={false}
                type="monotoneX"
                dataKey="value"
                stroke="rgb(var(--color-500))"
                fillOpacity={1}
                fill="url(#color)"
                baseLine={0}
              />
              <Tooltip
                allowEscapeViewBox={{ x: false, y: false }}
                formatter={formatter}
                content={<CustomTooltip formatter={formatter} />}
                classNames="rounded-md text-xs p-0.5"
                contentStyle={{
                  backgroundColor: "rgb(var(--color-800))",
                  color: "rgb(var(--color-100))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

export default Chart;
