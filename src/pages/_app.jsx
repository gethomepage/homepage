/* eslint-disable react/jsx-props-no-spreading */
import { SWRConfig } from "swr";
import "styles/globals.css";
import "styles/weather-icons.css";
import "styles/theme.css";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
