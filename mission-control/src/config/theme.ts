export type ThemeMode = 'dark' | 'light';

export const themeColors = {
  dark: {
    background: {
      primary: '#0a0a0a',
      secondary: '#141414',
      tertiary: '#1f1f1f',
      card: '#262626',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      tertiary: '#6b7280',
    },
    accent: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
    },
    border: '#2a2a2a',
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    priority: {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    }
  },
  light: {
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      card: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af',
    },
    accent: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
    },
    border: '#e5e7eb',
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    priority: {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    }
  }
};

export const theme = {
  colors: themeColors.dark,
  spacing: {
    sidebar: '200px',
    padding: '24px',
    gap: '16px',
  }
};

export function getTheme(mode: ThemeMode) {
  return {
    colors: themeColors[mode],
    spacing: theme.spacing
  };
}
