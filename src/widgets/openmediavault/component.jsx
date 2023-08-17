import ServicesGetStatus from "./methods/services_get_status";
import SmartGetList from "./methods/smart_get_list";
import DownloaderGetDownloadList from "./methods/downloader_get_downloadlist";
import AptEnumerateUpgraded from "./methods/apt_enumerateUpgraded";

export default function Component({ service }) {
  switch (service.widget.method) {
    case "services.getStatus":
      return <ServicesGetStatus service={service} />;
    case "smart.getListBg":
      return <SmartGetList service={service} />;
    case "downloader.getDownloadList":
      return <DownloaderGetDownloadList service={service} />;
    case "apt.enumerateUpgraded":
      return <AptEnumerateUpgraded service={service} />;
    default:
      return null;
  }
}
