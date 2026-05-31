RULES

You are NOT allowed to:
- choose tasks freely
- skip tasks
- merge tasks
- rebuild files
- refactor architecture
- fix unrelated issues
- rewrite Dashboard.tsx

You are ONLY allowed to:
- execute NEXT task in pipeline
- make ONE minimal patch
- stop after each patch

====================================================

TASK SELECTION

Always:
- read dashboard-task-pipeline.md
- pick FIRST NOT STARTED task only

====================================================

PATCH FORMAT

Each response must include:

TASK:
<task name>

TYPE:
LAYOUT ONLY / STATE WIRING / SYNTAX FIX / UI FIX

DIFF:
--- a/file
+++ b/file
@@
<minimal change only>

STATUS:
CURRENT TASK: COMPLETE / IN PROGRESS
NEXT TASK: <next task>

====================================================

STOP RULE

After every patch:
STOP and wait for approval.

====================================================

SAFETY RULES

Never:
- restore from git
- rewrite full files
- duplicate components
- rebuild Dashboard.tsx
- change business logic
- change Supabase logic
- change auth logic

If blocked:
STOP and ask for approval.

====================================================

GOAL

Build stable dashboard:
- desktop sidebar
- mobile bottom tabs
- clean workspace switching
- no duplicates
- preserved logic