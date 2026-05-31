# DASHBOARD CHANGE TYPES

All work MUST be categorized:

---

## TYPE 1 — LAYOUT ONLY
- sidebar
- spacing
- mobile tabs
- grid structure

SAFE

---

## TYPE 2 — STATE WIRING
- tab switching
- modal open/close
- passing props

SAFE (controlled)

---

## TYPE 3 — BUSINESS LOGIC
- Supabase queries
- form actions
- auth
- onboarding

FORBIDDEN unless explicitly approved

---

## TYPE 4 — REBUILD
- rewriting components
- replacing Dashboard.tsx
- restoring git versions

FORBIDDEN unless emergency approval

---

## RULE

Every AI response MUST label its change type before proposing code.