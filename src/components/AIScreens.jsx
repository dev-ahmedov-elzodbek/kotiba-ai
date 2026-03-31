import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, ChevronDown, AlertTriangle } from 'lucide-react';
import { COLORS } from '../constants';
import { Screen, BotAvatar, Card } from './ui';

// ── AI Chat ───────────────────────────────────────────────
export function AIChatScreen({ theme, user, data, setData, showToast }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Assalomu aleykum, ${user.name}! Men Kotiba AI - sizning shaxsiy yordamchingizman. Ovoz yoki matn orqali eslatma, kirim-chiqim va vazifalar haqida gaplashishimiz mumkin.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    const thisMonth = new Date().getMonth();
    const income  = data.finances.filter(f => f.type === 'income'  && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
    const expense = data.finances.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);

    const context = `Foydalanuvchi: ${user.name}\nBugungi sana: ${new Date().toLocaleDateString('uz-UZ')}\nEslatmalar soni: ${data.reminders.length}\nBajarilmagan vazifalar: ${data.tasks.filter(t => t.status === 'pending').length}\nBu oylik kirim: ${income} so'm\nBu oylik chiqim: ${expense} so'm`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `Sen "Kotiba AI" - o'zbek tilida ishlaydigan shaxsiy sun'iy intellektli kotibasan.\n${context}\n\nFAQAT o'zbek tilida javob ber. Faqat eslatmalar, kirim-chiqim, vazifalar va moliyaviy maslahatlar haqida gaplash. Boshqa mavzularda: "Kechirasiz, men faqat moliyaviy va kundalik vazifalar bo'yicha yordam bera olaman". Qisqa va aniq javob ber.`,
          messages: [...messages.map(m => ({ role: m.role, content: m.text })), { role: 'user', content: text }],
        }),
      });
      const d = await res.json();
      const reply = d.content?.map(c => c.text || '').join('') || 'Javob olishda xato yuz berdi.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.' }]);
    }
    setLoading(false);
  };

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      showToast('Ovoz yozildi (demo rejim)', 'success');
      send('Bugun soat 10 da doktorga borish kerak deb eslatma qo\'y');
    } else {
      setRecording(true);
      showToast('Ovoz yozilmoqda... (bosish to\'xtatish uchun)', 'success');
    }
  };

  return (
    <Screen theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '52px 16px 12px', background: theme.card, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <BotAvatar size={40}/>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>Kotiba AI</h3>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.green }}>● Online</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              {m.role === 'assistant' && <BotAvatar size={32}/>}
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: 16, background: m.role === 'user' ? COLORS.orange : theme.card2, color: m.role === 'user' ? '#fff' : theme.text, borderBottomRightRadius: m.role === 'user' ? 4 : 16, borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16, fontSize: 15, lineHeight: 1.5 }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <BotAvatar size={32}/>
              <div style={{ padding: '12px 16px', borderRadius: 16, background: theme.card2 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: theme.text2, animation: `bounce 1s ${i * 0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={{ padding: '12px 16px', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', background: theme.card, borderTop: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <button onClick={toggleRecording} style={{ width: 44, height: 44, borderRadius: 22, border: 'none', background: recording ? COLORS.red : `${COLORS.orange}20`, color: recording ? '#fff' : COLORS.orange, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: recording ? 'pulse 1s infinite' : 'none' }}>
              {recording ? <MicOff size={20}/> : <Mic size={20}/>}
            </button>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
              placeholder="Xabar yozing..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 22, border: `1.5px solid ${theme.border}`, background: theme.card2, color: theme.text, fontSize: 15, outline: 'none', resize: 'none', fontFamily: 'inherit', maxHeight: 120, boxSizing: 'border-box', lineHeight: 1.4 }}
              rows={1}/>
            <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ width: 44, height: 44, borderRadius: 22, border: 'none', background: input.trim() && !loading ? COLORS.orange : theme.card2, color: input.trim() && !loading ? '#fff' : theme.text2, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20}/>
            </button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ── AI Advice ─────────────────────────────────────────────
export function AIAdviceScreen({ theme, data, user }) {
  const [active, setActive] = useState(null);
  const [advice, setAdvice] = useState({});
  const [loading, setLoading] = useState({});

  const thisMonth = new Date().getMonth();
  const income  = data.finances.filter(f => f.type === 'income'  && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
  const expense = data.finances.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
  const pending = data.tasks.filter(t => t.status === 'pending').length;

  const sections = [
    { key: 'finance',   icon: '💰', label: 'Moliyaviy maslahat',  color: COLORS.orange, prompt: `Foydalanuvchi ${user.name}. Bu oydagi kirim: ${income} so'm, chiqim: ${expense} so'm. Moliyaviy maslahat ber. ${expense > income ? 'Harajatlar oshib ketgan, bu haqda ogohlantir!' : ''}` },
    { key: 'reminders', icon: '🔔', label: "Eslatmalar bo'yicha", color: COLORS.blue,   prompt: `Foydalanuvchi ${user.name}da ${data.reminders.length} ta eslatma bor. Qanday samarali eslatmalar o'rnatish haqida maslahat ber.` },
    { key: 'tasks',     icon: '✅', label: "Vazifalar bo'yicha",  color: COLORS.green,  prompt: `Foydalanuvchi ${user.name}da ${pending} ta bajarilmagan vazifa bor. Vazifalarni qanday samarali bajarish haqida maslahat ber.` },
    { key: 'summary',   icon: '📊', label: 'Umumiy tahlil',       color: COLORS.purple, prompt: `Foydalanuvchi ${user.name} uchun umumiy hayot va moliya tahlili yasa. Kirim: ${income}, Chiqim: ${expense}, Eslatmalar: ${data.reminders.length}, Vazifalar: ${pending}` },
  ];

  const getAdvice = async (section) => {
    if (advice[section.key]) { setActive(section.key); return; }
    setLoading(l => ({ ...l, [section.key]: true })); setActive(section.key);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: "Sen o'zbek tilida ishlaydi shaxsiy moliyaviy va hayotiy maslahatchi. Qisqa, aniq va foydali maslahat ber. Markdown ishlatma.",
          messages: [{ role: 'user', content: section.prompt }],
        }),
      });
      const d = await res.json();
      const text = d.content?.map(c => c.text || '').join('') || 'Maslahat olishda xato.';
      setAdvice(a => ({ ...a, [section.key]: text }));
    } catch {
      setAdvice(a => ({ ...a, [section.key]: 'Xatolik yuz berdi.' }));
    }
    setLoading(l => ({ ...l, [section.key]: false }));
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${COLORS.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color={COLORS.orange}/>
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: 0 }}>AI Maslahatlari</h2>
            <p style={{ color: theme.text2, fontSize: 13, margin: 0 }}>Sizning shaxsiy yordamchingiz</p>
          </div>
        </div>

        {expense > income && income > 0 && (
          <Card theme={theme} style={{ marginBottom: 16, background: `${COLORS.red}15`, borderColor: `${COLORS.red}40` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <AlertTriangle size={22} color={COLORS.red}/>
              <p style={{ margin: 0, fontSize: 14, color: theme.text }}>
                <strong style={{ color: COLORS.red }}>{user.name}</strong>, bu oylik harajatlaringiz oshib ketyapti!
              </p>
            </div>
          </Card>
        )}

        {sections.map(s => (
          <div key={s.key}>
            <Card theme={theme} onClick={() => getAdvice(s)} style={{ marginBottom: 12, borderColor: active === s.key ? s.color : theme.border }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: theme.text }}>{s.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.text2 }}>
                    {loading[s.key] ? 'Yuklanmoqda...' : advice[s.key] ? 'Maslahat mavjud' : 'Bosing va maslahat oling'}
                  </p>
                </div>
                <ChevronDown size={18} color={theme.text2} style={{ transform: active === s.key ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}/>
              </div>
            </Card>
            {active === s.key && (
              <Card theme={theme} style={{ marginBottom: 16, marginTop: -8, borderRadius: '0 0 16px 16px', background: `${s.color}10`, borderColor: `${s.color}30`, borderTop: 'none' }}>
                {loading[s.key] ? (
                  <div style={{ display: 'flex', gap: 6, padding: 8 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: theme.text2, animation: `bounce 1s ${i * 0.2}s infinite` }}/>)}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {advice[s.key]}
                  </p>
                )}
              </Card>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}
