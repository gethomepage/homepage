import { PureComponent } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

import CustomTooltip from "./custom_tooltip";

class ChartDual extends PureComponent {
  render() {
    const { dataPoints, formatter, stack, label, stackOffset } = this.props;

    return (
      <div className="absolute -top-10 -left-2 h-[calc(100%+3em)] w-[calc(100%+1em)] z-0">
        <div className="overflow-clip z-10 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints} stackOffset={stackOffset ?? "none"}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--color-800))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgb(var(--color-800))" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--color-500))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="rgb(var(--color-500))" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <Area
                name={label[0]}
                stackId={(stack && stack[0]) ?? "1"}
                isAnimationActive={false}
                type="monotoneX"
                dataKey="a"
                stroke="rgb(var(--color-700))"
                fillOpacity={1}
                fill="url(#colorA)"
              />
              <Area
                name={label[1]}
                stackId={(stack && stack[1]) ?? "1"}
                isAnimationActive={false}
                type="monotoneX"
                dataKey="b"
                stroke="rgb(var(--color-500))"
                fillOpacity={1}
                fill="url(#colorB)"
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

export default ChartDual;
