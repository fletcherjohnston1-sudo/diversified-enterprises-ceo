'use client';

import { theme } from '@/config/theme';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />
      
      {/* Modal content */}
      <div
        style={{
          position: 'relative',
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.text.primary }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              padding: '4px',
              fontSize: '20px',
            }}
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 20px',
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
