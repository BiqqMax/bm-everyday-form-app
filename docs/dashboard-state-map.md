# DASHBOARD STATE MAP (SOURCE OF TRUTH)

## PURPOSE
Defines exact UI responsibility boundaries.

---

## CORE MODULES

### Dashboard.tsx
- Owns:
  - layout composition
  - tab switching (desktop/mobile)
  - ShareModal state wiring
- Does NOT own:
  - Supabase queries
  - form logic
  - business rules

---

### DashboardShell.tsx
- Owns:
  - desktop sidebar
  - mobile bottom tabs
  - route-level layout framing
- Does NOT own:
  - dashboard content rendering

---

### Workspace Panels
- WorkspaceOverview
- WorkspaceForms
- WorkspaceResponses
- WorkspaceAnalytics

RULE:
- These are PURE UI blocks only
- No navigation logic inside

---

### Actions Layer (lib/)
- createFormAction
- updateFormAction
- deleteFormAction

RULE:
- NEVER modified during UI work

---

## STATE RULES

- Tab state is LOCAL ONLY in Dashboard.tsx
- No global store allowed
- No duplication of tab state across components