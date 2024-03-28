/* eslint-disable react/jsx-props-no-spreading */
import { SWRConfig } from "swr";
import { appWithTranslation } from "next-i18next";
import Head from "next/head";

import "styles/globals.css";
import "styles/theme.css";
import "styles/manrope.css";
import nextI18nextConfig from "../../next-i18next.config";

import { ColorProvider } from "utils/contexts/color";
import { ThemeProvider } from "utils/contexts/theme";
import { SettingsProvider } from "utils/contexts/settings";
import { TabProvider } from "utils/contexts/tab";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
      }}
    >
      <Head>
        {/* https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <ColorProvider>
        <ThemeProvider>
          <SettingsProvider>
            <TabProvider>
              <Component {...pageProps} />
            </TabProvider>
          </SettingsProvider>
        </ThemeProvider>
      </ColorProvider>
    </SWRConfig>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
