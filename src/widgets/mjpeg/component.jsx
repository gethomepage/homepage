import Image from "next/image";

export default function Component({ service }) {
  const { widget } = service;
  const { stream, fit = "contain" } = widget;

  return (
    <div>
      <style>{`
        .tv-static img {
          display: none !important;
        }
        .tv-static {
          margin: auto;
          background-image: repeating-radial-gradient(circle at 17% 32%, white, black 0.00085px);
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
      <div className="absolute top-0 bottom-0 right-0 left-0">
        <Image
          layout="fill"
          objectFit="fill"
          className="blur-md"
          src={stream}
          alt="stream"
          onError={(e) => {
            e.target.parentElement.parentElement.className = "tv-static";
          }}
        />
        <Image layout="fill" objectFit={fit} className="drop-shadow-2xl" src={stream} alt="stream" />
      </div>
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-clip shadow-[inset_0_0_200px_#000] shadow-theme-700/10 dark:shadow-theme-900/10" />
      <div className="h-[68px] overflow-clip" />
    </div>
  );
}
