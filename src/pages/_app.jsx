/* eslint-disable react/jsx-props-no-spreading */
import { SWRConfig } from "swr";
import { appWithTranslation } from "next-i18next";

import "styles/globals.css";
import "styles/theme.css";
import "styles/manrope.css";
import nextI18nextConfig from "../../next-i18next.config";

import { ColorProvider } from "utils/contexts/color";
import { ThemeProvider } from "utils/contexts/theme";
import { SettingsProvider } from "utils/contexts/settings";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ColorProvider>
        <ThemeProvider>
          <SettingsProvider>
            <Component {...pageProps} />
          </SettingsProvider>
        </ThemeProvider>
      </ColorProvider>
    </SWRConfig>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
