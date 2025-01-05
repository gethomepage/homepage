import { useContext } from "react";
import Image from "next/future/image";

import { SettingsContext } from "utils/contexts/settings";
import { ThemeContext } from "utils/contexts/theme";

const iconSetURLs = {
  mdi: "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/",
  si: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/",
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

  if (prefix === "sh") {
    const iconName = icon.replace("sh-", "").replace(".svg", "").replace(".png", "").replace(".webp", "");

    let extension;
    if (icon.endsWith(".svg")) {
      extension = "svg";
    } else if (icon.endsWith(".webp")) {
      extension = "webp";
    } else {
      extension = "png";
    }

    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/selfhst/icons@main/${extension}/${iconName}.${extension}`}
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

  if (prefix in iconSetURLs) {
    // default to theme setting
    let iconName = icon.replace(`${prefix}-`, "").replace(".svg", "");
    let iconColor =
      settings.iconStyle === "theme"
        ? `rgb(var(--color-${theme === "dark" ? 300 : 900}) / var(--tw-text-opacity, 1))`
        : "linear-gradient(180deg, rgb(var(--color-logo-start)), rgb(var(--color-logo-stop)))";

    // use custom hex color if provided
    const colorMatches = icon.match(/[#][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9]$/i);
    if (colorMatches?.length) {
      iconName = icon.replace(`${prefix}-`, "").replace(".svg", "").replace(`-${colorMatches[0]}`, "");
      iconColor = `${colorMatches[0]}`;
    }

    const iconSource = `${iconSetURLs[prefix]}${iconName}.svg`;

    return (
      <div
        style={{
          width,
          height,
          maxWidth: "100%",
          maxHeight: "100%",
          background: `${iconColor}`,
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
        src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${iconName}.svg`}
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

  if (icon.endsWith(".webp")) {
    const iconName = icon.replace(".webp", "");
    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/${iconName}.webp`}
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

  const iconName = icon.replace(".png", "");
  return (
    <Image
      src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${iconName}.png`}
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
