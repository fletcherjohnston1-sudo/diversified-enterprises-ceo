'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/config/navigation';
import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme-mode') || 'dark') as 'dark' | 'light';
    setTheme(saved);
    
    const handler = (e: StorageEvent) => {
      if (e.key === 'theme-mode') {
        setTheme((e.newValue as 'dark' | 'light') || 'dark');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme-mode', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const colors = {
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
      card: 'var(--bg-card)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
    },
    accent: {
      primary: 'var(--accent-primary)',
      secondary: 'var(--accent-secondary)',
    },
    border: 'var(--border-color)',
  };

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
          backgroundColor: colors.background.tertiary,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          color: colors.text.primary,
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
          width: '200px',
          backgroundColor: colors.background.secondary,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'transform 150ms ease, background-color 0.3s ease',
        }}
      >
        {/* Logo/Title */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${colors.border}`,
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
              color: colors.text.primary,
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
              color: colors.text.secondary,
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0',
            }}
          >
            ×
          </button>
        </div>

        {/* Theme Toggle */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: colors.background.tertiary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              color: colors.text.primary,
              cursor: 'pointer',
              fontSize: '14px',
              justifyContent: 'center',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
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
              colors={colors}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
