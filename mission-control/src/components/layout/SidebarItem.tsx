'use client';

import Link from 'next/link';
import { navigationItems } from '@/config/navigation';
import * as Icons from 'lucide-react';

interface SidebarItemProps {
  item: typeof navigationItems[0];
  isActive: boolean;
  colors: any;
}

export function SidebarItem({ item, isActive, colors }: SidebarItemProps) {
  const IconComponent = (Icons as any)[item.icon] || Icons.Circle;

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: colors.text.secondary,
    textDecoration: 'none',
    transition: 'all 150ms ease',
    cursor: item.enabled ? 'pointer' : 'not-allowed',
    opacity: item.enabled ? 1 : 0.5,
    borderLeft: isActive ? `3px solid ${colors.accent.primary}` : '3px solid transparent',
    backgroundColor: isActive ? `${colors.accent.primary}20` : 'transparent',
  };

  if (!item.enabled) {
    return (
      <div style={baseStyle}>
        <IconComponent size={20} />
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
      </div>
    );
  }

  // External links open in new tab
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" style={baseStyle}>
        <IconComponent size={20} />
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
      </a>
    );
  }

  return (
    <Link href={item.href} style={baseStyle}>
      <IconComponent size={20} />
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
    </Link>
  );
}
