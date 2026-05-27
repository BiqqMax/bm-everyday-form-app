import Image from 'next/image';
import Link from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';

type BrandMarkProps = {
  href?: string;
  className?: string;
  compact?: boolean;
  showText?: boolean;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-label'> &
  Pick<HTMLAttributes<HTMLSpanElement>, 'title'>;

function CompactBrandMark() {
  return (
    <>
      <Image src="/icon.svg" alt="" width={64} height={64} className="h-9 w-9 dark:hidden" aria-hidden="true" />
      <Image
        src="/icon-white.svg"
        alt=""
        width={64}
        height={64}
        className="hidden h-9 w-9 dark:block"
        aria-hidden="true"
      />
    </>
  );
}

function FullBrandMark() {
  return (
    <svg
      width="320"
      height="64"
      viewBox="0 0 320 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-auto text-[var(--brand-wordmark)]"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="8" y="8" width="48" height="48" rx="12" fill="#0F5D46" />

      <rect x="20" y="20" width="24" height="4" rx="2" fill="white" />
      <rect x="20" y="30" width="18" height="4" rx="2" fill="white" />
      <rect x="20" y="40" width="14" height="4" rx="2" fill="white" />

      <text
        x="72"
        y="41"
        fill="currentColor"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="28"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        Everyday Forms
      </text>
    </svg>
  );
}

export default function BrandMark({
  href = '/',
  className = '',
  compact = false,
  showText = true,
  ...props
}: BrandMarkProps) {
  const iconOnly = compact || !showText;

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      {iconOnly ? (
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <CompactBrandMark />
        </span>
      ) : (
        <FullBrandMark />
      )}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      aria-label={props['aria-label'] ?? 'Everyday Forms home'}
      className="inline-flex rounded-[var(--radius-lg)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      title={props.title}
    >
      {content}
    </Link>
  );
}
