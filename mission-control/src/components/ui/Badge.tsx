'use client';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export function Badge({ children, color = '#8B5CF6' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {children}
    </span>
  );
}
