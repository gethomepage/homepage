import { useContext } from "react";
import Image from "next/future/image";

import { SettingsContext } from "utils/contexts/settings";
import { ThemeContext } from "utils/contexts/theme";


export default function ResolvedIcon({ icon, width = 32, height = 32, alt = "logo" }) {
  const { settings } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);

  // direct or relative URLs
  if (icon.startsWith("http") || icon.startsWith("/")) {
    return (
      <Image
        src={`${icon}`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
        }}
        alt={alt}
      />
    );
  }

  const prefix = icon.split("-")[0]
  const prefixPaths = {
    'mdi': "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/",
    'si' : "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/",
  };

  if (prefix in prefixPaths) {
    // get icon Source
    const iconName = icon.replace(`${prefix}-`, "").replace(".svg", "");
    const iconSource = `${prefixPaths[prefix]}${iconName}.svg`;

    const gradientStyle = "linear-gradient(180deg, rgb(var(--color-logo-start)), rgb(var(--color-logo-stop)))";
    const themeStyle = `rgb(var(--color-${ theme === "dark" ? 300 : 900 }) / var(--tw-text-opacity))`;

    const setting = settings.iconStyle || "gradient";
    const background = setting === "gradient" ? gradientStyle : themeStyle;
    
    return (
      <div
        style={{
          width,
          height,
          maxWidth: '100%',
          maxHeight: '100%',
          background,
          mask: `url(${iconSource}) no-repeat center / contain`,
          WebkitMask: `url(${iconSource}) no-repeat center / contain`,
        }}
      />
    );
  }

  // fallback to dashboard-icons
  const iconName = icon.replace(".png", "");
  return (
    <Image
      src={`https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${iconName}.png`}
      width={width}
      height={height}
      style={{
        width,
        height,
        objectFit: "contain",
      }}
      alt={alt}
    />
  );
}
