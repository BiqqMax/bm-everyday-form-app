import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={joinClasses(
        'rounded-[16px] border border-[var(--border)] bg-[var(--surface)] text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('flex flex-col gap-2 px-5 pt-5 sm:px-6 sm:pt-6', className)} {...props} />;
}

export function CardTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={joinClasses('text-base font-semibold tracking-tight text-foreground', className)} {...props} />;
}

export function CardDescription({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={joinClasses('text-sm leading-6 text-muted', className)} {...props} />;
}

export function CardContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('px-5 py-5 sm:px-6', className)} {...props} />;
}

export function CardFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('flex items-center gap-3 px-5 pb-5 sm:px-6 sm:pb-6', className)} {...props} />;
}

export default Card;
