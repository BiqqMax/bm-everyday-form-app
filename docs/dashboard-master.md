# DASHBOARD MASTER CONTROL FILE

This is the single entry point for all AI agents working on the dashboard.

All other dashboard-related markdown files are subordinate to this file.

====================================================

## 1. SYSTEM PURPOSE

This system controls incremental refactoring of a Next.js dashboard.

Goals:
- stable UI shell (desktop + mobile)
- preserved business logic
- no duplicate components
- controlled patch-by-patch execution

====================================================

## 2. FILE AUTHORITY ORDER

When conflicts exist, use this priority:

1. dashboard-contract.md (business + logic rules)
2. dashboard-task-pipeline.md (execution order)
3. dashboard-state-map.md (UI structure + state)
4. dashboard-change-types.md (allowed modifications)
5. dashboard-rebuild-protocol.v1.md (safety rules)

====================================================

## 3. REQUIRED AI BEHAVIOR

Every AI must:

- Read this file FIRST
- Treat it as routing logic only
- Then follow referenced files
- Never bypass task pipeline order
- Never perform full file rewrites

====================================================

## 4. EXECUTION MODES

### MODE A: AUDIT ONLY
- no code changes
- only analysis

### MODE B: PATCH MODE
- exactly ONE minimal change
- one file only
- one concern only

Must be explicitly triggered by:
"PROCEED WITH AUTO-PROGRESS"

====================================================

## 5. DASHBOARD ARCHITECTURE SUMMARY

- Desktop: sidebar + workspace views
- Mobile: bottom tab navigation
- Views:
  - overview
  - forms
  - responses
  - analytics

All views are state-driven, not route-driven.

====================================================

## 6. STATE RULES

- Tab state already exists
- Must NOT be recreated
- Must NOT be moved to global store
- Must remain inside Dashboard.tsx

====================================================

## 7. SAFE EXECUTION RULE

Allowed changes:
- layout structure
- navigation placement
- UI shell wiring

Forbidden:
- business logic changes
- Supabase changes
- auth changes
- full rewrites
- duplicate components

====================================================

## 8. STOP RULE

If unclear:
- STOP
- request clarification
- do not guess or reconstruct

====================================================

END OF FILE