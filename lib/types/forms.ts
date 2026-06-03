export type FieldType = "text" | "textarea" | "email" | "select" | "checkbox";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  published: boolean;
  createdAt: string; // ISO date
}

export interface Submission {
  id: string;
  formId: string;
  values: Record<string, string | string[] | boolean>;
  createdAt: string;
}
