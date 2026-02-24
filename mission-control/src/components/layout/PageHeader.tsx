'use client';

import { theme } from '@/config/theme';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  showTimestamp?: boolean;
}

export function PageHeader({ title, actions, showTimestamp = true }: PageHeaderProps) {
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: '#FF69B4',
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: theme.colors.text.primary,
        }}
      >
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showTimestamp && (
          <span
            style={{
              fontSize: '12px',
              color: theme.colors.text.secondary,
            }}
          >
            Updated: {timestamp}
          </span>
        )}
        {actions && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
