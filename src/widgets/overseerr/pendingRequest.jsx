import { useState, useEffect } from "react";
import Image from "next/image";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import classNames from "classnames";

import { formatProxyUrlWithSegments } from "utils/proxy/api-helpers";

const tmdbImageBaseUrl = "https://media.themoviedb.org/t/p/w220_and_h330_face";

function ImageThumbnail({ posterPath, requestUrl }) {
  const imageUrl = `${tmdbImageBaseUrl}/${posterPath}`;

  return (
    <div className="h-10 w-7 mr-2">
      <div className="relative h-full">
        <a href={requestUrl} target="_blank" rel="noreferrer">
          <Image
            src={imageUrl}
            alt="Your image"
            layout="fill"
            objectFit="contain"
            className="rounded-sm transition-transform duration-300 transform-gpu hover:scale-125"
          />
        </a>
      </div>
    </div>
  );
}

function ReleaseYear({ date }) {
  const year = (date || "").split("-")[0];

  if (!year) return null;

  return <span className="pl-2">({year})</span>;
}

export function RequestContainer({ children }) {
  return <div className="overflow-auto max-h-48">{children}</div>;
}

export function PendingRequest({ widget, applicationUrl, request, onApprove, onDecline }) {
  const [media, setMedia] = useState({});
  const { showImage, showReleaseYear, manageRequests } = widget?.pendingRequests ?? {};
  const mediaType = request?.media?.mediaType;
  const mediaId = request?.media?.tmdbId ?? request?.media?.tvdbId;
  const requestUrl = new URL(`${mediaType}/${mediaId}`, applicationUrl).toString();

  // Request details do not include media information such as title or image path
  // Fetch media details separately
  async function getMediaDetails() {
    if (!mediaId) return {};
    const url = formatProxyUrlWithSegments(widget, mediaType === "movie" ? "movieDetails" : "tvDetails", {
      id: mediaId,
    });

    return fetch(url).then((res) => res.json());
  }

  useEffect(() => {
    getMediaDetails().then(setMedia);
  }, [request, widget]);

  return (
    <div
      className={classNames(
        "flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 p-2",
        showImage ? "h-12" : "h-5",
      )}
    >
      <div className="flex flex-row w-full items-center">
        {showImage && <ImageThumbnail posterPath={media.posterPath} requestUrl={requestUrl} />}

        <div className="flex-grow text-left">
          <a href={requestUrl} target="_blank" rel="noreferrer">
            <span>{media.title ?? media.name}</span>
            {showReleaseYear && <ReleaseYear date={media.releaseDate} />}
          </a>
        </div>
        {manageRequests && (
          <div className="w-10 text-base flex flex-row justify-between">
            <IoMdCheckmarkCircleOutline
              className="hover:text-green-500 hover:scale-125"
              onClick={() => onApprove(request.id)}
            />
            <IoMdCloseCircleOutline
              className="hover:text-red-500 hover:scale-125"
              onClick={() => onDecline(request.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
