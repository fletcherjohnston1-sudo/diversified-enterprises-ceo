'use client';

import { usePathname } from 'next/navigation';
import { theme } from '@/config/theme';
import { navigationItems } from '@/config/navigation';
import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: theme.spacing.sidebar,
        backgroundColor: theme.colors.background.secondary,
        borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      {/* Logo/Title */}
      <div
        style={{
          padding: '20px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: theme.colors.text.primary,
          }}
        >
          Mission Control
        </h1>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '12px 0',
          overflowY: 'auto',
        }}
      >
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}
