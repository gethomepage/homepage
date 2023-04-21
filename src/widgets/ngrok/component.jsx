import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";


function displayUrl(url , index){
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="flex flex-col pb-1 mx-1">
      <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
        <span className="absolute left-2 text-xs mt-[2px]">{url}</span>
      </div>
    </a>
  );
}


export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { 
    data: ngrokData, 
    error: ngrokError 
  } = useWidgetAPI(widget);
 
  if (ngrokError) {
    return <Container error={ngrokError} />;
  }

  if (ngrokData){
    if(ngrokData.tunnels.length === 0){
      return (
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("ngrok.no_active")}</span>
        </div>
      );
    }
  
  let runningTunnels = ngrokData.tunnels.length;
  if(runningTunnels > 5) runningTunnels = 5;

  return (
    <div>
      {ngrokData.tunnels.slice(0, runningTunnels).map((tunnel, index) => displayUrl(tunnel.public_url, index))}
    </div>
  );
}
}
