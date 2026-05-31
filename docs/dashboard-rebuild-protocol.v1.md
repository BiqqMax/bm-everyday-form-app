
# SAFE DASHBOARD REBUILD PROTOCOL (v1)

## 0. PURPOSE

This protocol defines how to safely rebuild or repair `components/dashboard/Dashboard.tsx`
WITHOUT:
- losing UI structure
- duplicating logic
- breaking Supabase/data contracts
- triggering TS1128 / EOF loops
- introducing conflicting dashboard versions

---

## 1. CORE RULE

Dashboard.tsx is:

> A SINGLE SOURCE OF TRUTH RENDER FILE

It must NEVER exist in multiple structural versions at once.

Only ONE of these states is allowed at any time:
- Stable
- Partially broken (repair mode)
- Rebuild mode (controlled section-by-section)

NOT:
- mixed states
- duplicated implementations
- partial git merges

---

## 2. REBUILD TRIGGERS (WHEN THIS PROTOCOL ACTIVATES)

This protocol MUST be used if ANY of the following occur:

- TS1005 `}` expected
- TS1128 declaration errors
- duplicate function declarations
- truncated file reads
- missing export default Dashboard
- EOF inside JSX return
- conflicting dashboard versions

---

## 3. ABSOLUTE FORBIDDEN ACTIONS

During rebuild:

❌ No full file rewrite  
❌ No git restore replacement  
❌ No “clean version” generation  
❌ No copying entire duplicate blocks  
❌ No guessing missing JSX or exports  
❌ No merging two dashboard versions blindly  
❌ No simultaneous logic + layout refactor  

---

## 4. SAFE REBUILD METHOD (MANDATORY)

Rebuild MUST happen in this order:

### STEP 1 — STRUCTURE FREEZE

Identify and lock:
- existing imports
- state hooks (useState, useActionState)
- data contract (DashboardData)
- action functions (create/update/delete)
- panel components

Do NOT modify them.

---

### STEP 2 — RENDER TREE ISOLATION

Split dashboard into ONLY 3 logical blocks:

1. Desktop Shell
2. Mobile Shell
3. Shared Workspace Views

No other restructuring allowed.

---

### STEP 3 — SECTION-BY-SECTION VALIDATION

Rebuild ONLY ONE section at a time:

Order:
1. imports + types
2. state declarations
3. desktop layout shell
4. mobile layout shell
5. workspace render switching
6. ShareModal integration
7. export default

Each step must compile before continuing.

---

### STEP 4 — DUPLICATE HANDLING RULE

If duplicates exist:

- DO NOT delete both
- DO NOT merge both blindly
- KEEP FIRST OCCURRENCE ONLY
- REMOVE second occurrence ONLY IF fully identical

If uncertain → STOP.

---

### STEP 5 — EOF / SYNTAX RECOVERY RULE

If file ends with:
- incomplete JSX
- missing braces
- missing export

Then:

1. DO NOT reconstruct from memory
2. REQUEST full file dump OR last valid function block
3. Repair ONLY the last confirmed function

---

## 5. DASHBOARD ARCHITECTURE GUARANTEE

Rebuilt Dashboard MUST preserve:

### Desktop
- persistent sidebar
- workspace view switching
- overview/forms/responses/analytics

### Mobile
- bottom tab bar
- single-column panels
- quick actions

### Business Logic
- Supabase queries unchanged
- form actions unchanged
- share logic unchanged

---

## 6. SAFE PATCH RULE

Every change MUST be:

- single-purpose
- reversible
- minimal diff
- explained before applied

NO silent edits allowed.

---

## 7. APPROVAL GATE (MANDATORY)

Before ANY code change:

AI MUST output:

1. What is broken
2. What will be changed
3. What will NOT be touched
4. Risk level (low/medium/high)
5. Exact patch plan

Then WAIT for approval.

---

## 8. FINAL GUARANTEE RULE

If uncertainty exists:

> STOP and request more file context.

NEVER guess missing code.
NEVER reconstruct full components.
NEVER switch to git restoration.

---

END OF PROTOCOL