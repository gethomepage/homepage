import { useTranslation } from "next-i18next/pages";
import useSWR from "swr";

import Error from "../widget/error";
import Resource from "../widget/resource";
import Resources from "../widget/resources";
import WidgetLabel from "../widget/widget_label";

import ResolvedIcon from "components/resolvedicon";
import { formatValue, getValue } from "widgets/customapi/mappings";

// Resource takes an icon as a component. Build one per distinct icon string and keep it, so a
// re-render on every SWR refresh does not remount the image.
const iconComponents = new Map();

function iconComponent(icon) {
  if (!iconComponents.has(icon)) {
    iconComponents.set(icon, function MappingIcon() {
      return <ResolvedIcon icon={icon} width={20} height={20} alt="" />;
    });
  }
  return iconComponents.get(icon);
}

export default function Widget({ options }) {
  const { t } = useTranslation();

  const { refreshInterval = 10000 } = options;
  const mappings = Array.isArray(options.mappings) ? options.mappings : [];

  const { data, error } = useSWR(`/api/widgets/customapi?index=${options.index}`, {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (error || data?.error) {
    return <Error options={options} />;
  }

  return (
    <Resources options={options} additionalClassNames="information-widget-customapi">
      {mappings.map((mapping) => (
        <Resource
          key={mapping.label}
          icon={mapping.icon ? iconComponent(mapping.icon) : undefined}
          label={mapping.label}
          value={data ? formatValue(t, mapping, getValue(mapping.field, data)) : "-"}
        />
      ))}
      {options.label && <WidgetLabel label={options.label} />}
    </Resources>
  );
}
