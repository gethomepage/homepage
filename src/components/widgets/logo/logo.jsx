import Image from "next/future/image";

export default function Logo({ options }) {
  return (
    <div className="w-12 h-12 flex flex-row items-center align-middle mr-3 self-center">
      {options.source ?
        <Image src={`${options.source}`} width={48} height={48} alt="logo" /> :

        // if source parameter is not set, use fallback homepage logo
        <div className="w-12 h-12 flex flex-row items-center align-middle mr-3 self-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            style={{
              enableBackground: "new 0 0 1024 1024",
            }}
            xmlSpace="preserve"
            className="w-full h-full"
          >
            <style>
              {
                ".st0{display:none}.st3{stroke-linecap:square}.st3,.st4{fill:none;stroke:#fff;stroke-miterlimit:10}.st6{display:inline;fill:#333}.st7{fill:#fff}"
              }
            </style>
            <g id="Icon">
              <path
                d="M771.9 191c27.7 0 50.1 26.5 50.1 59.3v186.4l-100.2.3V250.3c0-32.8 22.4-59.3 50.1-59.3z"
                style={{
                  fill: "rgba(var(--color-logo-start))",
                }}
              />
              <linearGradient
                id="homepage_logo_gradient"
                gradientUnits="userSpaceOnUse"
                x1={200.746}
                y1={225.015}
                x2={764.986}
                y2={789.255}
              >
                <stop
                  offset={0}
                  style={{
                    stopColor: "rgba(var(--color-logo-start))",
                  }}
                />
                <stop
                  offset={1}
                  style={{
                    stopColor: "rgba(var(--color-logo-stop))",
                  }}
                />
              </linearGradient>
              <path
                d="M721.8 250.3c0-32.7 22.4-59.3 50.1-59.3H253.1c-27.7 0-50.1 26.5-50.1 59.3v582.2l90.2-75.7-.1-130.3H375v61.8l88-73.8 258.8 217.9V250.6"
                style={{
                  fill: "url(#homepage_logo_gradient)",
                }}
              />
            </g>
          </svg>
        </div>
      }
    </div>
  )
}
