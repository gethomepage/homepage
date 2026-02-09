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

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
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

function getValueType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
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

function appendServiceGroupEntry(current, groupName, serviceName, serviceConfig) {
  const groups = normalizeArray(current).map((entry) => (entry && typeof entry === "object" ? { ...entry } : entry));

  const groupIndex = groups.findIndex((entry) => entry && typeof entry === "object" && Object.keys(entry)[0] === groupName);

  if (groupIndex === -1) {
    groups.push({ [groupName]: [{ [serviceName]: serviceConfig }] });
    return groups;
  }

  const groupEntry = groups[groupIndex];
  const existingItems = normalizeArray(groupEntry[groupName]);
  groups[groupIndex] = {
    ...groupEntry,
    [groupName]: [...existingItems, { [serviceName]: serviceConfig }],
  };

  return groups;
}

function appendBookmarkGroupEntry(current, groupName, bookmarkName, bookmarkConfig) {
  const groups = normalizeArray(current).map((entry) => (entry && typeof entry === "object" ? { ...entry } : entry));

  const groupIndex = groups.findIndex((entry) => entry && typeof entry === "object" && Object.keys(entry)[0] === groupName);

  const bookmarkEntry = {
    [bookmarkName]: [bookmarkConfig],
  };

  if (groupIndex === -1) {
    groups.push({ [groupName]: [bookmarkEntry] });
    return groups;
  }

  const groupEntry = groups[groupIndex];
  const existingItems = normalizeArray(groupEntry[groupName]);
  groups[groupIndex] = {
    ...groupEntry,
    [groupName]: [...existingItems, bookmarkEntry],
  };

  return groups;
}

function appendInfoWidgetEntry(current, widgetType, widgetConfig) {
  const widgets = normalizeArray(current);
  return [...widgets, { [widgetType]: widgetConfig }];
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
        {Object.keys(value).map((key, index) => (
          <div key={`${path.join(".")}.${index}`} className="rounded-md border border-theme-300/80 bg-theme-50/30 p-2">
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
  const { data: capabilitiesData } = useSWR("/api/config-editor/capabilities", fetcher);

  const configs = data?.configs ?? [];
  const serviceWidgets = capabilitiesData?.serviceWidgets ?? [];
  const infoWidgets = capabilitiesData?.infoWidgets ?? [];

  const [mode, setMode] = useState("builder");
  const [selectedId, setSelectedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saveState, setSaveState] = useState({ status: "idle", message: "" });

  const [capabilityQuery, setCapabilityQuery] = useState("");

  const [serviceForm, setServiceForm] = useState({
    group: "Applications",
    name: "",
    href: "",
    icon: "",
    description: "",
    widgetType: "",
    widgetConfig: {},
  });

  const [bookmarkForm, setBookmarkForm] = useState({
    group: "Quick Links",
    name: "",
    href: "",
    abbr: "",
    icon: "",
    description: "",
  });

  const [infoForm, setInfoForm] = useState({
    type: "",
    config: {},
  });

  useEffect(() => {
    if (!selectedId && configs[0]?.id) {
      setSelectedId(configs[0].id);
    }
  }, [configs, selectedId]);

  useEffect(() => {
    if (!serviceForm.widgetType && serviceWidgets[0]?.type) {
      setServiceForm((current) => ({
        ...current,
        widgetType: serviceWidgets[0].type,
        widgetConfig: cloneData(serviceWidgets[0].defaults),
      }));
    }
  }, [serviceForm.widgetType, serviceWidgets]);

  useEffect(() => {
    if (!infoForm.type && infoWidgets[0]?.type) {
      setInfoForm({
        type: infoWidgets[0].type,
        config: cloneData(infoWidgets[0].defaults),
      });
    }
  }, [infoForm.type, infoWidgets]);

  const selectedConfig = useMemo(
    () => configs.find((config) => config.id === selectedId) ?? configs[0],
    [configs, selectedId],
  );

  const selectedDraft = selectedConfig ? drafts[selectedConfig.id] ?? cloneData(selectedConfig.data) : null;

  const filteredServiceCapabilities = useMemo(() => {
    if (!capabilityQuery.trim()) {
      return serviceWidgets;
    }

    const query = capabilityQuery.toLowerCase();
    return serviceWidgets.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [capabilityQuery, serviceWidgets]);

  const filteredInfoCapabilities = useMemo(() => {
    if (!capabilityQuery.trim()) {
      return infoWidgets;
    }

    const query = capabilityQuery.toLowerCase();
    return infoWidgets.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [capabilityQuery, infoWidgets]);

  function getConfigData(configId) {
    const config = configs.find((entry) => entry.id === configId);
    if (!config) {
      return null;
    }

    return drafts[configId] ?? cloneData(config.data);
  }

  function setConfigData(configId, nextData) {
    setDrafts((current) => ({
      ...current,
      [configId]: nextData,
    }));
    setSaveState({ status: "idle", message: "" });
  }

  function updateDraft(nextData) {
    if (!selectedConfig) return;
    setConfigData(selectedConfig.id, nextData);
  }

  async function saveConfigById(configId) {
    const config = configs.find((entry) => entry.id === configId);
    if (!config) {
      return;
    }

    const payloadData = drafts[configId] ?? cloneData(config.data);

    setSaveState({ status: "saving", message: `Saving ${config.filename}...` });

    const response = await fetch(`/api/config-editor/${configId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payloadData }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setSaveState({ status: "error", message: payload.error || "Failed to save" });
      return;
    }

    setSaveState({ status: "saved", message: `Saved ${config.filename}. Backup created: ${payload.backupFile}` });
    mutate();
  }

  function addServiceToDraft() {
    if (!serviceForm.group.trim() || !serviceForm.name.trim() || !serviceForm.href.trim()) {
      setSaveState({ status: "error", message: "Service group, name, and URL are required." });
      return;
    }

    const current = getConfigData("services");
    if (current === null) {
      setSaveState({ status: "error", message: "services.yaml was not loaded." });
      return;
    }

    const serviceConfig = {
      href: serviceForm.href.trim(),
    };

    if (serviceForm.icon.trim()) {
      serviceConfig.icon = serviceForm.icon.trim();
    }

    if (serviceForm.description.trim()) {
      serviceConfig.description = serviceForm.description.trim();
    }

    if (serviceForm.widgetType) {
      serviceConfig.widget = {
        type: serviceForm.widgetType,
        ...(serviceForm.widgetConfig || {}),
      };
    }

    const next = appendServiceGroupEntry(current, serviceForm.group.trim(), serviceForm.name.trim(), serviceConfig);

    setConfigData("services", next);
    setSelectedId("services");
    setSaveState({ status: "saved", message: "Service added to services.yaml draft. Save to apply." });
  }

  function addBookmarkToDraft() {
    if (!bookmarkForm.group.trim() || !bookmarkForm.name.trim() || !bookmarkForm.href.trim()) {
      setSaveState({ status: "error", message: "Bookmark group, name, and URL are required." });
      return;
    }

    const current = getConfigData("bookmarks");
    if (current === null) {
      setSaveState({ status: "error", message: "bookmarks.yaml was not loaded." });
      return;
    }

    const bookmarkConfig = {
      href: bookmarkForm.href.trim(),
    };

    if (bookmarkForm.icon.trim()) {
      bookmarkConfig.icon = bookmarkForm.icon.trim();
    } else if (bookmarkForm.abbr.trim()) {
      bookmarkConfig.abbr = bookmarkForm.abbr.trim();
    }

    if (bookmarkForm.description.trim()) {
      bookmarkConfig.description = bookmarkForm.description.trim();
    }

    const next = appendBookmarkGroupEntry(current, bookmarkForm.group.trim(), bookmarkForm.name.trim(), bookmarkConfig);

    setConfigData("bookmarks", next);
    setSelectedId("bookmarks");
    setSaveState({ status: "saved", message: "Bookmark added to bookmarks.yaml draft. Save to apply." });
  }

  function addInfoWidgetToDraft() {
    if (!infoForm.type) {
      setSaveState({ status: "error", message: "Select an info widget type first." });
      return;
    }

    const current = getConfigData("widgets");
    if (current === null) {
      setSaveState({ status: "error", message: "widgets.yaml was not loaded." });
      return;
    }

    const next = appendInfoWidgetEntry(current, infoForm.type, infoForm.config || {});

    setConfigData("widgets", next);
    setSelectedId("widgets");
    setSaveState({ status: "saved", message: "Info widget added to widgets.yaml draft. Save to apply." });
  }

  return (
    <>
      <Head>
        <title>Homepage Configurator</title>
      </Head>

      <div className="mx-auto min-h-screen max-w-7xl p-4 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-theme-900 dark:text-theme-200">Homepage Configurator</h1>
            <p className="opacity-80">Use Builder mode for guided setup or Raw Editor mode for full direct edits.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${mode === "builder" ? "border-theme-500 bg-theme-500/20" : "border-theme-300"}`}
              onClick={() => setMode("builder")}
            >
              Builder
            </button>
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${mode === "editor" ? "border-theme-500 bg-theme-500/20" : "border-theme-300"}`}
              onClick={() => setMode("editor")}
            >
              Raw Editor
            </button>
          </div>
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

        {saveState.message && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${
              saveState.status === "error"
                ? "border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-theme-300"
            }`}
          >
            {saveState.message}
          </div>
        )}

        {isLoading && <div className="rounded-md border border-theme-300 p-4">Loading configuration files...</div>}
        {error && <div className="rounded-md border border-rose-400 p-4 text-rose-500">Failed to load configuration editor.</div>}

        {!isLoading && !error && mode === "builder" && (
          <div className="space-y-4">
            <div className="rounded-md border border-theme-300 bg-theme-100/20 p-4">
              <h2 className="mb-2 text-lg font-semibold">Capability Browser</h2>
              <input
                className="mb-3 w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                placeholder="Search widgets and capabilities..."
                value={capabilityQuery}
                onChange={(event) => setCapabilityQuery(event.target.value)}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Service Widgets ({filteredServiceCapabilities.length})</h3>
                  <div className="max-h-72 space-y-2 overflow-auto pr-1">
                    {filteredServiceCapabilities.map((capability) => (
                      <div key={`${capability.slug}-${capability.type}`} className="rounded-md border border-theme-300/80 p-2 text-sm">
                        <div className="font-semibold">{capability.title}</div>
                        <div className="opacity-70">type: {capability.type}</div>
                        {capability.description && <div className="mt-1 opacity-80">{capability.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Info Widgets ({filteredInfoCapabilities.length})</h3>
                  <div className="max-h-72 space-y-2 overflow-auto pr-1">
                    {filteredInfoCapabilities.map((capability) => (
                      <div key={`${capability.slug}-${capability.type}`} className="rounded-md border border-theme-300/80 p-2 text-sm">
                        <div className="font-semibold">{capability.title}</div>
                        <div className="opacity-70">type: {capability.type}</div>
                        {capability.description && <div className="mt-1 opacity-80">{capability.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="space-y-3 rounded-md border border-theme-300 bg-theme-100/20 p-4">
                <h2 className="text-lg font-semibold">Add Service</h2>
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Group"
                  value={serviceForm.group}
                  onChange={(event) => setServiceForm((current) => ({ ...current, group: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Service name"
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Service URL (href)"
                  value={serviceForm.href}
                  onChange={(event) => setServiceForm((current) => ({ ...current, href: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Icon (optional)"
                  value={serviceForm.icon}
                  onChange={(event) => setServiceForm((current) => ({ ...current, icon: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Description (optional)"
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium">Widget Type</label>
                  <select
                    className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                    value={serviceForm.widgetType}
                    onChange={(event) => {
                      const nextType = event.target.value;
                      const selected = serviceWidgets.find((item) => item.type === nextType);
                      setServiceForm((current) => ({
                        ...current,
                        widgetType: nextType,
                        widgetConfig: cloneData(selected?.defaults ?? {}),
                      }));
                    }}
                  >
                    <option value="">No widget</option>
                    {serviceWidgets.map((widget) => (
                      <option key={`${widget.slug}-${widget.type}`} value={widget.type}>
                        {widget.title} ({widget.type})
                      </option>
                    ))}
                  </select>
                </div>

                {serviceForm.widgetType && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">Widget Options</label>
                    <ValueEditor
                      value={serviceForm.widgetConfig ?? {}}
                      path={[]}
                      onChange={(path, value) =>
                        setServiceForm((current) => ({ ...current, widgetConfig: setAtPath(current.widgetConfig ?? {}, path, value) }))
                      }
                      onDelete={(path) =>
                        setServiceForm((current) => ({ ...current, widgetConfig: removeAtPath(current.widgetConfig ?? {}, path) }))
                      }
                      onRenameKey={(objectPath, oldKey, newKey) =>
                        setServiceForm((current) => ({
                          ...current,
                          widgetConfig: renameObjectKey(current.widgetConfig ?? {}, objectPath, oldKey, newKey),
                        }))
                      }
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="rounded-md border border-theme-400 px-3 py-2 text-sm" type="button" onClick={addServiceToDraft}>
                    Add To Draft
                  </button>
                  <button
                    className="rounded-md border border-theme-400 px-3 py-2 text-sm"
                    type="button"
                    onClick={() => saveConfigById("services")}
                  >
                    Save Services
                  </button>
                </div>
              </section>

              <section className="space-y-3 rounded-md border border-theme-300 bg-theme-100/20 p-4">
                <h2 className="text-lg font-semibold">Add Bookmark</h2>
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Group"
                  value={bookmarkForm.group}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, group: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Bookmark name"
                  value={bookmarkForm.name}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, name: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Bookmark URL"
                  value={bookmarkForm.href}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, href: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Abbreviation (optional)"
                  value={bookmarkForm.abbr}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, abbr: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Icon (optional, overrides abbreviation)"
                  value={bookmarkForm.icon}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, icon: event.target.value }))}
                />
                <input
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  placeholder="Description (optional)"
                  value={bookmarkForm.description}
                  onChange={(event) => setBookmarkForm((current) => ({ ...current, description: event.target.value }))}
                />

                <div className="flex gap-2">
                  <button className="rounded-md border border-theme-400 px-3 py-2 text-sm" type="button" onClick={addBookmarkToDraft}>
                    Add To Draft
                  </button>
                  <button
                    className="rounded-md border border-theme-400 px-3 py-2 text-sm"
                    type="button"
                    onClick={() => saveConfigById("bookmarks")}
                  >
                    Save Bookmarks
                  </button>
                </div>
              </section>

              <section className="space-y-3 rounded-md border border-theme-300 bg-theme-100/20 p-4">
                <h2 className="text-lg font-semibold">Add Info Widget</h2>

                <select
                  className="w-full rounded-md border border-theme-300 bg-theme-100/50 p-2"
                  value={infoForm.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    const selected = infoWidgets.find((item) => item.type === type);
                    setInfoForm({
                      type,
                      config: cloneData(selected?.defaults ?? {}),
                    });
                  }}
                >
                  {infoWidgets.map((widget) => (
                    <option key={`${widget.slug}-${widget.type}`} value={widget.type}>
                      {widget.title} ({widget.type})
                    </option>
                  ))}
                </select>

                <ValueEditor
                  value={infoForm.config ?? {}}
                  path={[]}
                  onChange={(path, value) =>
                    setInfoForm((current) => ({
                      ...current,
                      config: setAtPath(current.config ?? {}, path, value),
                    }))
                  }
                  onDelete={(path) =>
                    setInfoForm((current) => ({
                      ...current,
                      config: removeAtPath(current.config ?? {}, path),
                    }))
                  }
                  onRenameKey={(objectPath, oldKey, newKey) =>
                    setInfoForm((current) => ({
                      ...current,
                      config: renameObjectKey(current.config ?? {}, objectPath, oldKey, newKey),
                    }))
                  }
                />

                <div className="flex gap-2">
                  <button className="rounded-md border border-theme-400 px-3 py-2 text-sm" type="button" onClick={addInfoWidgetToDraft}>
                    Add To Draft
                  </button>
                  <button
                    className="rounded-md border border-theme-400 px-3 py-2 text-sm"
                    type="button"
                    onClick={() => saveConfigById("widgets")}
                  >
                    Save Widgets
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {!isLoading && !error && mode === "editor" && (
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
                      onClick={() => saveConfigById(selectedConfig.id)}
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
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
