'use client';

import { theme } from '@/config/theme';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'all 150ms ease',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.accent.primary,
      color: theme.colors.text.primary,
    },
    secondary: {
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border}`,
    },
    danger: {
      backgroundColor: theme.colors.status.error,
      color: theme.colors.text.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
    },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' },
  };

  const hoverStyles = {
    primary: { backgroundColor: theme.colors.accent.secondary },
    secondary: { backgroundColor: theme.colors.background.card },
    danger: { opacity: '0.9' },
    ghost: { backgroundColor: theme.colors.background.tertiary },
  };

  return (
    <button
      className={cn(className)}
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyles[variant]);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, variants[variant]);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
