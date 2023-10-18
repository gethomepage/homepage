export default function WidgetIcon({ icon, size = "s", pulse = false }) {
  const Icon = icon;
  let additionalClasses = "information-widget-icon text-theme-800 dark:text-theme-200 ";

  switch (size) {
    case "m":
      additionalClasses += "w-6 h-6 ";
      break;
    case "l":
      additionalClasses += "w-8 h-8 ";
      break;
    case "xl":
      additionalClasses += "w-10 h-10 ";
      break;
    default:
      additionalClasses += "w-5 h-5 ";
  }

  if (pulse) {
    additionalClasses += "animate-pulse ";
  }

  return <Icon className={additionalClasses} />;
}
