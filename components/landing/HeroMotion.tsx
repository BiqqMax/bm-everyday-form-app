'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type HeroMotionProps = {
  children: ReactNode;
  className?: string;
};

type GlowStyle = CSSProperties & {
  '--hero-glow-x': string;
  '--hero-glow-y': string;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HeroMotion({ children, className = '' }: HeroMotionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<SVGSVGElement | null>(null);
  const targetRef = useRef({ x: 50, y: 35 });
  const currentRef = useRef({ x: 50, y: 35 });
  const frameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  function animate() {
    const current = currentRef.current;
    const target = targetRef.current;

    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;

    if (glowRef.current) {
      glowRef.current.style.setProperty('--hero-glow-x', `${current.x}%`);
      glowRef.current.style.setProperty('--hero-glow-y', `${current.y}%`);
    }

    const settled = Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05;

    if (settled) {
      current.x = target.x;
      current.y = target.y;

      if (glowRef.current) {
        glowRef.current.style.setProperty('--hero-glow-x', `${target.x}%`);
        glowRef.current.style.setProperty('--hero-glow-y', `${target.y}%`);
      }

      frameRef.current = null;
      return;
    }

    frameRef.current = window.requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(animate);
    }
  }

  function updateTarget(clientX: number, clientY: number) {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();

    targetRef.current = {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    };

    startAnimation();
  }

  const glowStyle: GlowStyle = {
    '--hero-glow-x': '50%',
    '--hero-glow-y': '35%',
  };

  return (
    <div
      ref={wrapperRef}
      className={joinClasses('relative', className)}
      onPointerMove={(event) => updateTarget(event.clientX, event.clientY)}
      onPointerEnter={(event) => updateTarget(event.clientX, event.clientY)}
      onPointerLeave={() => {
        targetRef.current = { x: 50, y: 35 };
        startAnimation();
      }}
    >
      <svg
        ref={glowRef}
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute left-[var(--hero-glow-x)] top-[var(--hero-glow-y)] z-0 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 overflow-visible opacity-60 motion-safe:animate-[hero-highlight-drift_7s_ease-in-out_infinite] motion-reduce:animate-none"
        style={glowStyle}
      >
        <defs>
          <radialGradient id="hero-glow-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(15, 93, 70, 0.22)" />
            <stop offset="36%" stopColor="rgba(15, 93, 70, 0.14)" />
            <stop offset="60%" stopColor="rgba(15, 93, 70, 0.06)" />
            <stop offset="100%" stopColor="rgba(15, 93, 70, 0)" />
          </radialGradient>
          <filter id="hero-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r="72" fill="url(#hero-glow-gradient)" filter="url(#hero-glow-filter)" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(15, 93, 70, 0.04)" strokeWidth="1" />
      </svg>

      {children}
    </div>
  );
}
