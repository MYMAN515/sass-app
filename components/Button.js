import React from 'react';
import { motion } from 'framer-motion';

function cn(...a) {
  return a.filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  as = 'button', // 'button' | 'a'
  fullWidthOnMobile = true, // w-full على الموبايل تلقائيًا
  ...props
}) {
  const Comp = as === 'a' ? motion.a : motion.button;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold select-none ' +
    'transition-all duration-150 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 ' +
    'dark:focus-visible:ring-offset-zinc-900 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed ' +
    (fullWidthOnMobile ? 'w-full sm:w-auto ' : '');

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  // ألوان وهوية الشركة (indigo → fuchsia → pink)
  const styles = {
    primary:
      'text-white shadow-[0_10px_30px_rgba(147,51,234,0.35)] ' +
      'bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 ' +
      'hover:brightness-105 active:brightness-95',
    secondary:
      'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 ' +
      'hover:opacity-[.95] shadow-sm',
    outline:
      'bg-white/60 dark:bg-zinc-900/40 border border-zinc-300 dark:border-zinc-700 ' +
      'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 backdrop-blur',
    ghost:
      'text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10',
  };

  const motionProps =
    !disabled && !loading
      ? { whileTap: { scale: 0.97 }, whileHover: { scale: 1.02 } }
      : {};

  return (
    <Comp
      {...motionProps}
      className={cn(base, sizes[size], styles[variant], className)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {/* Left icon */}
      {leftIcon && !loading && <span className="shrink-0">{leftIcon}</span>}

      {/* Label / Loading */}
      <span className="relative flex items-center">
        <span className={cn(loading && 'opacity-0')}>{children}</span>
        {loading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -m-1 flex items-center justify-center"
          >
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                d="M4 12a8 8 0 0 1 8-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </span>

      {/* Right icon */}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </Comp>
  );
}
