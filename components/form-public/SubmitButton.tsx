"use client";

type SubmitButtonProps = {
  isSubmitting: boolean;
  isDisabled?: boolean;
};

export default function SubmitButton({
  isSubmitting,
  isDisabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || isDisabled}
      className="w-full mt-4 bg-[#19C37D] hover:bg-[#15a86b] text-white font-medium py-2.5 rounded-md transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? "Submitting..." : "Submit Response"}
    </button>
  );
}
