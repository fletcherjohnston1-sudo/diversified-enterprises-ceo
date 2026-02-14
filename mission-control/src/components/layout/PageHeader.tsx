'use client';

import { theme } from '@/config/theme';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
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
      {actions && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
