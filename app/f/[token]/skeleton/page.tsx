import OwnerHeader from "../../../../components/form-public/OwnerHeader";
import FormFields from "../../../../components/form-public/FormFields";
import SubmitButton from "../../../../components/form-public/SubmitButton";

export default function PublicFormSkeletonPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#06140F] text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-4 py-8 sm:py-10">
        <OwnerHeader
          ownerName="John Doe"
          formTitle="Sample Form"
          formDescription="This is a sample form description for the skeleton."
          expiresAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
          responseLimit={100}
        />
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-xl border border-neutral-200 dark:border-[#123B2B] bg-white dark:bg-[#0A1F16] p-5 space-y-4">
            <FormFields
              fields={[
                { id: "sample-text", label: "Your Name", type: "text", required: true },
                { id: "sample-email", label: "Your Email", type: "email", required: true },
              ]}
              values={{}}
              errors={{}}
              onChange={() => {}}
            />
            <SubmitButton isSubmitting={false} />
          </div>
        </form>
      </div>
    </main>
  );
}
