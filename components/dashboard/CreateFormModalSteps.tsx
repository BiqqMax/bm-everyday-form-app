"use client";

import { createPortal } from "react-dom";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

export type CreateFormWizardField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
};

type StepBasicInfoProps = {
  title: string;
  description: string;
  isPublic: boolean;
  titleError?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPublicChange: (value: boolean) => void;
};

type StepFieldBuilderProps = {
  fields: CreateFormWizardField[];
  activeFieldId: string | null;
  focusPulseKey: number;
  onActivateField: (id: string) => void;
  addField: () => void;
  updateField: (id: string, updates: Partial<CreateFormWizardField>) => void;
  removeField: (id: string) => void;
  listRegionRef: (node: HTMLDivElement | null) => void;
};

type StepReviewProps = {
  title: string;
  description: string;
  isPublic: boolean;
  fields: CreateFormWizardField[];
  validationErrors?: string[];
};

type CreateFormSuccessScreenProps = {
  title: string;
  formId: string;
  qr_share_token: string;
  onManageForm: () => void;
  onShareForm: () => void;
  onCreateAnother: () => void;
};

const FIELD_TYPES = [
  { label: "Short text", value: "text" },
  { label: "Long text", value: "textarea" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Select", value: "select" },
  { label: "Checkbox", value: "checkbox" },
] as const;

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fieldTypeLabel(type: string) {
  return FIELD_TYPES.find((item) => item.value === type)?.label ?? type;
}

function fieldOptionsToText(options?: string[]) {
  return options?.join("\n") ?? "";
}

function textToFieldOptions(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeOption(value: string) {
  return value.trim();
}

function isDuplicateOption(options: string[], nextValue: string, ignoreIndex?: number) {
  const normalized = normalizeOption(nextValue).toLowerCase();

  return options.some((option, index) => {
    if (ignoreIndex === index) {
      return false;
    }

    return normalizeOption(option).toLowerCase() === normalized;
  });
}

function SelectOptionsChipInput({
  fieldId,
  options = [],
  onChange,
}: {
  fieldId: string;
  options?: string[];
  onChange: (nextOptions: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draftInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const commitDraft = () => {
    const nextValue = normalizeOption(draft);

    if (!nextValue) {
      setDraft("");
      return;
    }

    if (isDuplicateOption(options, nextValue)) {
      setDraft("");
      return;
    }

    onChange([...options, nextValue]);
    setDraft("");
  };

  const removeOption = (indexToRemove: number) => {
    onChange(options.filter((_, index) => index !== indexToRemove));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingDraft(options[index] ?? "");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingDraft("");
  };

  const commitEdit = () => {
    if (editingIndex === null) {
      return;
    }

    const nextValue = normalizeOption(editingDraft);
    const originalValue = options[editingIndex] ?? "";

    if (!nextValue) {
      removeOption(editingIndex);
      cancelEdit();
      return;
    }

    if (nextValue === normalizeOption(originalValue)) {
      cancelEdit();
      return;
    }

    if (isDuplicateOption(options, nextValue, editingIndex)) {
      cancelEdit();
      return;
    }

    onChange(options.map((option, index) => (index === editingIndex ? nextValue : option)));
    cancelEdit();
  };

  useEffect(() => {
    if (editingIndex === null) {
      return;
    }

    if (editingIndex >= options.length) {
      cancelEdit();
      return;
    }

    setEditingDraft(options[editingIndex] ?? "");
  }, [editingIndex, options]);

  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
      return;
    }

    draftInputRef.current?.focus();
  }, [editingIndex]);

  useEffect(() => {
    if (editingIndex === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (rootRef.current?.contains(target)) {
        return;
      }

      commitEdit();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [editingIndex, editingDraft, options]);

  const handleDraftKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === "Backspace" && !draft && options.length) {
      event.preventDefault();
      removeOption(options.length - 1);
    }
  };

  const handleEditKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div
      ref={rootRef}
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option, index) =>
          editingIndex === index ? (
            <input
              key={`${fieldId}-option-edit-${index}`}
              ref={editInputRef}
              value={editingDraft}
              onChange={(event) => setEditingDraft(event.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleEditKeyDown}
              aria-label={`Edit option ${index + 1}`}
              className="min-w-[9rem] max-w-full rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
            />
          ) : (
            <div
              key={`${fieldId}-option-${index}`}
              className="group inline-flex max-w-full items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
            >
              <button
                type="button"
                onClick={() => startEditing(index)}
                className="max-w-[14rem] truncate px-3 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset"
                aria-label={`Edit option ${index + 1}`}
                title={option}
              >
                {option}
              </button>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label={`Remove option ${index + 1}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )
        )}

        <input
          ref={draftInputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder="Type option and press Enter"
          aria-label="Add select option"
          className="min-w-[12rem] flex-1 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}

function FieldTypeDropdown({
  fieldId,
  value,
  onChange,
}: {
  fieldId: string;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedIndex = Math.max(
    0,
    FIELD_TYPES.findIndex((item) => item.value === value)
  );
  const selectedLabel = FIELD_TYPES[selectedIndex]?.label ?? value;

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const width = rect.width;
    const left = Math.min(
      Math.max(rect.left, 8),
      Math.max(8, window.innerWidth - width - 8)
    );
    const top = rect.bottom + 8;
    const maxHeight = Math.max(160, window.innerHeight - top - 16);

    setPosition({ top, left, width, maxHeight });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    setHighlightedIndex(selectedIndex);
    updatePosition();
  }, [isOpen, selectedIndex, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleReposition = () => {
      updatePosition();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectType = (nextValue: string) => {
    onChange(nextValue);
    closeMenu();
  };

  const moveHighlight = (direction: 1 | -1) => {
    setHighlightedIndex((current) => {
      const nextIndex = (current + direction + FIELD_TYPES.length) % FIELD_TYPES.length;
      return nextIndex;
    });
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectType(FIELD_TYPES[highlightedIndex]?.value ?? FIELD_TYPES[0].value);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${fieldId}-field-type-menu`}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={joinClasses(
          "flex w-full min-h-[50px] items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm font-normal text-[var(--foreground)] outline-none transition-colors hover:border-[var(--border)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0",
          isOpen && "border-[var(--accent)] ring-2 ring-[var(--ring)]"
        )}
      >
        <span className="truncate">{selectedLabel}</span>

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={joinClasses("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && position
        ? createPortal(
          <div
            ref={menuRef}
            id={`${fieldId}-field-type-menu`}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${fieldId}-field-type-option-${FIELD_TYPES[highlightedIndex]?.value ?? FIELD_TYPES[0].value}`}
            onKeyDown={handleKeyDown}
            className="fixed z-[70] overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[0_18px_40px_rgba(15,23,42,0.12)] outline-none"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
          >
            {FIELD_TYPES.map((option, index) => (
              <button
                key={option.value}
                id={`${fieldId}-field-type-option-${option.value}`}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectType(option.value)}
                className={joinClasses(
                  "flex w-full items-center rounded-[12px] px-3 py-2.5 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]",
                  highlightedIndex === index && "bg-[var(--surface-subtle)]",
                  value === option.value && "text-[var(--accent)]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

export function StepBasicInfo({
  title,
  description,
  isPublic,
  titleError,
  onTitleChange,
  onDescriptionChange,
  onIsPublicChange,
}: StepBasicInfoProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Form title</span>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          error={titleError}
          placeholder="Enter a title"
          required
        />
      </label>

      <label className="block text-sm">
        <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Description</span>
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={4}
          placeholder="Add a short description"
          className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
        />
      </label>

      <label className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => onIsPublicChange(event.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
        />
        Public form
      </label>
    </div>
  );
}

export function StepFieldBuilder({
  fields,
  activeFieldId,
  focusPulseKey,
  onActivateField,
  addField,
  updateField,
  removeField,
  listRegionRef,
}: StepFieldBuilderProps) {
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listRegionNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeFieldId) {
      return;
    }

    const activeField = fieldRefs.current[activeFieldId];
    if (!activeField) {
      return;
    }

    const focusTarget = activeField.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
    focusTarget?.focus({ preventScroll: true });
    activeField.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeFieldId, focusPulseKey]);

  const handleActivateField = (id: string) => {
    if (activeFieldId === id) {
      return;
    }

    onActivateField(id);
  };

  const renderCollapsedRow = (field: CreateFormWizardField, index: number) => {
    const isActive = activeFieldId === field.id;

    return (
      <Card
        key={field.id}
        ref={(node) => {
          fieldRefs.current[field.id] = node;
        }}
        className={joinClasses(
          "border-[var(--border)] shadow-none transition-colors",
          isActive ? "bg-[rgba(15,93,70,0.04)]" : "bg-[var(--surface)] hover:bg-[var(--surface-subtle)]"
        )}
      >
        {isActive ? (
          <div className="space-y-3 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium tracking-tight text-[var(--foreground)]">
                    {field.label || `Field ${index + 1}`}
                  </p>
                  <span className="text-xs text-[var(--muted-foreground)]">{fieldTypeLabel(field.type)}</span>
                  <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                    {field.required ? "Required" : "Optional"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => removeField(field.id)}
                className="shrink-0"
              >
                Remove
              </Button>
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-3">
              <Input
                label="Field label"
                value={field.label}
                onChange={(event) => updateField(field.id, { label: event.target.value })}
                placeholder="Enter a field label"
              />

              <label className="block text-sm">
                <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Field type</span>
                <FieldTypeDropdown
                  fieldId={field.id}
                  value={field.type}
                  onChange={(nextType) => {
                    updateField(field.id, {
                      type: nextType,
                      options: nextType === "select" ? field.options ?? [] : field.options,
                    });
                  }}
                />
              </label>

              {field.type === "select" ? (
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-[var(--foreground)]">Options</span>
                  <SelectOptionsChipInput
                    fieldId={field.id}
                    options={field.options}
                    onChange={(nextOptions) => updateField(field.id, { options: nextOptions })}
                  />
                </div>
              ) : null}

              <label className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) => updateField(field.id, { required: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                />
                Required
              </label>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleActivateField(field.id)}
            className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset sm:px-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium tracking-tight text-[var(--foreground)]">
                  {field.label || `Field ${index + 1}`}
                </p>
                <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{fieldTypeLabel(field.type)}</span>
                <span className="shrink-0 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                  {field.required ? "Required" : "Optional"}
                </span>
              </div>
            </div>

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </Card>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div ref={(node) => {
        listRegionNodeRef.current = node;
        listRegionRef(node);
      }} className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {fields.length ? (
          fields.map((field, index) => renderCollapsedRow(field, index))
        ) : (
          <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-tight text-[var(--foreground)]">No fields added yet</p>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">Add at least one field to continue.</p>
            </div>
          </Card>
        )}
      </div>

      <div className="shrink-0">
        <Button type="button" onClick={addField} className="w-full sm:w-auto sm:min-w-44">
          Add field
        </Button>
      </div>
    </div>
  );
}

export function StepReview({ title, description, isPublic, fields, validationErrors }: StepReviewProps) {
  return (
    <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="space-y-3">
        {validationErrors?.length ? (
          <div className="space-y-1 rounded-[var(--radius-md)] border border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.06)] px-3 py-2 text-sm text-[#b42318]">
            {validationErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Form details</p>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">Title</p>
              <p className="text-base font-medium tracking-tight text-[var(--foreground)]">{title || "Untitled form"}</p>
            </div>

            <div className="space-y-1 sm:col-span-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">Description</p>
              <p className="text-base font-normal leading-6 text-[var(--foreground)]">{description || "No description provided."}</p>
            </div>

            <div className="space-y-1 sm:col-span-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">Visibility</p>
              <p className="text-base font-normal leading-6 text-[var(--foreground)]">{isPublic ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Fields</p>
              <p className="text-xs text-[var(--muted-foreground)]">{fields.length} field{fields.length === 1 ? "" : "s"}</p>
            </div>

            {fields.length ? (
              <div className="divide-y divide-[var(--border)]">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 space-y-1">
                      <p className="text-base font-medium tracking-tight text-[var(--foreground)]">
                        {field.label || `Field ${index + 1}`}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{fieldTypeLabel(field.type)} · {field.required ? "Required" : "Optional"}</p>
                      {field.type === "select" && field.options?.length ? (
                        <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                          Options: {field.options.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right text-xs leading-5 text-[var(--muted-foreground)]">
                      <p>{field.required ? "*Required" : "Optional"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">No fields added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateFormSuccessScreen({
  title,
  formId,
  qr_share_token,
  onManageForm,
  onShareForm,
  onCreateAnother,
}: CreateFormSuccessScreenProps) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="space-y-2 pt-1">
          <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Form created</h3>
          <p className="text-sm leading-5 text-[var(--muted-foreground)]">{title} is ready to receive responses.</p>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button type="button" onClick={onManageForm} className="sm:min-w-44">
            Manage form
          </Button>
          <Button type="button" variant="secondary" onClick={onShareForm} className="sm:min-w-44">
            Share form
          </Button>
          <Button type="button" variant="secondary" onClick={onCreateAnother} className="sm:min-w-44">
            Create another
          </Button>
        </div>
      </div>
    </Card>
  );
}
