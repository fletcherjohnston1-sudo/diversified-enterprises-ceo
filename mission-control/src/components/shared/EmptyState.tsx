'use client';

import { theme } from '@/config/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ marginBottom: '16px', opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: theme.colors.text.tertiary,
            maxWidth: '300px',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
