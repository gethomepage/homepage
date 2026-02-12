import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useCallback, useEffect, useState } from "react";
import { MdAdd, MdClose, MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

import widgetSchemas, { availableWidgetTypes } from "./widget-schemas";

function WidgetField({ field, value, onChange }) {
  const id = `widget-field-${field.name}`;

  if (field.type === "boolean") {
    return (
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={value ?? field.default ?? false}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="rounded border-theme-300 dark:border-theme-600 text-theme-600 dark:text-theme-400
                     focus:ring-theme-500 dark:focus:ring-theme-400 bg-white/50 dark:bg-white/10"
        />
        <span className="text-sm text-theme-800 dark:text-theme-200">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm text-theme-800 dark:text-theme-200">
          {field.label}
        </label>
        <select
          id={id}
          value={value ?? field.default ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="rounded-md border border-theme-300 dark:border-theme-600 bg-white/50 dark:bg-white/10
                     text-sm text-theme-800 dark:text-theme-200 px-2 py-1.5
                     focus:ring-theme-500 dark:focus:ring-theme-400 focus:border-theme-500"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm text-theme-800 dark:text-theme-200">
          {field.label}
        </label>
        <input
          id={id}
          type="number"
          value={value ?? field.default ?? ""}
          min={field.min}
          onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : "")}
          className="rounded-md border border-theme-300 dark:border-theme-600 bg-white/50 dark:bg-white/10
                     text-sm text-theme-800 dark:text-theme-200 px-2 py-1.5
                     focus:ring-theme-500 dark:focus:ring-theme-400 focus:border-theme-500"
        />
      </div>
    );
  }

  // Default: text input
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-theme-800 dark:text-theme-200">
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        className="rounded-md border border-theme-300 dark:border-theme-600 bg-white/50 dark:bg-white/10
                   text-sm text-theme-800 dark:text-theme-200 px-2 py-1.5
                   focus:ring-theme-500 dark:focus:ring-theme-400 focus:border-theme-500
                   placeholder-theme-400 dark:placeholder-theme-500"
      />
    </div>
  );
}

function WidgetConfigCard({ widget, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const schema = widgetSchemas[widget.type];
  const [collapsed, setCollapsed] = useState(true);

  const handleFieldChange = useCallback(
    (fieldName, value) => {
      onUpdate(index, {
        ...widget,
        options: { ...widget.options, [fieldName]: value },
      });
    },
    [index, widget, onUpdate],
  );

  return (
    <div className="rounded-md border border-theme-300 dark:border-theme-600 bg-white/30 dark:bg-white/5">
      <div className="flex items-center justify-between p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-left grow"
        >
          <span className="text-sm font-medium text-theme-800 dark:text-theme-200">
            {schema?.label || widget.type}
          </span>
          <span className="text-xs text-theme-500 dark:text-theme-400">({widget.type})</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-theme-200/50 dark:hover:bg-white/10 disabled:opacity-30"
            title="Move up"
          >
            <MdKeyboardArrowUp className="w-4 h-4 text-theme-700 dark:text-theme-300" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-theme-200/50 dark:hover:bg-white/10 disabled:opacity-30"
            title="Move down"
          >
            <MdKeyboardArrowDown className="w-4 h-4 text-theme-700 dark:text-theme-300" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded hover:bg-rose-200/50 dark:hover:bg-rose-900/30"
            title="Remove widget"
          >
            <MdDelete className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </button>
        </div>
      </div>
      {!collapsed && schema && (
        <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-theme-200 dark:border-theme-700 pt-3">
          {schema.fields.map((field) => (
            <WidgetField
              key={field.name}
              field={field}
              value={widget.options?.[field.name]}
              onChange={handleFieldChange}
            />
          ))}
        </div>
      )}
      {!collapsed && !schema && (
        <div className="px-3 pb-3 border-t border-theme-200 dark:border-theme-700 pt-3">
          <p className="text-sm text-theme-500 dark:text-theme-400">
            No configurable options available for this widget type.
          </p>
        </div>
      )}
    </div>
  );
}

function AddWidgetPanel({ onAdd, existingTypes }) {
  const [showAdd, setShowAdd] = useState(false);

  if (!showAdd) {
    return (
      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-2 w-full justify-center p-3 rounded-md border-2 border-dashed
                   border-theme-300 dark:border-theme-600 text-theme-600 dark:text-theme-400
                   hover:border-theme-400 dark:hover:border-theme-500 hover:text-theme-700 dark:hover:text-theme-300
                   transition-colors"
      >
        <MdAdd className="w-5 h-5" />
        <span className="text-sm font-medium">Add Widget</span>
      </button>
    );
  }

  return (
    <div className="rounded-md border border-theme-300 dark:border-theme-600 bg-white/30 dark:bg-white/5 p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-theme-800 dark:text-theme-200">Select Widget Type</span>
        <button
          type="button"
          onClick={() => setShowAdd(false)}
          className="p-1 rounded hover:bg-theme-200/50 dark:hover:bg-white/10"
        >
          <MdClose className="w-4 h-4 text-theme-700 dark:text-theme-300" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableWidgetTypes.map((type) => {
          const schema = widgetSchemas[type];
          const isActive = existingTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setShowAdd(false);
              }}
              className={classNames(
                "text-left p-2 rounded-md border text-sm transition-colors",
                isActive
                  ? "border-theme-400 dark:border-theme-500 bg-theme-100/50 dark:bg-white/10"
                  : "border-theme-200 dark:border-theme-700 hover:border-theme-400 dark:hover:border-theme-500",
              )}
            >
              <span className="font-medium text-theme-800 dark:text-theme-200">{schema?.label || type}</span>
              {isActive && (
                <span className="block text-xs text-theme-500 dark:text-theme-400 mt-0.5">Already added</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WidgetConfigModal({ isOpen, onClose }) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      fetch("/api/widgets/config")
        .then((res) => res.json())
        .then((data) => {
          // Flatten datetime format fields for editing
          const normalized = data.map((w, i) => {
            const opts = { ...w.options };
            if (w.type === "datetime" && opts.format) {
              Object.entries(opts.format).forEach(([k, v]) => {
                opts[k] = v;
              });
              delete opts.format;
            }
            if (w.type === "stocks" && Array.isArray(opts.watchlist)) {
              opts.watchlist = opts.watchlist.join(", ");
            }
            return { type: w.type, options: opts, originalIndex: i };
          });
          setWidgets(normalized);
        })
        .catch(() => setError("Failed to load widget configuration"))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleUpdate = useCallback((index, updated) => {
    setWidgets((prev) => prev.map((w, i) => (i === index ? updated : w)));
  }, []);

  const handleRemove = useCallback((index) => {
    setWidgets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveUp = useCallback((index) => {
    if (index === 0) return;
    setWidgets((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index) => {
    setWidgets((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleAdd = useCallback((type) => {
    const schema = widgetSchemas[type];
    const defaults = {};
    if (schema) {
      schema.fields.forEach((field) => {
        if (field.default !== undefined && field.default !== "") {
          defaults[field.name] = field.default;
        }
      });
    }
    setWidgets((prev) => [...prev, { type, options: defaults }]);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/widgets/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      onClose();
      window.location.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-2xl rounded-lg bg-theme-50 dark:bg-theme-800 shadow-xl
                           border border-theme-200 dark:border-theme-700"
              >
                <div className="flex items-center justify-between p-4 border-b border-theme-200 dark:border-theme-700">
                  <Dialog.Title className="text-lg font-medium text-theme-900 dark:text-theme-100">
                    Configure Widgets
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-theme-200/50 dark:hover:bg-white/10"
                  >
                    <MdClose className="w-5 h-5 text-theme-700 dark:text-theme-300" />
                  </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-theme-400 border-solid rounded-full animate-spin border-t-transparent" />
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm">
                      {error}
                    </div>
                  )}

                  {!loading && (
                    <div className="flex flex-col gap-3">
                      {widgets.map((widget, i) => (
                        <WidgetConfigCard
                          key={`${widget.type}-${i}`}
                          widget={widget}
                          index={i}
                          total={widgets.length}
                          onUpdate={handleUpdate}
                          onRemove={handleRemove}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                        />
                      ))}

                      <AddWidgetPanel onAdd={handleAdd} existingTypes={widgets.map((w) => w.type)} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t border-theme-200 dark:border-theme-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md
                             text-theme-700 dark:text-theme-300
                             hover:bg-theme-200/50 dark:hover:bg-white/10
                             transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="px-4 py-2 text-sm font-medium rounded-md
                             bg-theme-600 dark:bg-theme-500 text-white
                             hover:bg-theme-700 dark:hover:bg-theme-400
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                  >
                    {saving ? "Saving..." : "Save & Apply"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
