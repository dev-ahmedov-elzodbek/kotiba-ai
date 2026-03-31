import React, { useEffect } from 'react';
import { Bot } from 'lucide-react';
import { COLORS } from './constants';

// ── Screen wrapper ────────────────────────────────────────
export function Screen({ children, theme, style = {} }) {
  return (
    <div style={{
      minHeight: '100%',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Bot Avatar ────────────────────────────────────────────
export function BotAvatar({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: `0 4px 16px ${COLORS.orange}40`,
    }}>
      <Bot size={size * 0.55} color="#fff" />
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────
export function Input({ theme, placeholder, value, onChange, icon, type = 'text', multiline }) {
  const base = {
    width: '100%',
    padding: multiline ? '12px 16px' : '14px 16px 14px 44px',
    borderRadius: 12,
    border: `1.5px solid ${theme.border}`,
    background: theme.card2,
    color: theme.text,
    fontSize: 16,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
  };
  return (
    <div style={{ position: 'relative' }}>
      {icon && !multiline && (
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.text2 }}>
          {icon}
        </span>
      )}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...base, minHeight: 80 }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            type={type} style={base}
            onFocus={e => e.target.style.borderColor = COLORS.orange}
            onBlur={e => e.target.style.borderColor = theme.border} />
      }
    </div>
  );
}

// ── Button ────────────────────────────────────────────────
export function Btn({ children, onClick, color = COLORS.orange, outline, small, disabled }) {
  return (
    <button onClick={disabled ? null : onClick} style={{
      width: small ? 'auto' : '100%',
      padding: small ? '8px 16px' : '15px',
      borderRadius: 12,
      border: outline ? `2px solid ${color}` : 'none',
      background: disabled ? '#555' : outline ? 'transparent' : color,
      color: outline ? color : '#fff',
      fontSize: small ? 13 : 16,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled ? 0.6 : 1,
      fontFamily: 'inherit',
    }}>
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ theme, children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: theme.card, borderRadius: 16, padding: 16,
      border: `1px solid ${theme.border}`,
      cursor: onClick ? 'pointer' : undefined,
      transition: 'transform 0.15s, box-shadow 0.15s',
      ...style,
    }}
    onMouseDown={e => onClick && (e.currentTarget.style.transform = 'scale(0.97)')}
    onMouseUp={e => onClick && (e.currentTarget.style.transform = 'scale(1)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'scale(1)')}>
      {children}
    </div>
  );
}

// ── Tag ───────────────────────────────────────────────────
export function Tag({ label, color }) {
  return (
    <span style={{
      background: `${color}20`, color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────
export function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? COLORS.green : type === 'error' ? COLORS.red : COLORS.orange;
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 20px',
      borderRadius: 12, zIndex: 9999, fontSize: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'slideDown 0.3s ease', maxWidth: 300, textAlign: 'center',
    }}>
      {msg}
    </div>
  );
}

// ── TypeWriter ────────────────────────────────────────────
export function TypeWriter({ text, speed = 40, onDone }) {
  const [shown, setShown] = React.useState('');
  const i = React.useRef(0);
  useEffect(() => {
    i.current = 0; setShown('');
    const timer = setInterval(() => {
      setShown(text.slice(0, i.current + 1));
      i.current++;
      if (i.current >= text.length) { clearInterval(timer); onDone?.(); }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {shown}
      <span style={{ animation: 'blink 1s step-end infinite', opacity: shown.length < text.length ? 1 : 0 }}>|</span>
    </span>
  );
}
