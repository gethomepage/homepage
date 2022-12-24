import { BsDownload, BsPause, BsUpload, BsExclamationTriangle, BsThreeDots, BsCheckLg } from "react-icons/bs";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function secondsToTime(totalSeconds) {
  const seconds = Math.floor((totalSeconds) % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function secondsToString(totalSeconds) {
  const { hours, minutes, seconds } = secondsToTime(totalSeconds);
  const parts = [];
  if (hours > 0) {
    parts.push(hours);
  }
  parts.push(minutes);
  parts.push(seconds);

  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

function getIconFromTorrentState(state) {
  switch(state) {
    case 'pausedUP':
    case 'pausedDL':
      return <BsPause className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />;
    case 'uploading':
    case 'queuedUP':
    case 'stalledUP':
    case 'checkingUP':
    case 'forcedUP':
      return <BsUpload className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />;
    case 'allocating':
    case 'downloading':
    case 'metaDL':
    case 'queuedDL':
    case 'stalledDL':
    case 'checkingDL':
    case 'forcedDL':
      return <BsDownload className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />;
    case 'checkingResumeData':
    case 'moving':
      return <BsThreeDots className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />;
    case 'missingFiles':
    case 'error':
    default:
      return <BsExclamationTriangle className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />;
  }
}

function readEtaFromTorrent(state) {
  switch(state) {
    case 'allocating':
    case 'downloading':
    case 'metaDL':
    case 'queuedDL':
    case 'stalledDL':
    case 'checkingDL':
    case 'forcedDL':
      return true;
    case 'error':
    default:
      return false;
  }
}

function TorrentEntry({ torrent }) {
  const { state, name, progress, eta, upspeed, dlspeed } = torrent;
  const { t } = useTranslation();

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${progress * 100}%`,
        }}
      />
      <div className="text-xs z-10 self-center ml-1">
        {getIconFromTorrentState(state)}
      </div>
      <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">{name}</div>
      </div>
      <div className="self-center text-xs flex justify-end w-28 mr-2 z-10">
        {t("common.byterate", { value: dlspeed, decimals: 1 })}
      </div>
      <div className="self-center text-xs flex justify-end w-28 mr-2 z-10">
        {t("common.byterate", { value: upspeed, decimals: 1 })}
      </div>
      <div className="self-center text-xs flex justify-end w-28 mr-2 z-10">
        {readEtaFromTorrent(state) === true ? secondsToString(eta) :
          <BsCheckLg className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents/info");

  if (torrentError) {
    return <Container error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
  }

  const leech = torrentData.length - completed;

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block label="qbittorrent.download" value={t("common.byterate", { value: rateDl, decimals: 1 })} />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
        <Block label="qbittorrent.upload" value={t("common.byterate", { value: rateUl, decimals: 1 })} />
      </Container>
      <div className={service.widget.fields?.includes('torrents') ? "flex flex-col w-full p-1" : "hidden"}>
        {torrentData.map((torrent) => (
          <TorrentEntry key={torrent.Id} torrent={torrent} />
        ))}
      </div>
    </>
  );
}
