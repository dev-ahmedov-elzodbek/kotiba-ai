import React from 'react';
import { Home, Bell, DollarSign, CheckSquare, Settings } from 'lucide-react';
import { COLORS } from '../constants';

export function BottomNav({ active, onChange, theme }) {
  const items = [
    { key: 'home',      icon: <Home size={22}/>,        label: 'Bosh'    },
    { key: 'reminders', icon: <Bell size={22}/>,        label: 'Eslatma' },
    { key: 'finance',   icon: <DollarSign size={22}/>,  label: 'Moliya'  },
    { key: 'tasks',     icon: <CheckSquare size={22}/>, label: 'Vazifa'  },
    { key: 'settings',  icon: <Settings size={22}/>,    label: 'Sozlama' },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: theme.card,
      borderTop: `1px solid ${theme.border}`,
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      zIndex: 50,
      backdropFilter: 'blur(20px)',
    }}>
      {items.map(it => (
        <button key={it.key} onClick={() => onChange(it.key)} style={{
          flex: 1, padding: '10px 4px 6px',
          background: 'none', border: 'none',
          color: active === it.key ? COLORS.orange : theme.text2,
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          transition: 'color 0.2s',
          fontSize: 10,
          fontWeight: active === it.key ? 700 : 400,
          fontFamily: 'inherit',
          position: 'relative',
        }}>
          {active === it.key && (
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 24, height: 2, borderRadius: 1,
              background: COLORS.orange,
            }}/>
          )}
          {it.icon}
          {it.label}
        </button>
      ))}
    </nav>
  );
}
