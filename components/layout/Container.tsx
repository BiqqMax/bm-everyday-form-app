import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
});

export default Container;