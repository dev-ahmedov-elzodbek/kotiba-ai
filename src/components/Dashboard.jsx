import React from 'react';
import { Bell, CheckSquare, AlertTriangle, Bot, ChevronRight, Mic, MicOff, Sparkles } from 'lucide-react';
import { COLORS } from '../constants';
import { fmt, fmtDate } from '../helpers';
import { Screen, BotAvatar, Card, Tag } from './ui';

export function Dashboard({ theme, user, data, onNav, onVoice, recording }) {
  const todayReminders = data.reminders.filter(r => {
    if (r.status === 'done') return false;
    return new Date(r.date).toDateString() === new Date().toDateString();
  });
  const pendingTasks = data.tasks.filter(t => t.status === 'pending');
  const thisMonth = new Date().getMonth();
  const income  = data.finances.filter(f => f.type === 'income'  && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
  const expense = data.finances.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
  const overspent = expense > income && income > 0;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BotAvatar size={44}/>
            <div>
              <p style={{ color: theme.text2, fontSize: 13, margin: 0 }}>Salom,</p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: 0 }}>{user.name} 👋</h2>
            </div>
          </div>
          <button onClick={() => onNav('ai-chat')} style={{
            background: `${COLORS.blue}20`, border: 'none', borderRadius: 12,
            padding: '8px 14px', color: COLORS.blue, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit',
          }}>
            <Bot size={16}/> AI Chat
          </button>
        </div>

        {/* Overspend warning */}
        {overspent && (
          <Card theme={theme} style={{ marginBottom: 16, background: `${COLORS.red}15`, borderColor: `${COLORS.red}40` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color={COLORS.red} style={{ flexShrink: 0, marginTop: 2 }}/>
              <div>
                <p style={{ fontWeight: 700, color: COLORS.red, margin: 0, fontSize: 14 }}>⚠️ Harajatlar oshib ketdi!</p>
                <p style={{ color: theme.text2, fontSize: 13, margin: '4px 0 0' }}>
                  {user.name}, bu oylik harajatlaringiz kirimingizdan oshib ketyapti. Chiqimlarni kamaytiring!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Balance Card */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red})`,
          borderRadius: 20, padding: 20, marginBottom: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.1)' }}/>
          <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.05)' }}/>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>Bu oylik balans</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '6px 0 16px' }}>
            {fmt(income - expense)}
          </h2>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>↑ Kirim</p>
              <p style={{ color: '#fff', fontWeight: 700, margin: 0 }}>{fmt(income)}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>↓ Chiqim</p>
              <p style={{ color: '#fff', fontWeight: 700, margin: 0 }}>{fmt(expense)}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Card theme={theme} onClick={() => onNav('reminders')} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color={COLORS.blue}/>
              </div>
              <span style={{ color: theme.text2, fontSize: 13 }}>Eslatmalar</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: 0 }}>{todayReminders.length}</p>
            <p style={{ color: theme.text2, fontSize: 12, margin: '2px 0 0' }}>Bugun</p>
          </Card>

          <Card theme={theme} onClick={() => onNav('tasks')} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={18} color={COLORS.green}/>
              </div>
              <span style={{ color: theme.text2, fontSize: 13 }}>Vazifalar</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: 0 }}>{pendingTasks.length}</p>
            <p style={{ color: theme.text2, fontSize: 12, margin: '2px 0 0' }}>Kutilmoqda</p>
          </Card>
        </div>

        {/* Recent reminders */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>Yaqin eslatmalar</h3>
        {data.reminders.slice(0, 3).map(r => (
          <Card key={r.id} theme={theme} style={{ marginBottom: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: theme.text }}>{r.text}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.text2 }}>
                  {fmtDate(r.date)}{r.time && ` • ${r.time}`}
                </p>
              </div>
              <Tag label={r.status === 'done' ? 'Bajarildi' : 'Faol'} color={r.status === 'done' ? COLORS.green : COLORS.orange}/>
            </div>
          </Card>
        ))}
        {data.reminders.length === 0 && (
          <Card theme={theme} style={{ textAlign: 'center', padding: 24 }}>
            <Bell size={32} color={theme.text2} style={{ opacity: 0.4 }}/>
            <p style={{ color: theme.text2, margin: '8px 0 0', fontSize: 14 }}>Eslatmalar yo'q</p>
          </Card>
        )}

        {/* AI Advice */}
        <Card theme={theme} onClick={() => onNav('ai-advice')} style={{ marginTop: 16, background: `linear-gradient(135deg, ${COLORS.blue}15, ${COLORS.purple}15)`, borderColor: `${COLORS.blue}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${COLORS.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color={COLORS.blue}/>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: theme.text, margin: 0 }}>AI Maslahatlari</p>
              <p style={{ color: theme.text2, fontSize: 12, margin: '2px 0 0' }}>Moliyaviy va kunlik maslahatlar</p>
            </div>
            <ChevronRight size={18} color={theme.text2}/>
          </div>
        </Card>
      </div>

      {/* Floating Mic */}
      <button onClick={onVoice} style={{
        position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
        width: 64, height: 64, borderRadius: 32,
        background: recording ? COLORS.red : COLORS.orange,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 20px ${recording ? COLORS.red : COLORS.orange}60`,
        animation: recording ? 'pulse 1s ease-in-out infinite' : 'none',
        transition: 'all 0.3s', zIndex: 40,
      }}>
        {recording ? <MicOff size={28} color="#fff"/> : <Mic size={28} color="#fff"/>}
      </button>
    </Screen>
  );
}
