import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { BotAvatar, TypeWriter } from './ui';

export function WelcomeScreen({ theme, user, reminders, tasks, isFirstTime, onDone }) {
  const [done, setDone] = useState(false);

  const fullText = isFirstTime
    ? `Assalomu aleykum, ${user.name}! Men sizning shaxsiy kotibingizman. Sizning shaxsiy harajatlaringizni hisob-kitob qilib turadigan va hayotingizdagi kerakli vazifalar va holatlarni eslatib turuvchi shaxsiy kotibingizman.`
    : `Assalomu aleykum, ${user.name}! Bugun sizda ${reminders} ta eslatma va ${tasks} ta vazifa bor.`;

  useEffect(() => {
    if (done) { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }
  }, [done, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `linear-gradient(135deg, #0F0F11 0%, #1a0a00 50%, #0F0F11 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 32,
    }}>
      <div style={{ animation: 'fadeInUp 0.6s ease' }}>
        <BotAvatar size={96}/>
      </div>
      <div style={{ marginTop: 32, textAlign: 'center', maxWidth: 320 }}>
        <p style={{ fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.6, minHeight: 120 }}>
          <TypeWriter text={fullText} speed={35} onDone={() => setDone(true)}/>
        </p>
      </div>
      {done && (
        <button onClick={onDone} style={{
          marginTop: 40, background: COLORS.orange, color: '#fff',
          border: 'none', padding: '14px 40px', borderRadius: 24,
          fontSize: 16, fontWeight: 700, cursor: 'pointer',
          animation: 'fadeIn 0.5s ease', fontFamily: 'inherit',
        }}>
          Boshlash →
        </button>
      )}
      {[COLORS.orange, COLORS.blue, COLORS.green].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: 200 + i * 50, height: 200 + i * 50,
          borderRadius: '50%', background: c, opacity: 0.04,
          top: ['-5%', '40%', '70%'][i], left: ['-10%', '60%', '-20%'][i],
          animation: `float ${3 + i}s ease-in-out infinite alternate`,
          pointerEvents: 'none',
        }}/>
      ))}
    </div>
  );
}
