'use client';

import { theme } from '@/config/theme';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        transition: 'all 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </div>
  );
}
