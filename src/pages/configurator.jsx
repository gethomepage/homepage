import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = (resource, init) => fetch(resource, init).then((res) => res.json());

function cloneData(value) {
  if (value === undefined) {
    return null;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function setAtPath(root, path, nextValue) {
  if (path.length === 0) {
    return nextValue;
  }

  const [head, ...tail] = path;
  const copy = Array.isArray(root) ? [...root] : { ...(root ?? {}) };
  copy[head] = setAtPath(copy[head], tail, nextValue);
  return copy;
}

function removeAtPath(root, path) {
  if (path.length === 0) {
    return root;
  }

  const [head, ...tail] = path;

  if (tail.length === 0) {
    if (Array.isArray(root)) {
      const copy = [...root];
      copy.splice(head, 1);
      return copy;
    }

    const copy = { ...root };
    delete copy[head];
    return copy;
  }

  const copy = Array.isArray(root) ? [...root] : { ...root };
  copy[head] = removeAtPath(copy[head], tail);
  return copy;
}

function getAtPath(root, path) {
  return path.reduce((acc, segment) => acc?.[segment], root);
}

function renameObjectKey(root, objectPath, oldKey, newKey) {
  if (!newKey || newKey === oldKey) {
    return root;
  }

  const target = getAtPath(root, objectPath);
  if (!target || typeof target !== "object" || Array.isArray(target) || Object.prototype.hasOwnProperty.call(target, newKey)) {
    return root;
  }

  const renamed = {};
  Object.keys(target).forEach((key) => {
    if (key === oldKey) {
      renamed[newKey] = target[key];
    } else {
      renamed[key] = target[key];
    }
  });

  return setAtPath(root, objectPath, renamed);
}

function createValueByType(type) {
  if (type === "number") return 0;
  if (type === "boolean") return false;
  if (type === "null") return null;
  if (type === "object") return {};
  if (type === "array") return [];
  return "";
}

function getNextObjectKey(value) {
  let counter = 1;
  let candidate = `field_${counter}`;
  while (Object.prototype.hasOwnProperty.call(value, candidate)) {
    counter += 1;
    candidate = `field_${counter}`;
  }
  return candidate;
}

function getValueType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function ScalarEditor({ value, onChange }) {
  const valueType = getValueType(value);

  if (valueType === "boolean") {
    return (
      <select
        className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
        value={value ? "true" : "false"}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (valueType === "number") {
    return (
      <input
        className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
        type="number"
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  }

  if (valueType === "null") {
    return <div className="rounded-md border border-theme-300 bg-theme-100/50 p-2 text-sm opacity-70">null</div>;
  }

  return (
    <input
      className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
      type="text"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function ValueEditor({ value, path, onChange, onDelete, onRenameKey }) {
  const valueType = getValueType(value);

  if (valueType === "object") {
    return (
      <div className="space-y-2 rounded-md border border-theme-300 bg-theme-100/30 p-3">
        {Object.keys(value).map((key) => (
          <div key={`${path.join(".")}.${key}`} className="rounded-md border border-theme-300/80 bg-theme-50/30 p-2">
            <div className="mb-2 flex gap-2">
              <input
                className="flex-1 rounded-md border border-theme-300 bg-theme-100/50 p-2 text-sm"
                value={key}
                onChange={(event) => onRenameKey(path, key, event.target.value)}
              />
              <button
                className="rounded-md border border-rose-400 px-2 text-xs text-rose-500"
                type="button"
                onClick={() => onDelete([...path, key])}
              >
                Remove
              </button>
            </div>
            <ValueEditor
              value={value[key]}
              path={[...path, key]}
              onChange={onChange}
              onDelete={onDelete}
              onRenameKey={onRenameKey}
            />
          </div>
        ))}
        <button
          className="rounded-md border border-theme-400 px-3 py-1 text-sm"
          type="button"
          onClick={() => {
            const key = getNextObjectKey(value);
            onChange(path, { ...value, [key]: "" });
          }}
        >
          Add Field
        </button>
      </div>
    );
  }

  if (valueType === "array") {
    return (
      <div className="space-y-2 rounded-md border border-theme-300 bg-theme-100/30 p-3">
        {value.map((item, index) => (
          <div key={`${path.join(".")}.${index}`} className="rounded-md border border-theme-300/80 bg-theme-50/30 p-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase opacity-70">Item {index + 1}</div>
              <button
                className="rounded-md border border-rose-400 px-2 text-xs text-rose-500"
                type="button"
                onClick={() => onDelete([...path, index])}
              >
                Remove
              </button>
            </div>
            <ValueEditor
              value={item}
              path={[...path, index]}
              onChange={onChange}
              onDelete={onDelete}
              onRenameKey={onRenameKey}
            />
          </div>
        ))}
        <button
          className="rounded-md border border-theme-400 px-3 py-1 text-sm"
          type="button"
          onClick={() => onChange(path, [...value, ""])}
        >
          Add Item
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        className="rounded-md border border-theme-300 bg-theme-100/50 p-2 text-sm"
        value={valueType === "string" ? "string" : valueType}
        onChange={(event) => onChange(path, createValueByType(event.target.value))}
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="null">Null</option>
        <option value="object">Object</option>
        <option value="array">Array</option>
      </select>
      <ScalarEditor value={value} onChange={(next) => onChange(path, next)} />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
}

export default function ConfiguratorPage() {
  const { data, error, mutate, isLoading } = useSWR("/api/config-editor", fetcher);
  const { data: authData } = useSWR("/api/config-editor/auth-status", fetcher);
  const configs = data?.configs ?? [];

  const [selectedId, setSelectedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saveState, setSaveState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    if (!selectedId && configs[0]?.id) {
      setSelectedId(configs[0].id);
    }
  }, [configs, selectedId]);

  const selectedConfig = useMemo(
    () => configs.find((config) => config.id === selectedId) ?? configs[0],
    [configs, selectedId],
  );

  const selectedDraft = selectedConfig ? drafts[selectedConfig.id] ?? cloneData(selectedConfig.data) : null;

  function updateDraft(nextData) {
    if (!selectedConfig) return;

    setDrafts((current) => ({
      ...current,
      [selectedConfig.id]: nextData,
    }));
  }

  async function saveCurrent() {
    if (!selectedConfig) return;

    setSaveState({ status: "saving", message: "Saving..." });

    const response = await fetch(`/api/config-editor/${selectedConfig.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: selectedDraft }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setSaveState({ status: "error", message: payload.error || "Failed to save" });
      return;
    }

    setSaveState({ status: "saved", message: `Saved. Backup created: ${payload.backupFile}` });
    mutate();
  }

  return (
    <>
      <Head>
        <title>Homepage Configurator</title>
      </Head>

      <div className="mx-auto min-h-screen max-w-7xl p-4 sm:p-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-theme-900 dark:text-theme-200">Homepage Configurator</h1>
          <p className="opacity-80">Edit Homepage configuration files graphically. Every save writes a timestamped backup.</p>
        </div>
        {authData && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${
              authData.enabled
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            }`}
          >
            {authData.enabled
              ? `Configurator authentication is enabled (user: ${authData.username}).`
              : "Configurator authentication is not enabled. Set HOMEPAGE_CONFIGURATOR_PASSWORD to protect this page."}
          </div>
        )}

        {isLoading && <div className="rounded-md border border-theme-300 p-4">Loading configuration files...</div>}
        {error && <div className="rounded-md border border-rose-400 p-4 text-rose-500">Failed to load configuration editor.</div>}

        {!isLoading && !error && (
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-2 rounded-md border border-theme-300 bg-theme-100/20 p-2">
              {configs.map((config) => (
                <button
                  key={config.id}
                  className={`w-full rounded-md px-3 py-2 text-left ${
                    selectedConfig?.id === config.id ? "bg-theme-500/20" : "bg-transparent hover:bg-theme-500/10"
                  }`}
                  type="button"
                  onClick={() => setSelectedId(config.id)}
                >
                  <div className="font-semibold">{config.label}</div>
                  <div className="text-xs opacity-70">{config.filename}</div>
                  {config.error && <div className="text-xs text-rose-500">{config.error}</div>}
                </button>
              ))}
            </aside>

            <section className="space-y-4 rounded-md border border-theme-300 bg-theme-100/20 p-4">
              {selectedConfig && !selectedConfig.error && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedConfig.label}</h2>
                      <div className="text-sm opacity-70">{selectedConfig.filename}</div>
                    </div>
                    <button
                      className="rounded-md border border-theme-400 px-4 py-2 font-semibold"
                      type="button"
                      disabled={saveState.status === "saving"}
                      onClick={saveCurrent}
                    >
                      {saveState.status === "saving" ? "Saving..." : "Save"}
                    </button>
                  </div>

                  {selectedConfig.type === "text" && (
                    <textarea
                      className="min-h-[420px] w-full rounded-md border border-theme-300 bg-theme-100/50 p-3 font-mono text-sm"
                      value={selectedDraft ?? ""}
                      onChange={(event) => updateDraft(event.target.value)}
                    />
                  )}

                  {selectedConfig.type === "yaml" && (
                    <ValueEditor
                      value={selectedDraft}
                      path={[]}
                      onChange={(path, value) => updateDraft(setAtPath(selectedDraft, path, value))}
                      onDelete={(path) => updateDraft(removeAtPath(selectedDraft, path))}
                      onRenameKey={(objectPath, oldKey, newKey) =>
                        updateDraft(renameObjectKey(selectedDraft, objectPath, oldKey, newKey))
                      }
                    />
                  )}

                  {saveState.message && (
                    <div
                      className={`rounded-md border p-2 text-sm ${
                        saveState.status === "error" ? "border-rose-400 text-rose-600" : "border-theme-300"
                      }`}
                    >
                      {saveState.message}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
