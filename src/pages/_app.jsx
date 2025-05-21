/* eslint-disable react/jsx-props-no-spreading */
import { appWithTranslation } from "next-i18next";
import Head from "next/head";
import "styles/globals.css";
import "styles/manrope.css";
import "styles/theme.css";
import { SWRConfig } from "swr";
import { ColorProvider } from "utils/contexts/color";
import { SettingsProvider } from "utils/contexts/settings";
import { TabProvider } from "utils/contexts/tab";
import { ThemeProvider } from "utils/contexts/theme";

import nextI18nextConfig from "../../next-i18next.config";

// eslint-disable-next-line no-unused-vars
const tailwindSafelist = [
  // TODO: remove pending https://github.com/tailwindlabs/tailwindcss/pull/17147
  "backdrop-blur",
  "backdrop-blur-xs",
  "backdrop-blur-sm",
  "backdrop-blur-md",
  "backdrop-blur-xl",
  "backdrop-saturate-0",
  "backdrop-saturate-50",
  "backdrop-saturate-100",
  "backdrop-saturate-150",
  "backdrop-saturate-200",
  "backdrop-brightness-0",
  "backdrop-brightness-50",
  "backdrop-brightness-75",
  "backdrop-brightness-90",
  "backdrop-brightness-95",
  "backdrop-brightness-100",
  "backdrop-brightness-105",
  "backdrop-brightness-110",
  "backdrop-brightness-125",
  "backdrop-brightness-150",
  "backdrop-brightness-200",
  "grid-cols-1",
  "md:grid-cols-1",
  "md:grid-cols-2",
  "lg:grid-cols-1",
  "lg:grid-cols-2",
  "lg:grid-cols-3",
  "lg:grid-cols-4",
  "lg:grid-cols-5",
  "lg:grid-cols-6",
  "lg:grid-cols-7",
  "lg:grid-cols-8",
  // for status
  "bg-white",
  "bg-black",
  "dark:bg-white",
  "bg-orange-400",
  "dark:bg-orange-400",
  // maxGroupColumns
  "3xl:basis-1/5",
  "3xl:basis-1/6",
  "3xl:basis-1/7",
  "3xl:basis-1/8",
  // yep
  "h-0 h-1 h-2 h-3 h-4 h-5 h-6 h-7 h-8 h-9 h-10 h-11 h-12 h-13 h-14 h-15 h-16 h-17 h-18 h-19 h-20 h-21 h-22 h-23 h-24 h-25 h-26 h-27 h-28 h-29 h-30 h-31 h-32 h-33 h-34 h-35 h-36 h-37 h-38 h-39 h-40 h-41 h-42 h-43 h-44 h-45 h-46 h-47 h-48 h-49 h-50 h-51 h-52 h-53 h-54 h-55 h-56 h-57 h-58 h-59 h-60 h-61 h-62 h-63 h-64 h-65 h-66 h-67 h-68 h-69 h-70 h-71 h-72 h-73 h-74 h-75 h-76 h-77 h-78 h-79 h-80 h-81 h-82 h-83 h-84 h-85 h-86 h-87 h-88 h-89 h-90 h-91 h-92 h-93 h-94 h-95 h-96",
  "sm:h-0 sm:h-1 sm:h-2 sm:h-3 sm:h-4 sm:h-5 sm:h-6 sm:h-7 sm:h-8 sm:h-9 sm:h-10 sm:h-11 sm:h-12 sm:h-13 sm:h-14 sm:h-15 sm:h-16 sm:h-17 sm:h-18 sm:h-19 sm:h-20 sm:h-21 sm:h-22 sm:h-23 sm:h-24 sm:h-25 sm:h-26 sm:h-27 sm:h-28 sm:h-29 sm:h-30 sm:h-31 sm:h-32 sm:h-33 sm:h-34 sm:h-35 sm:h-36 sm:h-37 sm:h-38 sm:h-39 sm:h-40 sm:h-41 sm:h-42 sm:h-43 sm:h-44 sm:h-45 sm:h-46 sm:h-47 sm:h-48 sm:h-49 sm:h-50 sm:h-51 sm:h-52 sm:h-53 sm:h-54 sm:h-55 sm:h-56 sm:h-57 sm:h-58 sm:h-59 sm:h-60 sm:h-61 sm:h-62 sm:h-63 sm:h-64 sm:h-65 sm:h-66 sm:h-67 sm:h-68 sm:h-69 sm:h-70 sm:h-71 sm:h-72 sm:h-73 sm:h-74 sm:h-75 sm:h-76 sm:h-77 sm:h-78 sm:h-79 sm:h-80 sm:h-81 sm:h-82 sm:h-83 sm:h-84 sm:h-85 sm:h-86 sm:h-87 sm:h-88 sm:h-89 sm:h-90 sm:h-91 sm:h-92 sm:h-93 sm:h-94 sm:h-95 sm:h-96",
  "md:h-0 md:h-1 md:h-2 md:h-3 md:h-4 md:h-5 md:h-6 md:h-7 md:h-8 md:h-9 md:h-10 md:h-11 md:h-12 md:h-13 md:h-14 md:h-15 md:h-16 md:h-17 md:h-18 md:h-19 md:h-20 md:h-21 md:h-22 md:h-23 md:h-24 md:h-25 md:h-26 md:h-27 md:h-28 md:h-29 md:h-30 md:h-31 md:h-32 md:h-33 md:h-34 md:h-35 md:h-36 md:h-37 md:h-38 md:h-39 md:h-40 md:h-41 md:h-42 md:h-43 md:h-44 md:h-45 md:h-46 md:h-47 md:h-48 md:h-49 md:h-50 md:h-51 md:h-52 md:h-53 md:h-54 md:h-55 md:h-56 md:h-57 md:h-58 md:h-59 md:h-60 md:h-61 md:h-62 md:h-63 md:h-64 md:h-65 md:h-66 md:h-67 md:h-68 md:h-69 md:h-70 md:h-71 md:h-72 md:h-73 md:h-74 md:h-75 md:h-76 md:h-77 md:h-78 md:h-79 md:h-80 md:h-81 md:h-82 md:h-83 md:h-84 md:h-85 md:h-86 md:h-87 md:h-88 md:h-89 md:h-90 md:h-91 md:h-92 md:h-93 md:h-94 md:h-95 md:h-96",
  "lg:h-0 lg:h-1 lg:h-2 lg:h-3 lg:h-4 lg:h-5 lg:h-6 lg:h-7 lg:h-8 lg:h-9 lg:h-10 lg:h-11 lg:h-12 lg:h-13 lg:h-14 lg:h-15 lg:h-16 lg:h-17 lg:h-18 lg:h-19 lg:h-20 lg:h-21 lg:h-22 lg:h-23 lg:h-24 lg:h-25 lg:h-26 lg:h-27 lg:h-28 lg:h-29 lg:h-30 lg:h-31 lg:h-32 lg:h-33 lg:h-34 lg:h-35 lg:h-36 lg:h-37 lg:h-38 lg:h-39 lg:h-40 lg:h-41 lg:h-42 lg:h-43 lg:h-44 lg:h-45 lg:h-46 lg:h-47 lg:h-48 lg:h-49 lg:h-50 lg:h-51 lg:h-52 lg:h-53 lg:h-54 lg:h-55 lg:h-56 lg:h-57 lg:h-58 lg:h-59 lg:h-60 lg:h-61 lg:h-62 lg:h-63 lg:h-64 lg:h-65 lg:h-66 lg:h-67 lg:h-68 lg:h-69 lg:h-70 lg:h-71 lg:h-72 lg:h-73 lg:h-74 lg:h-75 lg:h-76 lg:h-77 lg:h-78 lg:h-79 lg:h-80 lg:h-81 lg:h-82 lg:h-83 lg:h-84 lg:h-85 lg:h-86 lg:h-87 lg:h-88 lg:h-89 lg:h-90 lg:h-91 lg:h-92 lg:h-93 lg:h-94 lg:h-95 lg:h-96",
  "xl:h-0 xl:h-1 xl:h-2 xl:h-3 xl:h-4 xl:h-5 xl:h-6 xl:h-7 xl:h-8 xl:h-9 xl:h-10 xl:h-11 xl:h-12 xl:h-13 xl:h-14 xl:h-15 xl:h-16 xl:h-17 xl:h-18 xl:h-19 xl:h-20 xl:h-21 xl:h-22 xl:h-23 xl:h-24 xl:h-25 xl:h-26 xl:h-27 xl:h-28 xl:h-29 xl:h-30 xl:h-31 xl:h-32 xl:h-33 xl:h-34 xl:h-35 xl:h-36 xl:h-37 xl:h-38 xl:h-39 xl:h-40 xl:h-41 xl:h-42 xl:h-43 xl:h-44 xl:h-45 xl:h-46 xl:h-47 xl:h-48 xl:h-49 xl:h-50 xl:h-51 xl:h-52 xl:h-53 xl:h-54 xl:h-55 xl:h-56 xl:h-57 xl:h-58 xl:h-59 xl:h-60 xl:h-61 xl:h-62 xl:h-63 xl:h-64 xl:h-65 xl:h-66 xl:h-67 xl:h-68 xl:h-69 xl:h-70 xl:h-71 xl:h-72 xl:h-73 xl:h-74 xl:h-75 xl:h-76 xl:h-77 xl:h-78 xl:h-79 xl:h-80 xl:h-81 xl:h-82 xl:h-83 xl:h-84 xl:h-85 xl:h-86 xl:h-87 xl:h-88 xl:h-89 xl:h-90 xl:h-91 xl:h-92 xl:h-93 xl:h-94 xl:h-95 xl:h-96",
  "2xl:h-0 2xl:h-1 2xl:h-2 2xl:h-3 2xl:h-4 2xl:h-5 2xl:h-6 2xl:h-7 2xl:h-8 2xl:h-9 2xl:h-10 2xl:h-11 2xl:h-12 2xl:h-13 2xl:h-14 2xl:h-15 2xl:h-16 2xl:h-17 2xl:h-18 2xl:h-19 2xl:h-20 2xl:h-21 2xl:h-22 2xl:h-23 2xl:h-24 2xl:h-25 2xl:h-26 2xl:h-27 2xl:h-28 2xl:h-29 2xl:h-30 2xl:h-31 2xl:h-32 2xl:h-33 2xl:h-34 2xl:h-35 2xl:h-36 2xl:h-37 2xl:h-38 2xl:h-39 2xl:h-40 2xl:h-41 2xl:h-42 2xl:h-43 2xl:h-44 2xl:h-45 2xl:h-46 2xl:h-47 2xl:h-48 2xl:h-49 2xl:h-50 2xl:h-51 2xl:h-52 2xl:h-53 2xl:h-54 2xl:h-55 2xl:h-56 2xl:h-57 2xl:h-58 2xl:h-59 2xl:h-60 2xl:h-61 2xl:h-62 2xl:h-63 2xl:h-64 2xl:h-65 2xl:h-66 2xl:h-67 2xl:h-68 2xl:h-69 2xl:h-70 2xl:h-71 2xl:h-72 2xl:h-73 2xl:h-74 2xl:h-75 2xl:h-76 2xl:h-77 2xl:h-78 2xl:h-79 2xl:h-80 2xl:h-81 2xl:h-82 2xl:h-83 2xl:h-84 2xl:h-85 2xl:h-86 2xl:h-87 2xl:h-88 2xl:h-89 2xl:h-90 2xl:h-91 2xl:h-92 2xl:h-93 2xl:h-94 2xl:h-95 2xl:h-96",
];

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
