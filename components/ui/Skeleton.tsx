'use client';

import type { ElementType, PropsWithChildren } from 'react';

type SkeletonProps = PropsWithChildren<{
  className?: string;
  as?: ElementType;
}>;

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Skeleton({ className = '', as: Element = 'div', children }: SkeletonProps) {
  return (
    <Element className={joinClasses('animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]', className)}>
      {children}
    </Element>
  );
}