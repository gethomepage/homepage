import Memory from "./memory";
import Cpu from "./cpu";
import Sensor from "./sensor";
import Net from "./net";
import Process from "./process";
import Disk from "./disk";

export default function Component({ service }) {
  const { widget } = service;

  if (widget.metric === "memory") {
    return <Memory service={service} />;
  }

  if (widget.metric === "process") {
    return <Process service={service} />;
  }

  if (widget.metric.match(/^network:/)) {
    return <Net service={service} />;
  }

  if (widget.metric.match(/^sensor:/)) {
    return <Sensor service={service} />;
  }

  if (widget.metric.match(/^disk:/)) {
    return <Disk service={service} />;
  }

  if (widget.metric === "cpu") {
    return <Cpu service={service} />;
  }
}
