import React, { useState } from 'react';
import { Bell, Plus, ArrowLeft, Edit3, Trash2, Check } from 'lucide-react';
import { COLORS, REPEAT_OPTIONS, NOTIF_OPTIONS } from '../constants';
import { fmtDate } from '../helpers';
import { Screen, Input, Btn, Card, Tag } from './ui';

function scheduleNotification(r) {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(perm => {
    if (perm !== 'granted') return;
    const target = new Date(`${r.date}T${r.time || '09:00'}`);
    const delay = target.getTime() - Date.now();
    if (delay > 0 && delay < 86400000 * 7) {
      setTimeout(() => new Notification('⏰ Kotiba AI Eslatmasi', { body: r.text }), delay);
    }
  });
}

export function RemindersScreen({ theme, data, setData, showToast }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('all');

  const reminders = data.reminders.filter(r =>
    filter === 'all' ? true : filter === 'active' ? r.status !== 'done' : r.status === 'done'
  );

  const save = (r) => {
    const list = form?.id
      ? data.reminders.map(x => x.id === form.id ? r : x)
      : [...data.reminders, { ...r, id: Date.now(), status: 'active' }];
    setData(d => ({ ...d, reminders: list }));
    showToast('Eslatma saqlandi!', 'success');
    setForm(null);
    scheduleNotification(r);
  };
  const remove = (id) => setData(d => ({ ...d, reminders: d.reminders.filter(r => r.id !== id) }));
  const toggle = (id) => setData(d => ({
    ...d,
    reminders: d.reminders.map(r => r.id === id ? { ...r, status: r.status === 'done' ? 'active' : 'done' } : r),
  }));

  if (form !== null) return <ReminderForm theme={theme} initial={form} onSave={save} onBack={() => setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: 0 }}>🔔 Eslatmalar</h2>
          <button onClick={() => setForm({})} style={{ background: COLORS.orange, border: 'none', borderRadius: 12, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <Plus size={16}/> Qo'shish
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['all', 'active', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? COLORS.orange : theme.border}`, background: filter === f ? COLORS.orange : 'transparent', color: filter === f ? '#fff' : theme.text2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {f === 'all' ? 'Hammasi' : f === 'active' ? 'Faol' : 'Bajarildi'}
            </button>
          ))}
        </div>

        {reminders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Bell size={48} color={theme.text2} style={{ opacity: 0.3 }}/>
            <p style={{ color: theme.text2, marginTop: 12 }}>Eslatmalar yo'q</p>
          </div>
        )}

        {reminders.map(r => {
          const urgent = new Date(r.date).getTime() - Date.now() < 86400000;
          return (
            <Card key={r.id} theme={theme} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <button onClick={() => toggle(r.id)} style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${r.status === 'done' ? COLORS.green : theme.border}`, background: r.status === 'done' ? COLORS.green : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {r.status === 'done' && <Check size={14} color="#fff"/>}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: theme.text, textDecoration: r.status === 'done' ? 'line-through' : 'none', opacity: r.status === 'done' ? 0.6 : 1 }}>
                    {r.text}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <Tag label={`📅 ${fmtDate(r.date)}`} color={COLORS.blue}/>
                    {r.time && <Tag label={`⏰ ${r.time}`} color={COLORS.orange}/>}
                    {urgent && r.status !== 'done' && <Tag label="🔴 Yaqin" color={COLORS.red}/>}
                    {r.repeat && <Tag label={`🔄 ${r.repeat}`} color={COLORS.purple}/>}
                    {r.notif && <Tag label={r.notif} color={COLORS.green}/>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setForm(r)} style={{ background: `${COLORS.blue}20`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: COLORS.blue }}>
                    <Edit3 size={14}/>
                  </button>
                  <button onClick={() => remove(r.id)} style={{ background: `${COLORS.red}20`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: COLORS.red }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

function ReminderForm({ theme, initial, onSave, onBack }) {
  const [text, setText] = useState(initial?.text || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initial?.time || '09:00');
  const [repeat, setRepeat] = useState(initial?.repeat || REPEAT_OPTIONS[0]);
  const [notif, setNotif] = useState(initial?.notif || NOTIF_OPTIONS[0]);
  const [err, setErr] = useState('');

  const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.card2, color: theme.text, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontFamily: 'inherit' }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: '0 0 24px' }}>
          {initial?.id ? 'Eslatmani tahrirlash' : 'Yangi eslatma'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input theme={theme} placeholder="Eslatma matni" value={text} onChange={setText} multiline/>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 6 }}>Sana</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 6 }}>Vaqt</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 8 }}>Takrorlash</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {REPEAT_OPTIONS.map(o => (
                <button key={o} onClick={() => setRepeat(o)} style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${repeat === o ? COLORS.orange : theme.border}`, background: repeat === o ? `${COLORS.orange}20` : 'transparent', color: repeat === o ? COLORS.orange : theme.text2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 8 }}>Bildirishnoma turi</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {NOTIF_OPTIONS.map(o => (
                <button key={o} onClick={() => setNotif(o)} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1.5px solid ${notif === o ? COLORS.blue : theme.border}`, background: notif === o ? `${COLORS.blue}20` : 'transparent', color: notif === o ? COLORS.blue : theme.text2, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}
          <Btn onClick={() => { if (!text.trim()) return setErr('Eslatma matnini kiriting'); onSave({ ...initial, text, date, time, repeat, notif }); }} color={COLORS.orange}>
            Saqlash
          </Btn>
        </div>
      </div>
    </Screen>
  );
}
