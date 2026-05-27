import type { ReactNode } from "react";

import BrandMark from "../layout/BrandMark";

type AuthLoadingScreenProps = {
  title: ReactNode;
  details?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  containerClassName?: string;
  titleClassName?: string;
  detailsClassName?: string;
  logoCompact?: boolean;
};

export default function AuthLoadingScreen({
  title,
  details,
  children,
  footer,
  className = "",
  containerClassName = "max-w-md",
  titleClassName = "",
  detailsClassName = "",
  logoCompact = false,
}: AuthLoadingScreenProps) {
  return (
    <main className={`flex min-h-screen items-center justify-center bg-background px-4 text-foreground ${className}`.trim()}>
      <div className={`flex w-full flex-col items-center gap-6 ${containerClassName}`.trim()}>
        <div className="auth-fade" aria-hidden="true">
          <BrandMark className="justify-center" compact={logoCompact} />
        </div>

        <div className="w-full max-w-xs" aria-hidden="true">
          <div className="h-2 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)]">
            <div className="auth-progress h-full w-full origin-left rounded-full bg-[var(--accent)]" />
          </div>
        </div>

        <div className={`space-y-1 text-center ${detailsClassName}`.trim()}>
          <p className={`text-sm font-medium leading-6 text-foreground ${titleClassName}`.trim()}>{title}</p>
          {details ? <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{details}</div> : null}
        </div>

        {children ? <div className="w-full">{children}</div> : null}

        {footer ? <div className="text-center text-xs leading-6 text-muted-foreground">{footer}</div> : null}
      </div>
    </main>
  );
}
