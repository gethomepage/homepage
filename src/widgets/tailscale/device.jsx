import classNames from "classnames";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { MdOutlineSecurity } from "react-icons/md";
import { FiShare2, FiGlobe } from "react-icons/fi";

export default function Device({ name, address, online, isExitNode, hasSubnets, sshEnabled }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const statusColor = online ? "bg-green-500" : "bg-red-500/80";

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className={classNames(
        "flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1",
        !online && "opacity-40",
      )}
    >
      <span className="ml-2 h-2 w-2 z-10">
        <span className={classNames("block w-2 h-2 rounded-full", statusColor)} />
      </span>
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">{name}</div>
      </div>
      <div className="self-center flex items-center gap-1 mr-1.5 pl-1 z-10">
        {sshEnabled && (
          <MdOutlineSecurity className="w-3 h-3 opacity-60" title={t("tailscale.ssh")} />
        )}
        {hasSubnets && (
          <FiShare2 className="w-3 h-3 opacity-60" title={t("tailscale.subnets")} />
        )}
        {isExitNode && (
          <FiGlobe className="w-3 h-3 opacity-60" title={t("tailscale.exit_node")} />
        )}
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? t("tailscale.copied") : t("tailscale.copy")}
          className="text-theme-500 dark:text-theme-300 ml-1 hover:text-white hover:underline cursor-pointer transition-colors"
        >
          {copied ? t("tailscale.copied") : address}
        </button>
      </div>
    </div>
  );
}
