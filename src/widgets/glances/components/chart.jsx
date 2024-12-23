import { PureComponent } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

import CustomTooltip from "./custom_tooltip";

class Chart extends PureComponent {
  render() {
    const { dataPoints, formatter, label } = this.props;

    return (
      <div className="absolute -top-10 -left-2 h-[calc(100%+3em)] w-[calc(100%+1em)] z-0">
        <div className="overflow-clip z-10 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints}>
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
