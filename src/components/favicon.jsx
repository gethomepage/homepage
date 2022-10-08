/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { useRef, useEffect, useContext } from "react";

import themes from "utils/styles/themes";
import { ColorContext } from "utils/contexts/color";

export function Svg({ svgRef = null }) {
  const { color } = useContext(ColorContext);

  const { iconStart, iconEnd } = themes[color];

  return (
    <svg
      ref={svgRef}
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
            fill: iconStart,
          }}
        />
        <linearGradient
          id="homepage_favicon_gradient"
          gradientUnits="userSpaceOnUse"
          x1={200.746}
          y1={225.015}
          x2={764.986}
          y2={789.255}
        >
          <stop
            offset={0}
            style={{
              stopColor: iconStart,
            }}
          />
          <stop
            offset={1}
            style={{
              stopColor: iconEnd,
            }}
          />
        </linearGradient>
        <path
          d="M721.8 250.3c0-32.7 22.4-59.3 50.1-59.3H253.1c-27.7 0-50.1 26.5-50.1 59.3v582.2l90.2-75.7-.1-130.3H375v61.8l88-73.8 258.8 217.9V250.6"
          style={{
            fill: "url(#homepage_favicon_gradient})",
          }}
        />
      </g>
    </svg>
  );
}

export default function Favicon() {
  const svgRef = useRef();
  const imgRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const svg = svgRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;

    if (!svg || !img || !canvas) {
      return;
    }

    const xml = new XMLSerializer().serializeToString(svg);

    const svg64 = Buffer.from(xml).toString("base64");
    const b64Start = "data:image/svg+xml;base64,";

    // prepend a "header"
    const image64 = b64Start + svg64;

    // set it as the source of the img element
    img.onload = () => {
      // draw the image onto the canvas
      canvas.getContext("2d").drawImage(img, 0, 0);
      // canvas.width = 256;
      // canvas.height = 256;

      const link = window.document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = canvas.toDataURL("image/x-icon");
      document.getElementsByTagName("head")[0].appendChild(link);
    };

    img.src = image64;
  }, []);

  return (
    <div className="hidden">
      <Svg svgRef={svgRef} />
      <img width={64} height={64} ref={imgRef} />
      <canvas width={64} height={64} ref={canvasRef} />
    </div>
  );
}
