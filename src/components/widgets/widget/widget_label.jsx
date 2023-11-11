export default function WidgetLabel({ label = "" }) {
  return (
    <div className="information-widget-label pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{label}</div>
  );
}
