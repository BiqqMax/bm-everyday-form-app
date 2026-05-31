# Dashboard Contract

## 0. ENFORCEMENT GATE

No modification to dashboard code is allowed unless:

- this contract has been explicitly acknowledged
- a step-by-step plan is produced first
- plan is approved before changes


## 1. SOURCE OF TRUTH RULE

- This document is the only source of truth for dashboard architecture and patching rules.
- Any AI agent must read this file before editing `components/dashboard/Dashboard.tsx`.
- If any other instruction conflicts with this contract, this contract wins.
- No dashboard change is valid unless it conforms to this document.

## 2. FORBIDDEN ACTIONS

- No full rewrites of `components/dashboard/Dashboard.tsx` without explicit approval.
- No deleting multiple components at once.
- No guessing missing file sections.
- No restoring from git unless explicitly approved.
- No patching by copy-pasting large duplicated blocks.
- No combining unrelated fixes into one patch.
- No structural cleanup that changes behavior unless it is explicitly requested.

## 3. SAFE CHANGE RULES

- Only one concern per patch:
  - UI layout, or
  - navigation, or
  - state wiring, or
  - component placement
- Never combine structural changes with logic changes.
- Never mix recovery work with feature work.
- If a file is corrupted, repair it in small verified sections only.
- Prefer the smallest possible edit that preserves existing behavior.

## 4. DASHBOARD ARCHITECTURE (CANONICAL)

### Desktop
- Persistent left sidebar
- Main content area with workspace views

### Mobile
- Bottom tab bar navigation
- Single-column panels

### Views
- overview
- forms
- responses
- analytics

### Shared UI
- ShareModal: unchanged logic
- Quick actions: UI only

## 5. STATE RULES

- Tab state already exists and must NOT be recreated.
- Do not introduce new global state managers.
- Reuse existing `useState` / `useActionState` logic only.
- Do not move dashboard state into a new store, context, or reducer unless explicitly approved.

## 6. FILE RESPONSIBILITY MAP

- `components/dashboard/Dashboard.tsx` → layout + view switching only
- `components/dashboard/DashboardShell.tsx` → navigation frame only
- `lib/dashboard/dashboard.ts` → data only
- `lib/dashboard/actions.ts` → mutations only

## 7. REQUIRED AI WORKFLOW

Before ANY code change:

1. Read this contract
2. Summarize what will change
3. Confirm no rule violations
4. Only then proceed

## 8. RECOVERY RULE

If the file is corrupted:

- reconstruct in sections only
- never delete the full file
- never merge duplicate logic blindly
- verify each recovered section before touching the next one

## 9. CORRUPTION HANDLING RULE

If Dashboard.tsx is corrupted:

- Do NOT repair immediately
- First classify corruption type:
  - syntax (braces/EOF)
  - duplication
  - truncation
  - type errors
- Then choose ONLY one:
  - minimal patch
  - section-by-section rebuild
- Never mix strategies


## 10. NO GUESSING RULE

If any file is incomplete, truncated, or partially visible:

- Do NOT infer missing code
- Do NOT reconstruct from pattern
- Do NOT assume exports or closing braces
- Always request full file or switch to safe skeleton mode


## 11. PATCH FORMAT RULE

All changes must be presented as:

1. Files affected
2. Exact reason for change
3. Line-level or component-level scope
4. Expected risk (low/medium/high)
5. Only then code

No silent edits allowed.


## IMMUTABILITY RULE

This contract may not be modified unless:
- a new version is explicitly approved
- version number is incremented
- changelog is provided
