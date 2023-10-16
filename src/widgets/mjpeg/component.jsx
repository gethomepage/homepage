import Image from "next/image";
import { useState } from 'react';

export default function Component({ service }) {
  const { widget } = service;
  const { stream, fit = "contain" } = widget;
  const [src, setImgSrc] = useState(stream);

  return (
    <div>
      <div className="absolute top-0 bottom-0 right-0 left-0">
        <Image layout="fill" objectFit="fill" className="blur-md" src={src} alt="stream" onError={() => setImgSrc('https://images.unsplash.com/photo-1610337673044-720471f83677?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80')} />
        <Image layout="fill" objectFit={fit} className="drop-shadow-2xl" src={src} alt="stream" onError={() => setImgSrc('https://images.unsplash.com/photo-1610337673044-720471f83677?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80')} />
      </div>
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-clip shadow-[inset_0_0_200px_#000] shadow-theme-700/10 dark:shadow-theme-900/10" />
      <div className="h-[68px] overflow-clip" />
    </div>
  );
}
