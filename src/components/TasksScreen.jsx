import React, { useState } from 'react';
import { CheckSquare, Plus, ArrowLeft, Edit3, Trash2, Check } from 'lucide-react';
import { COLORS } from '../constants';
import { fmtDate } from '../helpers';
import { Screen, Input, Btn, Card, Tag } from './ui';

export function TasksScreen({ theme, data, setData, showToast }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('all');

  const tasks = data.tasks.filter(t => filter === 'all' ? true : t.status === filter);

  const priority = (deadline) => {
    const diff = new Date(deadline) - Date.now();
    if (diff < 86400000)     return { label: '🔴 Shoshilinch', color: COLORS.red    };
    if (diff < 86400000 * 3) return { label: "🟡 O'rta",       color: COLORS.yellow };
    return { label: '🟢 Oddiy', color: COLORS.green };
  };

  const save = (t) => {
    const list = form?.id
      ? data.tasks.map(x => x.id === form.id ? t : x)
      : [...data.tasks, { ...t, id: Date.now(), status: 'pending' }];
    setData(d => ({ ...d, tasks: list }));
    showToast('Vazifa saqlandi!', 'success');
    setForm(null);
  };
  const toggle = (id) => setData(d => ({
    ...d,
    tasks: d.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t),
  }));
  const remove = (id) => setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));

  if (form !== null) return <TaskForm theme={theme} initial={form} onSave={save} onBack={() => setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: 0 }}>✅ Vazifalar</h2>
          <button onClick={() => setForm({})} style={{ background: COLORS.green, border: 'none', borderRadius: 12, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <Plus size={16}/> Qo'shish
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['all', 'pending', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? COLORS.green : theme.border}`, background: filter === f ? COLORS.green : 'transparent', color: filter === f ? '#fff' : theme.text2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {f === 'all' ? 'Hammasi' : f === 'pending' ? 'Kutilmoqda' : 'Bajarildi'}
            </button>
          ))}
        </div>

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <CheckSquare size={48} color={theme.text2} style={{ opacity: 0.3 }}/>
            <p style={{ color: theme.text2, marginTop: 12 }}>Vazifalar yo'q</p>
          </div>
        )}

        {tasks.map(t => {
          const p = t.deadline ? priority(t.deadline) : null;
          return (
            <Card key={t.id} theme={theme} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <button onClick={() => toggle(t.id)} style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${t.status === 'done' ? COLORS.green : theme.border}`, background: t.status === 'done' ? COLORS.green : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {t.status === 'done' && <Check size={14} color="#fff"/>}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: theme.text, textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.6 : 1 }}>
                    {t.text}
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {t.deadline && <Tag label={`📅 ${fmtDate(t.deadline)}`} color={COLORS.blue}/>}
                    {p && t.status !== 'done' && <Tag label={p.label} color={p.color}/>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setForm(t)} style={{ background: `${COLORS.blue}20`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: COLORS.blue }}>
                    <Edit3 size={14}/>
                  </button>
                  <button onClick={() => remove(t.id)} style={{ background: `${COLORS.red}20`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: COLORS.red }}>
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

function TaskForm({ theme, initial, onSave, onBack }) {
  const [text, setText] = useState(initial?.text || '');
  const [deadline, setDeadline] = useState(initial?.deadline || '');
  const [err, setErr] = useState('');

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontFamily: 'inherit' }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: '0 0 24px' }}>
          {initial?.id ? 'Vazifani tahrirlash' : 'Yangi vazifa'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input theme={theme} placeholder="Vazifa tavsifi" value={text} onChange={setText} multiline/>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 6 }}>Muddat (deadline)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.card2, color: theme.text, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
          </div>
          {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}
          <Btn onClick={() => { if (!text.trim()) return setErr('Vazifa matnini kiriting'); onSave({ ...initial, text, deadline }); }} color={COLORS.green}>
            Saqlash
          </Btn>
        </div>
      </div>
    </Screen>
  );
}
