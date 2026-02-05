# Homepage Visual Editor – Full Project Handoff

This document captures **all architectural decisions, current behavior, invariants, and implementation details** for the Homepage Visual Editor project.

It is written to onboard **another AI agent (e.g. Codex)** or human developer with **no prior chat context**, assuming full access to the codebase.

---

## 1. Project Objective

Implement a **Visual Editor** for Homepage that allows users to:

- Add, edit, rename, and delete **Bookmarks** and **Services**
- Perform all edits in **draft mode (in-memory only)**
- Persist changes to YAML **only when Save is clicked**
- Fully revert all changes when **Cancel** is clicked

At no point should partial or implicit disk writes occur.

---

## 2. High-Level Design

### Edit Mode
- Global toggle (pencil icon)
- When enabled:
  - Clicking existing items opens an edit modal
  - “+ Add entry” buttons appear under groups
- When disabled:
  - UI behaves exactly like stock Homepage

### Draft-Only Workflow
- YAML files are never mutated directly during editing
- All edits live in browser memory
- Save → apply draft to disk
- Cancel → discard draft entirely

---

## 3. Draft State Model (Critical)

Draft state is stored in `EditContext` and overlays disk-loaded config at render time.

### Shape

```ts
draft = {
  bookmarks: {
    [groupName]: {
      adds: Bookmark[],
      edits: { [originalName]: Bookmark },
      deletes: { [originalName]: true }
    }
  },
  services: {
    [groupName]: {
      adds: Service[],
      edits: { [originalName]: Service },
      deletes: { [originalName]: true }
    }
  }
}

Rules

adds[] → items created in this draft session

edits{} → full replacement objects for existing disk items

deletes{} → deletion markers (disk untouched until Save)

Draft-added items may contain __draftId for stable identity

Deleted items must NOT count toward duplicate-name checks

4. YAML Formats (Must Be Preserved)
Bookmarks (bookmarks.yaml)
- Group Name:
    - Item Name:
        - abbr: XX
          icon: https://...
          href: https://...


Invariants:

Item value is an array containing one object

Homepage renderer depends on this structure

Services (services.yaml)
- Group Name:
    - Service Name:
        icon: service.png
        href: https://...
        description: ...
        ping: ...
        siteMonitor: ...
        widgets: []


Invariants:

service.name must always exist

widgets must always be an array (even empty)

Services are render-ready objects, not YAML wrappers

5. Render Merge Logic

Merge occurs in:

src/components/services/group.jsx

src/components/bookmarks/group.jsx

Merge Algorithm

Start with disk-loaded items

Remove items listed in deletes

Replace items found in edits

Append items in adds

This ensures UI always reflects the draft state exactly.

6. Editing Existing Entries
Interaction Model

Clicking an item in edit mode opens modal

Modal is pre-filled with current values

Rename is allowed

Duplicate names are blocked

Duplicate Definition

Disk items

Draft-added items

Draft-edited items
❌ Excluding items marked deleted

User must be informed and prevented from saving duplicates.

7. Delete Semantics
Immediate UI Feedback

Disk-backed item:

Added to draft.deletes

Hidden immediately in UI

Draft-added item:

Removed from adds[]

Disappears immediately

Persistence

Disk is modified only on Save

Cancel fully restores original state

No undo stack exists; Cancel is the only rollback.

8. Modal Responsibilities (AddEntryModal)

The modal must:

Support add and edit modes

Autofill fields for edits

Normalize inputs (URLs, widgets)

Enforce:

Required fields

Valid URLs

No duplicate names

Show Delete button only for:

Disk-backed items

Draft-added items being edited

9. EditContext (src/utils/contexts/edit.jsx)
Responsibilities

Track editMode

Manage modal state

Store draft data

Provide APIs:

openAddEntryModal()
openEditEntryModal()
addDraftEntry()
editDraftEntry()
deleteDraftEntry()
resetDraft()
saveDraftToDisk()
cancelEditing()


This context is the single source of truth for the editor.

10. Save API
Endpoint

POST /api/editor/save

Behavior

Load YAML from disk

Apply draft in order:

Deletes

Edits (including rename)

Adds

Preserve valid YAML schema

Write back atomically

Cancel never calls this endpoint.

11. Current Assumptions

No service subgroups are used

All services are top-level groups

Homepage rendering logic is unchanged

YAML on disk is canonical outside edit mode

12. Invariants (Do Not Break)

service.widgets must always exist

service.name must always exist

Bookmark items must remain array-wrapped

Draft must never mutate disk objects

Cancel must be lossless

13. Implemented Features

Edit mode toggle

Draft architecture

Add/edit/delete for bookmarks and services (UI side)

Immediate visual feedback

Safe cancel behavior

14. Remaining / Future Work

Finalize /api/editor/save for edits + deletes

Duplicate-name error messaging polish

Optional hover indicator for editable items

Optional schema validation hardening

15. Mental Model

Treat the editor like Git:

Disk YAML = HEAD

Draft = working tree

Save = commit

Cancel = hard reset

If this model holds, the editor remains safe and predictable.