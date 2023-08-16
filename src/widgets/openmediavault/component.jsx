import ServicesGetStatus from "./methods/services_get_status";
import SmartGetList from "./methods/smart_get_list";
import DownloaderGetDownloadList from "./methods/downloader_get_downloadlist";
import ZfsGetStats from "./methods/zfs_get_stats";

export default function Component({ service }) {
  switch (service.widget.method) {
    case "services.getStatus":
      return <ServicesGetStatus service={service} />;
    case "smart.getListBg":
      return <SmartGetList service={service} />;
    case "downloader.getDownloadList":
      return <DownloaderGetDownloadList service={service} />;
    case "zfs.getStats":
      return <ZfsGetStats service={service} />;
    default:
      return null;
  }
}
