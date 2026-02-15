'use client';

import { theme } from '@/config/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function Select({ label, options, value, onChange, error, disabled, className, ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: disabled ? theme.colors.text.tertiary : theme.colors.text.secondary 
        }}>
          {label}
        </label>
      )}
      <select
        className={className}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          backgroundColor: theme.colors.background.card,
          border: `1px solid ${error ? theme.colors.status.error : theme.colors.border}`,
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '14px',
          color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 150ms ease',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(disabled ? theme.colors.text.tertiary : theme.colors.text.secondary)}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
          opacity: disabled ? 0.6 : 1,
        }}
        onFocus={(e) => {
          if (!disabled && !error) {
            e.target.style.borderColor = theme.colors.accent.primary;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border;
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '12px', color: theme.colors.status.error }}>
          {error}
        </span>
      )}
    </div>
  );
}
