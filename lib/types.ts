export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
};

export type Form = {
  id: string;
  title: string;
  description: string | null;
  public: boolean;
  fields: FormField[];
  createdAt: string; // ISO
};

export type Submission = {
  id: string;
  formId: string;
  data: Record<string, string | number | boolean>;
  createdAt: string; // ISO
};
