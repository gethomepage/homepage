/* eslint-disable react/jsx-props-no-spreading */
import useSWR, { SWRConfig } from "swr";

import "styles/globals.css";
import "styles/weather-icons.css";
import "styles/theme.css";

import i18n from "utils/i18n";

const swr = (resource, init) => fetch(resource, init).then((res) => res.json());

function MyApp({ Component, pageProps }) {
  const { data } = useSWR(`/api/settings`, swr);
  console.log(data);
  if (data?.language) {
    console.log("custom language");
    i18n.changeLanguage(data.language);
  }

  return (
    <SWRConfig
      value={{
        fetcher: swr,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
