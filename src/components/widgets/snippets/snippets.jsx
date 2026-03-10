import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";

import Container from "../widget/container";
import Raw from "../widget/raw";

function SnippetRow({ command, description }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may not be available (e.g. non-HTTPS)
    }
  }, [command]);

  return (
    <div className="flex flex-row items-center gap-2 py-0.5 group">
      <code className="text-xs font-mono text-theme-800 dark:text-theme-200 truncate flex-1" title={command}>
        {command}
      </code>
      {description && (
        <span className="text-xs text-theme-600 dark:text-theme-400 whitespace-nowrap hidden sm:inline">
          {description}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="flex-none p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-theme-600 dark:text-theme-400 hover:text-theme-800 dark:hover:text-theme-200"
        title={copied ? t("snippets.copied") : t("snippets.copy")}
        aria-label={copied ? t("snippets.copied") : t("snippets.copy")}
      >
        {copied ? <MdCheck className="w-3.5 h-3.5 text-green-500" /> : <MdContentCopy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function SnippetGroup({ name, items }) {
  return (
    <div className="mb-2 last:mb-0">
      {name && (
        <div className="text-xs font-semibold text-theme-700 dark:text-theme-300 mb-0.5 uppercase tracking-wide">
          {name}
        </div>
      )}
      {items.map((item) => (
        <SnippetRow key={item.command} command={item.command} description={item.description} />
      ))}
    </div>
  );
}

export default function Snippets({ options }) {
  const { groups } = options;

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <Container options={options} additionalClassNames="information-widget-snippets">
      <Raw>
        <div className="flex flex-col w-full p-1">
          {groups.map((group) => (
            <SnippetGroup key={group.name || group.items?.[0]?.command} name={group.name} items={group.items || []} />
          ))}
        </div>
      </Raw>
    </Container>
  );
}
