"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "../supabase/browser";
import type { DashboardSubmission } from "../dashboard/dashboard";
type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  errors: unknown[];
};

// Use the browser supabase client for the realtime channel
const supabaseBrowser = createClient();

/**
 * Formats an answer value from the database into a displayable string.
 * Mirrors the server-side formatAnswerValue in lib/dashboard/dashboard.ts.
 */
function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : String(item)))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/**
 * Fetches the full submission details (including answers) for a single submission ID.
 * Uses the browser supabase client so it can query from the client side.
 */
async function fetchSubmissionWithAnswers(
  submissionId: string
): Promise<DashboardSubmission | null> {
  const submissionResult = await supabaseBrowser
    .from("submissions")
    .select("id,form_id,created_at,submitted_by_user_id")
    .eq("id", submissionId)
    .single();

  // Retry fetching answers — the realtime INSERT on submissions fires
  // before submission_answers rows finish inserting in the submit route.
  const MAX_ANSWERS_RETRIES = 5;
  const ANSWERS_RETRY_DELAY_MS = 300;

  let answersData: Array<{
    id: string;
    submission_id: string;
    form_field_id: string;
    answer_value: unknown;
    created_at: string;
  }> | null = null;

  for (let attempt = 0; attempt < MAX_ANSWERS_RETRIES; attempt++) {
    const result = await supabaseBrowser
      .from("submission_answers")
      .select("id,submission_id,form_field_id,answer_value,created_at")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: false });

    if (result.data && result.data.length > 0) {
      answersData = result.data as Array<{
        id: string;
        submission_id: string;
        form_field_id: string;
        answer_value: unknown;
        created_at: string;
      }>;
      break;
    }

    if (attempt < MAX_ANSWERS_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, ANSWERS_RETRY_DELAY_MS));
    }
  }

  // If all retries exhausted with no data, do one final fetch to get whatever is there
  if (!answersData) {
    const finalResult = await supabaseBrowser
      .from("submission_answers")
      .select("id,submission_id,form_field_id,answer_value,created_at")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: false });
    answersData = (finalResult.data ?? []) as Array<{
      id: string;
      submission_id: string;
      form_field_id: string;
      answer_value: unknown;
      created_at: string;
    }>;
  }

  const answersResult = { data: answersData };

  if (submissionResult.error || !submissionResult.data) {
    console.warn(
      "[useRealtimeSubmissions] Could not fetch submission details",
      submissionResult.error
    );
    return null;
  }

  const submission = submissionResult.data;

  // Fetch the form title
  const formResult = await supabaseBrowser
    .from("forms")
    .select("title")
    .eq("id", submission.form_id)
    .single();

  const formTitle = formResult.data?.title ?? "Untitled form";

  // Fetch field labels for answer context
  const fieldIds = ((answersResult.data ?? []) as Array<{ form_field_id: string }>).map(
    (a) => a.form_field_id
  );
  let fieldLabelMap = new Map<string, string>();

  if (fieldIds.length > 0) {
    const fieldsResult = await supabaseBrowser
      .from("form_fields")
      .select("id,label")
      .in("id", fieldIds);

    if (fieldsResult.data) {
      for (const field of fieldsResult.data as Array<{ id: string; label: string }>) {
        fieldLabelMap.set(field.id, field.label);
      }
    }
  }

  const answers = ((answersResult.data ?? []) as Array<{
    id: string;
    submission_id: string;
    form_field_id: string;
    answer_value: unknown;
    created_at: string;
  }>).map((answer) => ({
    fieldId: answer.form_field_id,
    fieldLabel: fieldLabelMap.get(answer.form_field_id) ?? "Field",
    value: formatAnswerValue(answer.answer_value),
  }));

  return {
    id: submission.id,
    formId: submission.form_id,
    formTitle,
    createdAt: submission.created_at,
    submittedByUserId: submission.submitted_by_user_id,
    answers,
  };
}

export type RealtimeSubmissionsResult = {
  /** The live-updating list of recent submissions (newest first). */
  liveSubmissions: DashboardSubmission[];
  /** Total count of all submissions (updated in realtime). */
  totalSubmissionCount: number;
};

/**
 * Subscribes to INSERT events on `public.submissions` filtered by the given form IDs.
 * When a new submission arrives, it fetches the full details (with answers) and prepends
 * it to the submissions list.
 *
 * The subscription is automatically cleaned up on unmount and when formIds change.
 */
export function useRealtimeSubmissions(
  initialSubmissions: DashboardSubmission[],
  formIds: string[],
  initialTotalCount: number
): RealtimeSubmissionsResult {
  const [liveSubmissions, setLiveSubmissions] = useState<DashboardSubmission[]>(
    () => initialSubmissions
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Track which submission IDs we've already seen to prevent duplicates
  const seenIds = useRef(new Set<string>(initialSubmissions.map((s) => s.id)));

  // Track the current formIds so the subscription callback can access them without
  // recreating the channel
  const formIdsRef = useRef(formIds);
  formIdsRef.current = formIds;

  // Reset when initial data changes (e.g. navigation)
  const initialSubmissionsRef = useRef(initialSubmissions);
  useEffect(() => {
    // Only reset if the reference actually changed (not on first mount)
    if (initialSubmissionsRef.current !== initialSubmissions) {
      initialSubmissionsRef.current = initialSubmissions;
      setLiveSubmissions(initialSubmissions);
      setTotalCount(initialTotalCount);
      seenIds.current = new Set(initialSubmissions.map((s) => s.id));
    }
  }, [initialSubmissions, initialTotalCount]);

  const handleInsert = useCallback(async (payload: RealtimePayload) => {
    console.log("[useRealtimeSubmissions] INSERT event received", payload);

    const newRow = payload.new;
    const submissionId = newRow.id as string | undefined;
    const formId = newRow.form_id as string | undefined;

    if (!submissionId) {
      console.warn("[useRealtimeSubmissions] No submission ID in payload");
      return;
    }

    // Filter: only process submissions for forms this dashboard cares about
    const currentFormIds = formIdsRef.current;
    console.log(
      "[useRealtimeSubmissions] Filtering — formId:",
      formId,
      "currentFormIds:",
      currentFormIds
    );

    if (formId && !currentFormIds.includes(formId)) {
      console.log("[useRealtimeSubmissions] formId not in currentFormIds, skipping");
      return;
    }

    // Prevent duplicate handling of already-seen IDs
    if (seenIds.current.has(submissionId)) {
      console.log("[useRealtimeSubmissions] Duplicate submissionId, skipping");
      return;
    }

    // Fetch full submission details BEFORE marking as seen,
    // so a failed fetch will be retried on the next realtime event.
    console.log("[useRealtimeSubmissions] Fetching full submission details for", submissionId);
    const fullSubmission = await fetchSubmissionWithAnswers(submissionId);

    if (!fullSubmission) {
      console.warn("[useRealtimeSubmissions] Could not fetch full submission details — will retry on next event");
      return;
    }

    // Fire-and-forget: send email notification to the form owner
    // via the Supabase Edge Function — do not await, must not block the UI.
    void (async () => {
      try {
        // Lookup owner email: formId → forms.owner_id → profiles.email
        const { data: formData, error: formError } = await supabaseBrowser
          .from("forms")
          .select("owner_id")
          .eq("id", fullSubmission.formId)
          .single();

        if (formError || !formData?.owner_id) {
          console.warn(
            "[useRealtimeSubmissions] Could not find form owner for email notification",
            formError
          );
          return;
        }

        const { data: profileData, error: profileError } = await supabaseBrowser
          .from("profiles")
          .select("email")
          .eq("id", formData.owner_id)
          .single();

        if (profileError || !profileData?.email) {
          console.warn(
            "[useRealtimeSubmissions] Could not find owner email for notification",
            profileError
          );
          return;
        }

        const emailAnswers = fullSubmission.answers.map((a) => ({
          fieldId: a.fieldId,
          label: a.fieldLabel,
          value: a.value,
        }));

        void fetch('/api/send-submission-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: fullSubmission.id,
            formTitle: fullSubmission.formTitle,
            answers: emailAnswers,
            ownerEmail: profileData.email,
          }),
        })
          .then(r => r.json())
          .then(console.log)
          .catch(console.error);
      } catch (err) {
        console.error("[useRealtimeSubmissions] Failed to send submission email:", err);
      }
    })();

    // Only mark as seen after a successful fetch
    seenIds.current.add(submissionId);

    // Increment total count optimistically
    setTotalCount((prev) => prev + 1);

    console.log("[useRealtimeSubmissions] Fetched submission, updating state", fullSubmission.id);
    setLiveSubmissions((prev) => {
      // Double-check dedup against current state
      if (prev.some((s) => s.id === fullSubmission.id)) {
        console.log("[useRealtimeSubmissions] Already in state, skipping");
        return prev;
      }
      // Prepend to show newest first
      console.log("[useRealtimeSubmissions] Prepending to state, new length:", prev.length + 1);
      return [fullSubmission, ...prev];
    });
  }, []);

  useEffect(() => {
    if (formIds.length === 0) return;

    // Supabase Realtime supports the `in` filter for matching against a list of values.
    // Format: `column=in.(value1, value2, ...)`
    // Using `eq` comma-separated is NOT valid for multiple values per the Supabase docs.
    const filterValue =
      formIds.length === 1
        ? `form_id=eq.${formIds[0]}`
        : `form_id=in.(${formIds.join(",")})`;

    // Use a unique channel name per form-id set to prevent collisions if
    // multiple dashboard instances exist (e.g. different browser tabs).
    const channelKey = formIds.sort().join("-");
    const channelName = `realtime-submissions-${channelKey}`;

    const channel = supabaseBrowser
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: filterValue,
        },
        (payload) => {
          handleInsert(payload as unknown as RealtimePayload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
        },
        (payload) => {
          console.log("[REALTIME_DEBUG_UNFILTERED]", payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[useRealtimeSubmissions] Subscribed to submissions INSERT events");
        }
        if (status === "CHANNEL_ERROR") {
          console.error(
            "[useRealtimeSubmissions] Channel error — will attempt reconnect automatically"
          );
        }
      });

    return () => {
      console.log("[useRealtimeSubmissions] Cleaning up realtime subscription");
      supabaseBrowser.removeChannel(channel);
    };
  }, [formIds, handleInsert]);

  return { liveSubmissions, totalSubmissionCount: totalCount };
}
