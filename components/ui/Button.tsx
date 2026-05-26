import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]',
  secondary:
    'border border-[var(--border)] bg-[var(--surface)] text-foreground hover:bg-[var(--surface-muted)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 rounded-[10px] px-3 text-sm',
  md: 'h-11 rounded-[10px] px-4 text-sm',
  lg: 'h-11 rounded-[10px] px-5 text-base',
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className = '', ...rest } = props;

  const sharedClasses = joinClasses(
    'inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(15,93,70,0.14)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if ('href' in props && props.href) {
    const linkProps = rest as Omit<ButtonAsLink, keyof BaseProps | 'href'>;

    return (
      <Link href={props.href} className={sharedClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ButtonAsButton, keyof BaseProps | 'href'>;

  return (
    <button className={sharedClasses} {...buttonProps}>
      {children}
    </button>
  );
}
