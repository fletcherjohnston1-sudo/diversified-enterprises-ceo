'use client';

import { useEffect, useState } from 'react';

export function ThemeInitializer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme-mode') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  if (!mounted) {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = localStorage.getItem('theme-mode') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `,
        }}
      />
    );
  }

  return null;
}
