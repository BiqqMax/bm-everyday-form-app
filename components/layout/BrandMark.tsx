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
  return <Image src="/logo.svg" alt="" width={320} height={64} className="h-10 w-auto" aria-hidden="true" />;
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
