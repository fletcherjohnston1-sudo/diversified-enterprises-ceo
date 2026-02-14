'use client';

import { theme } from '@/config/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.text.secondary }}>
          {label}
        </label>
      )}
      <input
        className={className}
        style={{
          backgroundColor: theme.colors.background.card,
          border: `1px solid ${error ? theme.colors.status.error : theme.colors.border}`,
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '14px',
          color: theme.colors.text.primary,
          outline: 'none',
          transition: 'border-color 150ms ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.accent.primary;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border;
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: theme.colors.status.error }}>
          {error}
        </span>
      )}
    </div>
  );
}
