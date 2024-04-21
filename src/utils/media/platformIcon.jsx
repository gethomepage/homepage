import { BsAndroid2, BsApple, BsBrowserChrome, BsBrowserEdge, BsBrowserFirefox, BsPlaystation, BsWindows, BsXbox } from "react-icons/bs";
import { SiLg, SiLinux, SiOperagx, SiPlex, SiRoku, SiSafari, SiSamsung, SiWii } from "react-icons/si";

export default function PlatformIcon({ platform, opacity }) {
  return (
    <div className="z-10 self-center ml-1 mr-1 h-3.5">
      <div className="w-4 text-sm z-10 overflow-hidden justify-start">
        {(platform === "android" || platform === "chromecast") && <BsAndroid2 className={opacity} />}
        {(platform === "apple tv" || platform === "tvos" || platform === "ios" || 
          platform === "ipad" || platform === "iphone" || platform === "osx" ||
          platform === "macos") && <BsApple className={opacity} />}
        {platform === "chrome" && <BsBrowserChrome className={opacity} />}
        {platform === "firefox" && <BsBrowserFirefox className={opacity} />}
        {platform === "linux" && <SiLinux className={opacity} />}
        {(platform === "microsoft edge" || platform === "internet explorer") && <BsBrowserEdge className={opacity} />}
        {(platform === "netcast" || platform === "webos") && <SiLg className={opacity} />}
        {(platform === "opera" || platform === "vizio") && <SiOperagx className={opacity} />}
        {platform === "playstation" && <BsPlaystation className={opacity} />}
        {(platform === "plex home theater" || platform === "plex media player" ||
          platform === "plexamp" || platform === "plextogether") && <SiPlex className={opacity} />}
        {platform === "roku" && <SiRoku className={opacity} />}
        {platform === "safari" && <SiSafari className={opacity} />}
        {(platform === "samsung" || platform === "tizen") && <SiSamsung className={opacity} />}
        {platform === "wiiu" && <SiWii className={opacity} />}
        {(platform === "windows" || platform === "windows phone") && <BsWindows className={opacity} />}
        {platform === "xbox" && <BsXbox className={opacity} />}
      </div>
    </div>
  );
}
