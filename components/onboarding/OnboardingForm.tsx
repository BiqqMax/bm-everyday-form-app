"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { getAuthTransitionUrl, DASHBOARD_ROUTE } from "../../lib/auth/flow";
import { createClient } from "../../lib/supabase/client";
import Button from "../ui/Button";
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import Input from "../ui/Input";

type AccountChoice = "personal" | "business" | "education";
type DatabaseAccountType = "individual" | "organization";
type OnboardingStep = 1 | 2;

type OnboardingFormProps = {
  userId: string;
  email: string;
  initialAccountType?: DatabaseAccountType | null;
  initialDisplayName?: string | null;
  initialOrganizationName?: string | null;
};

const ACCOUNT_CHOICES: Array<{
  value: AccountChoice;
  title: string;
  description: string;
}> = [
  {
    value: "personal",
    title: "Personal / Community",
    description: "For individual use, creators, and community groups.",
  },
  {
    value: "business",
    title: "Business / Work",
    description: "For teams, companies, and professional use.",
  },
  {
    value: "education",
    title: "Teaching / Education",
    description: "For classrooms, schools, and training programs.",
  },
];

function mapAccountTypeToChoice(accountType?: DatabaseAccountType | null): AccountChoice {
  return accountType === "organization" ? "business" : "personal";
}

function mapChoiceToDatabaseAccountType(choice: AccountChoice): DatabaseAccountType {
  return choice === "personal" ? "individual" : "organization";
}

function getStepLabel(step: OnboardingStep) {
  return `Step ${step} of 2`;
}

export default function OnboardingForm({
  userId,
  email,
  initialAccountType,
  initialDisplayName = "",
  initialOrganizationName = "",
}: OnboardingFormProps) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountChoice>(mapAccountTypeToChoice(initialAccountType));
  const [step, setStep] = useState<OnboardingStep>(1);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [organizationName, setOrganizationName] = useState(initialOrganizationName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresOrganization = accountType !== "personal";
  const stepLabel = getStepLabel(step);

  const helperText = useMemo(() => {
    if (step === 1) {
      return "Choose the setup that best matches how you’ll use the app.";
    }

    if (accountType === "personal") {
      return "Tell us what name you want to use in the app.";
    }

    if (accountType === "education") {
      return "Tell us the school, classroom, or program name.";
    }

    return "Tell us the company, team, or organization name.";
  }, [accountType, step]);

  function goToStep2() {
    setError(null);
    setStep(2);
  }

  function goBackToStep1() {
    setError(null);
    setStep(1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (step === 1) {
      goToStep2();
      return;
    }

    const trimmedDisplayName = displayName.trim();
    const trimmedOrganizationName = organizationName.trim();

    if (accountType === "personal" && !trimmedDisplayName) {
      setError("Please enter your display name.");
      return;
    }

    if (requiresOrganization && !trimmedOrganizationName) {
      setError("Please enter your organization name.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: email.trim(),
        account_type: mapChoiceToDatabaseAccountType(accountType),
        display_name: accountType === "personal" ? trimmedDisplayName : null,
        organization_name: requiresOrganization ? trimmedOrganizationName : null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(getAuthTransitionUrl(DASHBOARD_ROUTE, "Your profile is set up. Taking you to your dashboard."));
    router.refresh();
  }

  return (
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-2 px-6 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              {stepLabel}
            </div>
          </div>
          <CardTitle className="text-2xl">Finish your setup</CardTitle>
          <CardDescription>{helperText}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Choose your account type</p>
              <div className="grid gap-3">
                {ACCOUNT_CHOICES.map((choice) => {
                  const isSelected = accountType === choice.value;

                  return (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => setAccountType(choice.value)}
                      className={`flex w-full cursor-pointer flex-col gap-1 rounded-[16px] border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? "border-[var(--accent)] bg-[rgba(15,93,70,0.06)]"
                          : "border-[var(--border)] bg-[var(--surface-subtle)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="accountType"
                          value={choice.value}
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <span className="text-sm font-semibold text-foreground">{choice.title}</span>
                      </span>
                      <span className="ml-7 text-sm leading-6 text-muted-foreground">{choice.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <>
              {accountType === "personal" ? (
                <Input
                  id="display-name"
                  name="displayName"
                  type="text"
                  label="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  placeholder="How should we call you?"
                  required
                />
              ) : (
                <Input
                  id="organization-name"
                  name="organizationName"
                  type="text"
                  label={accountType === "education" ? "School or program name" : "Organization name"}
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  autoComplete="organization"
                  placeholder={accountType === "education" ? "North Star Academy" : "Acme Inc."}
                  required
                />
              )}

              <button
                type="button"
                onClick={goBackToStep1}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
              >
                ← Back to account type
              </button>
            </>
          ) : null}

          {error ? (
            <p className="text-sm leading-6 text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-6 sm:flex-row">
          {step === 1 ? (
            <Button type="submit" className="w-full sm:flex-1">
              Continue
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Finish setup"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
