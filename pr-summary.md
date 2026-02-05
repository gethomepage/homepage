# PR Summary

## Overview
This change set implements a draft-only Visual Editor workflow for bookmarks and services, fixes delete persistence and edit ordering, improves edit mode UX with a non-intrusive banner, and keeps YAML output clean by omitting empty service widgets arrays.

## Changes Included
- Draft-only editing preserved (no disk writes until Save; Cancel discards all draft changes).
- Save API now applies deletes and edits for bookmarks and services.
- Edits keep original position within groups (no jump to bottom on save).
- Edit Mode indicator moved to a fixed bottom banner that avoids layout collisions.
- Body padding added only during Edit Mode and restored on exit.
- Service YAML output omits `widgets` when empty (reduces clutter while staying render-safe).

## Files Touched (key)
- src/pages/api/editor/save.js
  - Apply deletes + edits for bookmarks/services
  - Preserve edit position
  - Omit empty widgets
- src/utils/contexts/edit.jsx
  - Draft context and Save/Cancel wiring
- src/components/toggles/edit.jsx
  - Edit Mode fixed banner + padding lifecycle
- src/components/bookmarks/group.jsx
- src/components/services/group.jsx

## Testing
- pnpm lint (pass)
- Manual validation recommended:
  - Edit mode: add/edit/delete for bookmarks and services
  - Save persists changes; Cancel discards
  - Edit banner visible and non-overlapping
  - YAML format invariants preserved

## Notes
- The project uses Next.js and pnpm. Lint runs via `pnpm lint`.
- `widgets` is optional in YAML; runtime render already guards with `widgets ?? []`.
