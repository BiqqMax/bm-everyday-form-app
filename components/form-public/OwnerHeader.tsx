import { getInitials } from "../../lib/utils/avatar";

type OwnerHeaderProps = {
  ownerName: string;
  ownerAvatarUrl?: string | null;
  formTitle: string;
  formDescription?: string | null;
  expiresAt?: string | null;
  responseLimit?: number | null;
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function OwnerHeader({
  ownerName,
  ownerAvatarUrl,
  formTitle,
  formDescription,
  expiresAt,
  responseLimit,
}: OwnerHeaderProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-[#123B2B] bg-white dark:bg-[#0A1F16] p-5 mb-6">
      <div className="flex flex-row items-start gap-4 sm:gap-5">
        {/* Avatar / Initials */}
        {ownerAvatarUrl ? (
          <img
            src={ownerAvatarUrl}
            alt={ownerName}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#123B2B] text-white flex items-center justify-center shrink-0 text-lg sm:text-xl font-semibold">
            {getInitials(ownerName)}
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col items-start text-left min-w-0">
          <h1 className="text-lg font-semibold text-black dark:text-white">
            {ownerName}
          </h1>

          <h2 className="text-xl font-bold mt-1 text-black dark:text-white">
            {formTitle}
          </h2>

          {formDescription && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
              {formDescription}
            </p>
          )}
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-[#123B2B]">
        <span>{expiresAt ? `Expires: ${formatDate(expiresAt)}` : "No expiry"}</span>

        <span>
          {typeof responseLimit === "number" && responseLimit > 0
            ? `${responseLimit} responses`
            : "Unlimited responses"}
        </span>
      </div>
    </div>
  );
}
