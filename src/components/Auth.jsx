import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Users, Phone, Smartphone, Lock,
} from 'lucide-react';
import { COLORS } from '../constants';
import { LS } from '../helpers';
import { Screen, BotAvatar, Input, Btn } from './ui';

// ── Register ──────────────────────────────────────────────
export function RegisterScreen({ theme, onOTP, onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) return setErr('Ismingizni kiriting');
    if (!/^\+998\d{9}$/.test(phone)) return setErr('Telefon: +998901234567 formatida kiriting');
    const users = LS.get('kotiba_users', []);
    if (users.find(u => u.phone === phone)) return setErr("Bu raqam allaqachon ro'yxatdan o'tgan!");
    setErr('');
    onOTP({ name: name.trim(), phone, isNew: true });
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding: '60px 24px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <BotAvatar size={72} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: theme.text, marginTop: 16, marginBottom: 4 }}>
            Kotiba AI
          </h1>
          <p style={{ color: theme.text2, fontSize: 14 }}>Shaxsiy sun'iy intellektli kotibangiz</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>Ro'yxatdan o'tish</h2>
          <Input theme={theme} placeholder="Ismingiz" value={name} onChange={setName} icon={<Users size={18}/>} />
          <Input theme={theme} placeholder="+998901234567" value={phone} onChange={setPhone} icon={<Phone size={18}/>} type="tel" />
          {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}
          <Btn onClick={submit} color={COLORS.orange}>SMS kod yuborish →</Btn>
          <p style={{ textAlign: 'center', color: theme.text2, fontSize: 14 }}>
            Hisobingiz bormi?{' '}
            <span onClick={onLogin} style={{ color: COLORS.orange, fontWeight: 600, cursor: 'pointer' }}>
              Kirish
            </span>
          </p>
        </div>
      </div>
    </Screen>
  );
}

// ── Login ─────────────────────────────────────────────────
export function LoginForm({ theme, onOTP }) {
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!/^\+998\d{9}$/.test(phone)) return setErr('Telefon: +998901234567 formatida kiriting');
    setErr(''); onOTP({ phone, isNew: false });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input theme={theme} placeholder="+998901234567" value={phone} onChange={setPhone} icon={<Phone size={18}/>} type="tel" />
      {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}
      <Btn onClick={submit} color={COLORS.orange}>SMS kod yuborish →</Btn>
    </div>
  );
}

// ── OTP ───────────────────────────────────────────────────
export function OTPScreen({ theme, data, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const sent = '12345';
  const [err, setErr] = useState('');
  const [timer, setTimer] = useState(60);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handleInput = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val;
    setOtp(next);
    if (val && idx < 4) refs[idx + 1].current?.focus();
    if (!val && idx > 0) refs[idx - 1].current?.focus();
    if (next.every(d => d) && next.join('') === sent) {
      setErr(''); setTimeout(() => onSuccess(data), 300);
    }
  };

  const verify = () => {
    if (otp.join('') !== sent) setErr("Noto'g'ri kod! (Demo: 12345)");
    else onSuccess(data);
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding: '60px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontFamily: 'inherit' }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: `${COLORS.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Smartphone size={32} color={COLORS.orange}/>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>Kodni kiriting</h2>
          <p style={{ color: theme.text2, fontSize: 14, marginTop: 8 }}>{data.phone} ga SMS kod yuborildi</p>
          <p style={{ color: COLORS.orange, fontSize: 12, marginTop: 4 }}>Demo uchun: 12345</p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && refs[i - 1].current?.focus()}
              style={{
                width: 52, height: 56, borderRadius: 12,
                border: `2px solid ${d ? COLORS.orange : theme.border}`,
                background: theme.card2, color: theme.text,
                fontSize: 24, fontWeight: 700, textAlign: 'center',
                outline: 'none', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              maxLength={1} inputMode="numeric" />
          ))}
        </div>

        {err && <p style={{ color: COLORS.red, fontSize: 13, textAlign: 'center' }}>{err}</p>}
        <Btn onClick={verify} color={COLORS.orange}>Tasdiqlash</Btn>
        <p style={{ textAlign: 'center', color: theme.text2, fontSize: 14 }}>
          {timer > 0
            ? `Qayta yuborish: ${timer}s`
            : <span style={{ color: COLORS.orange, cursor: 'pointer' }}>Qayta yuborish</span>
          }
        </p>
      </div>
    </Screen>
  );
}

// ── PIN ───────────────────────────────────────────────────
export function PINScreen({ theme, title, onDone, confirm }) {
  const [pin, setPin] = useState([]);
  const [confirmPin, setConfirmPin] = useState([]);
  const [phase, setPhase] = useState('enter');
  const [err, setErr] = useState('');
  const current = phase === 'enter' ? pin : confirmPin;

  const handleNum = (n) => {
    if (current.length >= 4) return;
    if (phase === 'enter') {
      const next = [...pin, n];
      setPin(next);
      if (next.length === 4 && confirm) setPhase('confirm');
      else if (next.length === 4 && !confirm) onDone(next.join(''));
    } else {
      const next = [...confirmPin, n];
      setConfirmPin(next);
      if (next.length === 4) {
        if (next.join('') === pin.join('')) onDone(pin.join(''));
        else { setErr('PIN kodlar mos kelmadi!'); setPin([]); setConfirmPin([]); setPhase('enter'); }
      }
    }
  };
  const del = () => {
    if (phase === 'enter') setPin(p => p.slice(0, -1));
    else setConfirmPin(p => p.slice(0, -1));
  };

  const displayPin = phase === 'enter' ? pin : confirmPin;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '60px 24px 24px', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: `${COLORS.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={32} color={COLORS.orange}/>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>
            {phase === 'confirm' ? 'PIN ni qayta kiriting' : title}
          </h2>
          <p style={{ color: theme.text2, fontSize: 14, marginTop: 8 }}>
            {phase === 'confirm' ? 'Tasdiqlash uchun' : '4 xonali maxfiy kod'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 8,
              background: i < displayPin.length ? COLORS.orange : theme.border,
              transition: 'background 0.2s',
            }}/>
          ))}
        </div>

        {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n, i) => (
            <button key={i} onClick={() => n === '⌫' ? del() : n !== '' ? handleNum(n) : null}
              style={{
                height: 64, borderRadius: 16, border: 'none',
                background: n === '' ? 'transparent' : theme.card2,
                color: n === '⌫' ? COLORS.orange : theme.text,
                fontSize: 22, fontWeight: 600,
                cursor: n === '' ? 'default' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: n === '' ? 'none' : theme.dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                fontFamily: 'inherit',
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
