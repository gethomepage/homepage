import { createContext, useCallback, useMemo, useState } from "react";

export const EditContext = createContext({
  editMode: false,
  setEditMode: () => {},

  modalOpen: false,
  modalType: null, // "bookmarks" | "services" | null
  modalAction: "add", // "add" | "edit"
  modalGroupName: null,
  modalSubgroupName: null,

  // For editing
  modalInitialEntry: null,
  modalOriginalName: null,
  modalDraftId: null, // if editing a draft-added item

  openAddEntryModal: () => {},
  openEditEntryModal: () => {},
  closeAddEntryModal: () => {},

  draft: { bookmarks: {}, services: {} },
  addDraftEntry: () => {},
  editDraftEntry: () => {},
  deleteDraftEntry: () => {},
  resetDraft: () => {},

  saveDraftToDisk: async () => ({ ok: false }),
  cancelEditing: () => {},
});

function normalizeServiceDraftItem(service) {
  if (!service || typeof service !== "object") return service;

  const normalized = { ...service };

  // Convert singular widget -> widgets[] if it ever appears
  if (normalized.widget !== undefined && normalized.widgets === undefined) {
    if (normalized.widget && typeof normalized.widget === "object") {
      normalized.widgets = [normalized.widget];
    } else {
      normalized.widgets = [];
    }
    delete normalized.widget;
  }

  // Ensure widgets is always an array
  if (normalized.widgets === undefined || normalized.widgets === null) {
    normalized.widgets = [];
  } else if (!Array.isArray(normalized.widgets)) {
    normalized.widgets = [normalized.widgets];
  }

  return normalized;
}

function ensureGroupBucket(obj, groupName) {
  obj[groupName] ??= { adds: [], edits: {}, deletes: {} };
  obj[groupName].adds ??= [];
  obj[groupName].edits ??= {};
  obj[groupName].deletes ??= {};
  return obj[groupName];
}

function ensureServicesGroupBucket(obj, groupName) {
  obj[groupName] ??= { adds: [], edits: {}, deletes: {}, groups: {} };
  obj[groupName].adds ??= [];
  obj[groupName].edits ??= {};
  obj[groupName].deletes ??= {};
  obj[groupName].groups ??= {};
  return obj[groupName];
}

function ensureServicesSubgroupBucket(groupBucket, subgroupName) {
  groupBucket.groups[subgroupName] ??= { adds: [], edits: {}, deletes: {} };
  groupBucket.groups[subgroupName].adds ??= [];
  groupBucket.groups[subgroupName].edits ??= {};
  groupBucket.groups[subgroupName].deletes ??= {};
  return groupBucket.groups[subgroupName];
}

export function EditProvider({ children }) {
  const [editMode, setEditMode] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalAction, setModalAction] = useState("add");
  const [modalGroupName, setModalGroupName] = useState(null);
  const [modalSubgroupName, setModalSubgroupName] = useState(null);

  const [modalInitialEntry, setModalInitialEntry] = useState(null);
  const [modalOriginalName, setModalOriginalName] = useState(null);
  const [modalDraftId, setModalDraftId] = useState(null);

  const [draft, setDraft] = useState({ bookmarks: {}, services: {} });

  const openAddEntryModal = ({ type, groupName, subgroupName = null }) => {
    setModalType(type);
    setModalAction("add");
    setModalGroupName(groupName);
    setModalSubgroupName(subgroupName);
    setModalInitialEntry(null);
    setModalOriginalName(null);
    setModalDraftId(null);
    setModalOpen(true);
  };

  // entry is the render-shaped object (bookmark or service)
  const openEditEntryModal = ({ type, groupName, subgroupName = null, entry }) => {
    setModalType(type);
    setModalAction("edit");
    setModalGroupName(groupName);
    setModalSubgroupName(subgroupName);

    setModalInitialEntry(entry ?? null);
    setModalOriginalName(entry?.__originalName ?? entry?.name ?? null);
    setModalDraftId(entry?.__draftId ?? null);

    setModalOpen(true);
  };

  const closeAddEntryModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalAction("add");
    setModalGroupName(null);
    setModalSubgroupName(null);
    setModalInitialEntry(null);
    setModalOriginalName(null);
    setModalDraftId(null);
  };

  const addDraftEntry = ({ type, groupName, subgroupName = null, entry }) => {
    setDraft((prev) => {
      const next = structuredClone(prev);

      if (type === "bookmarks") {
        const bucket = ensureGroupBucket(next.bookmarks, groupName);
        bucket.adds.push(entry);
        return next;
      }

      if (type === "services") {
        const bucket = ensureServicesGroupBucket(next.services, groupName);
        const normalizedEntry = normalizeServiceDraftItem(entry);

        if (subgroupName) {
          const sub = ensureServicesSubgroupBucket(bucket, subgroupName);
          sub.adds.push(normalizedEntry);
          return next;
        }

        bucket.adds.push(normalizedEntry);
        return next;
      }

      return prev;
    });
  };

  const editDraftEntry = ({ type, groupName, subgroupName = null, originalName, entry }) => {
    setDraft((prev) => {
      const next = structuredClone(prev);

      if (!originalName) return prev;

      if (type === "bookmarks") {
        const bucket = ensureGroupBucket(next.bookmarks, groupName);

        // If it was previously marked deleted, un-delete it (edit implies keep)
        if (bucket.deletes?.[originalName]) delete bucket.deletes[originalName];

        bucket.edits[originalName] = entry;
        return next;
      }

      if (type === "services") {
        const bucket = ensureServicesGroupBucket(next.services, groupName);
        const normalizedEntry = normalizeServiceDraftItem(entry);

        if (subgroupName) {
          const sub = ensureServicesSubgroupBucket(bucket, subgroupName);

          if (sub.deletes?.[originalName]) delete sub.deletes[originalName];

          sub.edits[originalName] = normalizedEntry;
          return next;
        }

        if (bucket.deletes?.[originalName]) delete bucket.deletes[originalName];

        bucket.edits[originalName] = normalizedEntry;
        return next;
      }

      return prev;
    });
  };

  const deleteDraftEntry = ({ type, groupName, subgroupName = null, originalName, draftId = null }) => {
    setDraft((prev) => {
      const next = structuredClone(prev);

      // If draftId exists, we delete from adds[] immediately (draft-created item)
      if (type === "bookmarks") {
        const bucket = ensureGroupBucket(next.bookmarks, groupName);

        if (draftId) {
          bucket.adds = (bucket.adds ?? []).filter((b) => b?.__draftId !== draftId);
          // clean any edits keyed by originalName (optional)
          if (originalName && bucket.edits?.[originalName]) delete bucket.edits[originalName];
          return next;
        }

        // disk item delete: mark in deletes map (reversible by Cancel)
        if (originalName) {
          bucket.deletes[originalName] = true;
          if (bucket.edits?.[originalName]) delete bucket.edits[originalName];
        }
        return next;
      }

      if (type === "services") {
        const bucket = ensureServicesGroupBucket(next.services, groupName);

        const target = subgroupName ? ensureServicesSubgroupBucket(bucket, subgroupName) : bucket;

        if (draftId) {
          target.adds = (target.adds ?? []).filter((s) => s?.__draftId !== draftId);
          if (originalName && target.edits?.[originalName]) delete target.edits[originalName];
          return next;
        }

        if (originalName) {
          target.deletes[originalName] = true;
          if (target.edits?.[originalName]) delete target.edits[originalName];
        }
        return next;
      }

      return prev;
    });
  };

  const resetDraft = () => setDraft({ bookmarks: {}, services: {} });

  const saveDraftToDisk = useCallback(async () => {
    const res = await fetch("/api/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    });

    if (!res.ok) {
      const msg = await res.text();
      return { ok: false, error: msg || "Save failed" };
    }

    return { ok: true };
  }, [draft]);

  const cancelEditing = useCallback(() => {
    resetDraft();
    closeAddEntryModal();
    setEditMode(false);
  }, []);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,

      modalOpen,
      modalType,
      modalAction,
      modalGroupName,
      modalSubgroupName,
      modalInitialEntry,
      modalOriginalName,
      modalDraftId,

      openAddEntryModal,
      openEditEntryModal,
      closeAddEntryModal,

      draft,
      addDraftEntry,
      editDraftEntry,
      deleteDraftEntry,
      resetDraft,

      saveDraftToDisk,
      cancelEditing,
    }),
    [
      editMode,
      modalOpen,
      modalType,
      modalAction,
      modalGroupName,
      modalSubgroupName,
      modalInitialEntry,
      modalOriginalName,
      modalDraftId,
      draft,
      saveDraftToDisk,
      cancelEditing,
    ],
  );

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}
