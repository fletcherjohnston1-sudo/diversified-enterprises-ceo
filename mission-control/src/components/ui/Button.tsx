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
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'all 150ms ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? theme.colors.background.card : theme.colors.accent.primary,
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
    },
    secondary: {
      backgroundColor: theme.colors.background.tertiary,
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
      border: `1px solid ${theme.colors.border}`,
    },
    danger: {
      backgroundColor: disabled ? theme.colors.background.card : theme.colors.status.error,
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.secondary,
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
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
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
