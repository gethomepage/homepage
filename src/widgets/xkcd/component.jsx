import Image from "next/image";

import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";

export default function Component({ service }) {
    const { widget } = service;
    const { data: apiData, error: apiError } = useWidgetAPI(widget);
    const { fit = "contain" } = widget;

    if(apiError || !apiData) {
      return <Container service={service} error={apiError} />;
    }
    return (
        <div>
            <style>{`
        .tv-static img {
          display: none !important;
        }
        .tv-static {
          margin: auto;
          background-image: repeating-radial-gradient(circle at 17% 32%, black, white 0.00085px);
          animation: tv-static 5s linear infinite;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
        @keyframes tv-static {
          from {
            background-size: 100% 100%;
          }
          to {
            background-size: 200% 200%;
          }
        }
            `}</style>
            <div>
              <Image 
              layout="fill"
              objectFit="fill"
              className="blur-sm dark opacity-10"
              src={apiData.img}
              title={apiData.title}
              alt={apiData.alt}
              onError={(e) => {
                  e.target.parentElement.parentElement.className = "tv-static";
              }}
              />
              <Image height="100%" width="90%" layout="responsive" objectFit={fit} className="drop-shadow-2x1" src={apiData.img} alt=""/>
            </div>
            <div className="absolute top-0 right-0 bottom-0 left-0 overflow-clip shadow-[inset_0_0_200px_#000] shadow-theme-700/10 dark:shadow-theme-900/10" />
            <div className="text-theme-800 py-2 dark:text-theme-200 text-center text-xl">{apiData.title}</div>
        </div>
    );
}