import type { Metadata } from 'next';
import { createClient } from '../../../lib/supabase/server';
import { PublicFormClient, type PublicFormView } from './public-form-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageParams = {
  displayName: string;
  publicToken: string;
};

const FORM_TABLE = 'forms';
const RESPONSE_TABLE_CANDIDATES = ['form_responses', 'form_submissions', 'responses'] as const;
const FORM_ID_COLUMNS = ['form_id', 'formId'] as const;
const DISPLAY_NAME_COLUMNS = ['display_name', 'displayName', 'slug'] as const;
const TOKEN_COLUMNS = ['public_token', 'publicToken', 'token'] as const;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function parseFields(value: unknown) {
  const fields = toArray<Record<string, unknown>>(value);
  if (fields.length > 0) return fields;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getFormTitle(row: Record<string, unknown>) {
  return (
    (typeof row.title === 'string' && row.title) ||
    (typeof row.name === 'string' && row.name) ||
    (typeof row.form_title === 'string' && row.form_title) ||
    (typeof row.formName === 'string' && row.formName) ||
    'Untitled form'
  );
}

function getFormDescription(row: Record<string, unknown>) {
  return (
    (typeof row.description === 'string' && row.description) ||
    (typeof row.subtitle === 'string' && row.subtitle) ||
    (typeof row.form_description === 'string' && row.form_description) ||
    (typeof row.formDescription === 'string' && row.formDescription) ||
    ''
  );
}

function isPublished(row: Record<string, unknown>) {
  if (typeof row.is_published === 'boolean') return row.is_published;
  if (typeof row.published === 'boolean') return row.published;
  if (typeof row.status === 'string') return row.status.toLowerCase() === 'published';
  if (row.published_at) return true;
  return false;
}

function getExpiry(row: Record<string, unknown>) {
  const candidate =
    row.public_expires_at ?? row.expires_at ?? row.expiry_at ?? row.ends_at ?? row.end_at ?? null;

  if (typeof candidate === 'string' || candidate instanceof Date) {
    const date = new Date(candidate);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getResponseLimit(row: Record<string, unknown>) {
  const candidate =
    row.public_response_limit ?? row.response_limit ?? row.max_responses ?? row.limit_responses ?? null;

  if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === 'string' && candidate.trim()) {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getCurrentResponseCount(row: Record<string, unknown>) {
  const candidate =
    row.public_response_count ?? row.response_count ?? row.responses_count ?? row.submission_count ?? null;

  if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === 'string' && candidate.trim()) {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

async function queryFormByColumnPair(
  supabase: Awaited<ReturnType<typeof createClient>>,
  displayName: string,
  publicToken: string,
) {
  for (const displayColumn of DISPLAY_NAME_COLUMNS) {
    for (const tokenColumn of TOKEN_COLUMNS) {
      const query = supabase
        .from(FORM_TABLE)
        .select('*')
        .eq(displayColumn, displayName)
        .eq(tokenColumn, publicToken)
        .maybeSingle();

      const { data, error } = await query;
      if (!error && data) return data as Record<string, unknown>;
    }
  }

  return null;
}

async function countResponses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formId: string,
) {
  for (const tableName of RESPONSE_TABLE_CANDIDATES) {
    for (const formIdColumn of FORM_ID_COLUMNS) {
      const { count, error } = await supabase
        .from(tableName)
        .select('id', { count: 'exact', head: true })
        .eq(formIdColumn, formId);

      if (!error) return count ?? 0;
    }
  }

  return null;
}

async function loadPublicForm(displayName: string, publicToken: string): Promise<PublicFormView | null> {
  const supabase = await createClient();
  const row = await queryFormByColumnPair(supabase, displayName, publicToken);

  if (!row) return null;

  const title = getFormTitle(row);
  const description = getFormDescription(row);
  const typedRow = row as Record<string, unknown> & { schema?: Record<string, unknown> };
  const fields = parseFields(typedRow.fields ?? typedRow.form_fields ?? typedRow.schema?.fields ?? typedRow.questions);
  const expiresAt = getExpiry(row);
  const responseLimit = getResponseLimit(row);
  const responseCountFromRow = getCurrentResponseCount(row);

  let responseCount = responseCountFromRow;
  if (responseCount == null && responseLimit != null && row.id) {
    responseCount = await countResponses(supabase, String(row.id));
  }

  return {
    id: String(row.id ?? ''),
    title,
    description,
    displayName,
    publicToken,
    fields,
    isPublished: isPublished(row),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    responseLimit,
    responseCount,
  };
}

function statusMessage(form: PublicFormView | null) {
  if (!form) {
    return {
      title: 'Form not found',
      description: 'This form link is invalid or no longer available.',
    };
  }

  if (!form.isPublished) {
    return {
      title: 'This form is not published yet',
      description: 'The owner has not made this form public.',
    };
  }

  if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
    return {
      title: 'This form has closed',
      description: 'The response window for this form has expired.',
    };
  }

  if (
    typeof form.responseLimit === 'number' &&
    typeof form.responseCount === 'number' &&
    form.responseCount >= form.responseLimit
  ) {
    return {
      title: 'This form is full',
      description: 'The response limit for this form has already been reached.',
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { displayName, publicToken } = await params;
  const form = await loadPublicForm(safeDecode(displayName), safeDecode(publicToken));
  return {
    title: form?.title ? `${form.title}` : 'Public form',
    description: form?.description || 'Submit a public form response.',
  };
}

export default async function PublicFormPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const displayName = safeDecode(resolvedParams.displayName);
  const publicToken = safeDecode(resolvedParams.publicToken);
  const form = await loadPublicForm(displayName, publicToken);
  const status = statusMessage(form);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">Public response</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{form?.title ?? 'Public form'}</h1>
            {form?.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{form.description}</p> : null}
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {status ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-semibold text-amber-950">{status.title}</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">{status.description}</p>
                <p className="mt-4 text-sm text-amber-800">
                  Please check the link with the form owner or try again later.
                </p>
              </div>
            ) : form ? (
              <PublicFormClient form={form} />
            ) : (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <h2 className="text-lg font-semibold text-rose-950">We couldn't load this form</h2>
                <p className="mt-2 text-sm leading-6 text-rose-900">
                  The link may be incorrect, expired, or no longer available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
