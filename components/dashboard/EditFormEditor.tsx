"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import { updateFormAction, type DashboardActionState } from "../../lib/dashboard/actions";
import { StepBasicInfo, StepFieldBuilder, StepReview, type CreateFormWizardField } from "./CreateFormModalSteps";

type EditableForm = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  fields: CreateFormWizardField[];
};

type WizardStep = 1 | 2 | 3;

const initialActionState: DashboardActionState = {
  status: "idle",
  message: "",
};

const STEP_TITLES: Record<WizardStep, string> = {
  1: "Basic info",
  2: "Field builder",
  3: "Review",
};

export default function EditFormEditor({ form }: { form: EditableForm }) {
  const [state, formAction, isPending] = useActionState(updateFormAction, initialActionState);
  const [step, setStep] = useState<WizardStep>(1);
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description ?? "");
  const [isPublic, setIsPublic] = useState(form.isPublic);
  const [fields, setFields] = useState<CreateFormWizardField[]>(form.fields);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(form.fields[0]?.id ?? null);
  const [focusPulseKey, setFocusPulseKey] = useState(0);
  const [titleTouched, setTitleTouched] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const fieldListRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeFieldId && fields.some((field) => field.id === activeFieldId)) {
      return;
    }

    setActiveFieldId(fields[0]?.id ?? null);
  }, [activeFieldId, fields]);

  const isTitleValid = title.trim().length > 0;
  const titleError = !isTitleValid && (titleTouched || step1Attempted) ? "A form title is required." : undefined;
  const canContinueFromStep1 = isTitleValid;

  const focusField = (id: string) => {
    setActiveFieldId(id);
    setFocusPulseKey((current) => current + 1);
  };

  const addField = () => {
    const id = crypto.randomUUID();
    setFields((current) => [
      ...current,
      {
        id,
        label: "",
        type: "text",
        required: false,
      },
    ]);
    focusField(id);
  };

  const updateField = (id: string, updates: Partial<CreateFormWizardField>) => {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const removeField = (id: string) => {
    setFields((current) => {
      const nextFields = current.filter((field) => field.id !== id);

      if (activeFieldId === id || (activeFieldId && !nextFields.some((field) => field.id === activeFieldId))) {
        setActiveFieldId(nextFields[0]?.id ?? null);
        if (nextFields[0]) {
          setFocusPulseKey((currentKey) => currentKey + 1);
        }
      }

      return nextFields;
    });
  };

  const goBack = () => {
    setStep((current) => (current === 3 ? 2 : 1));
  };

  const goNext = () => {
    if (step === 1) {
      setTitleTouched(true);
      setStep1Attempted(true);

      if (!canContinueFromStep1) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step !== 3) {
      event.preventDefault();

      if (step === 1) {
        setTitleTouched(true);
        setStep1Attempted(true);
      }

      return;
    }

    if (!canContinueFromStep1) {
      event.preventDefault();
      setTitleTouched(true);
      setStep1Attempted(true);
    }
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none sm:p-5">
      <form action={formAction} onSubmit={handleSubmit} className="flex min-h-[34rem] flex-col">
        <input type="hidden" name="formId" value={form.id} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="isPublic" value={String(isPublic)} />
        <input type="hidden" name="fields" value={JSON.stringify(fields)} />

        <div className="shrink-0 border-b border-[var(--border)] pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Edit form</p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{STEP_TITLES[step]}</h2>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">Step {step} of 3</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 py-4">
          {step === 1 ? (
            <StepBasicInfo
              title={title}
              description={description}
              isPublic={isPublic}
              titleError={titleError}
              onTitleChange={(value) => {
                setTitle(value);
                if (!titleTouched) {
                  setTitleTouched(true);
                }
              }}
              onDescriptionChange={setDescription}
              onIsPublicChange={setIsPublic}
            />
          ) : null}

          {step === 2 ? (
            <div className="min-h-[28rem] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3 sm:p-4">
              <StepFieldBuilder
                fields={fields}
                activeFieldId={activeFieldId}
                focusPulseKey={focusPulseKey}
                onActivateField={focusField}
                addField={addField}
                updateField={updateField}
                removeField={removeField}
                listRegionRef={(node) => {
                  fieldListRegionRef.current = node;
                }}
              />
            </div>
          ) : null}

          {step === 3 ? <StepReview title={title} description={description} isPublic={isPublic} fields={fields} /> : null}
        </div>

        <div className="shrink-0 border-t border-[var(--border)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-5 text-[#b42318]">{step === 1 && titleError ? titleError : null}</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button href="/dashboard" variant="secondary" size="sm" className="sm:min-w-40">
                Back to dashboard
              </Button>

              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={goBack} className="sm:min-w-40">
                  Back
                </Button>
              ) : null}

              {step < 3 ? (
                <Button type="button" onClick={goNext} disabled={step === 1 && !canContinueFromStep1} className="sm:min-w-40">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isPending || !canContinueFromStep1} className="sm:min-w-40">
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              )}
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{state.message}</p>
        </div>
      </form>
    </Card>
  );
}
