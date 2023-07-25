import { useContext } from "react";
import Image from "next/future/image";

import { SettingsContext } from "utils/contexts/settings";
import { ThemeContext } from "utils/contexts/theme";

const iconSetURLs = {
  'mdi': "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/",
  'si' : "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/",
};

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
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        alt={alt}
      />
    );
  }

  // check mdi- or si- prefixed icons
  const prefix = icon.split("-")[0];
  const suffix = icon.split("-")[icon.split("-").length - 1];
  
  if (prefix in iconSetURLs) {
    // check whether icon ends with color code
    if (suffix.test(`[#][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]`)) {

      const iconColor = `${suffix}`;
      const iconName = icon.replace(`${prefix}-`, "").replace(".svg", "").replace(`-${suffix}`, "");
      const iconSource = `${iconSetURLs[prefix]}${iconName}.svg`;
      return (
        <div
          style={{
            width,
            height,
            maxWidth: '100%',
            maxHeight: '100%',
            background: `${iconColor}`,
            mask: `url(${iconSource}) no-repeat center / contain`,
            WebkitMask: `url(${iconSource}) no-repeat center / contain`,
          }}
        />
      );
    };
    
    // default to theme setting if no custom icon color code is provided
    const iconName = icon.replace(`${prefix}-`, "").replace(".svg", "");
    const iconSource = `${iconSetURLs[prefix]}${iconName}.svg`;
    return (
      <div
        style={{
          width,
          height,
          maxWidth: '100%',
          maxHeight: '100%',
          background: settings.iconStyle === "theme" ?
            `rgb(var(--color-${ theme === "dark" ? 300 : 900 }) / var(--tw-text-opacity, 1))` :
            "linear-gradient(180deg, rgb(var(--color-logo-start)), rgb(var(--color-logo-stop)))",
          mask: `url(${iconSource}) no-repeat center / contain`,
          WebkitMask: `url(${iconSource}) no-repeat center / contain`,
        }}
      />
    );

  }
 
  // fallback to dashboard-icons
  if (icon.endsWith(".svg")) {
    const iconName = icon.replace(".svg", "");
    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${iconName}.svg`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%"
        }}
        alt={alt}
      />
    );
  }
  
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
        maxHeight: "100%",
        maxWidth: "100%"
      }}
      alt={alt}
    />
  );
}
