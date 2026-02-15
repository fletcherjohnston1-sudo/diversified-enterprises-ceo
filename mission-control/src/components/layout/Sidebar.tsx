'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { theme } from '@/config/theme';
import { navigationItems } from '@/config/navigation';
import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mobile-menu-btn"
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          backgroundColor: theme.colors.background.tertiary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          color: theme.colors.text.primary,
          cursor: 'pointer',
          fontSize: '20px',
        }}
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          onClick={() => setIsCollapsed(false)}
          className="mobile-overlay"
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 35,
          }}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'open' : ''}`}
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
          transition: 'transform 150ms ease',
        }}
      >
        {/* Logo/Title */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
          <button
            onClick={() => setIsCollapsed(false)}
            className="close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0',
            }}
          >
            ×
          </button>
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
    </>
  );
}
