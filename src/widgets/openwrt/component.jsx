import Interface from "./methods/interface";
import System from "./methods/system";

export default function Component({ service }) {
  if (service.widget.interfaceName) {
    return <Interface service={service} />;
  }
  return <System service={service} />;
}
