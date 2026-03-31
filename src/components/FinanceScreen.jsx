import React, { useState } from 'react';
import { Plus, ArrowLeft, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { COLORS, EXPENSE_CATS, INCOME_CATS } from '../constants';
import { fmt, fmtDate } from '../helpers';
import { Screen, Input, Btn, Card } from './ui';

export function FinanceScreen({ theme, data, setData, showToast }) {
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const thisMonth = new Date().getMonth();
  const income  = data.finances.filter(f => f.type === 'income'  && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);
  const expense = data.finances.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === thisMonth).reduce((s, f) => s + f.amount, 0);

  const catData = EXPENSE_CATS.map(c => {
    const total = data.finances.filter(f => f.type === 'expense' && f.category === c.id).reduce((s, f) => s + f.amount, 0);
    return { name: c.name, value: total, color: c.color };
  }).filter(d => d.value > 0);

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const label = d.toLocaleDateString('uz-UZ', { month: 'short' });
    const inc = data.finances.filter(f => f.type === 'income' && new Date(f.date).getMonth() === m).reduce((s, f) => s + f.amount, 0);
    const exp = data.finances.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === m).reduce((s, f) => s + f.amount, 0);
    return { name: label, Kirim: inc / 1000000, Chiqim: exp / 1000000 };
  }).reverse();

  const save = (f) => {
    const list = form?.id
      ? data.finances.map(x => x.id === form.id ? f : x)
      : [...data.finances, { ...f, id: Date.now(), date: new Date().toISOString().split('T')[0] }];
    setData(d => ({ ...d, finances: list }));
    showToast(f.type === 'income' ? 'Kirim saqlandi!' : 'Chiqim saqlandi!', 'success');
    setForm(null);
  };
  const remove = (id) => setData(d => ({ ...d, finances: d.finances.filter(f => f.id !== id) }));
  const filtered = data.finances.filter(f => filterType === 'all' ? true : f.type === filterType);

  if (form !== null) return <FinanceForm theme={theme} initial={form} onSave={save} onBack={() => setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: 0 }}>💰 Moliya</h2>
          <button onClick={() => setForm({})} style={{ background: COLORS.orange, border: 'none', borderRadius: 12, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <Plus size={16}/> Qo'shish
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: `linear-gradient(135deg, ${COLORS.green}, #1a8c3e)`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ArrowUpRight size={18} color="rgba(255,255,255,0.8)"/>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Kirim</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{fmt(income)}</p>
          </div>
          <div style={{ background: `linear-gradient(135deg, ${COLORS.red}, #8c1a1a)`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ArrowDownRight size={18} color="rgba(255,255,255,0.8)"/>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Chiqim</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{fmt(expense)}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['overview', 'list'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 20, border: `1.5px solid ${tab === t ? COLORS.orange : theme.border}`, background: tab === t ? COLORS.orange : 'transparent', color: tab === t ? '#fff' : theme.text2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {t === 'overview' ? 'Grafik' : "Ro'yxat"}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div>
            {catData.length > 0 && (
              <Card theme={theme} style={{ marginBottom: 16 }}>
                <h4 style={{ color: theme.text, margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Chiqim taqsimoti</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {catData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), 'Summa']}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {catData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: d.color }}/>
                      <span style={{ fontSize: 11, color: theme.text2 }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card theme={theme}>
              <h4 style={{ color: theme.text, margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>6 oylik taqqoslama (mln so'm)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={last6}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="name" tick={{ fill: theme.text2, fontSize: 11 }}/>
                  <YAxis tick={{ fill: theme.text2, fontSize: 10 }}/>
                  <Tooltip/>
                  <Bar dataKey="Kirim"  fill={COLORS.green} radius={[4, 4, 0, 0]}/>
                  <Bar dataKey="Chiqim" fill={COLORS.red}   radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['all', 'income', 'expense'].map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${filterType === f ? COLORS.orange : theme.border}`, background: filterType === f ? `${COLORS.orange}20` : 'transparent', color: filterType === f ? COLORS.orange : theme.text2, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                  {f === 'all' ? 'Hammasi' : f === 'income' ? 'Kirim' : 'Chiqim'}
                </button>
              ))}
            </div>
            {filtered.slice().reverse().map(f => {
              const cats = f.type === 'income' ? INCOME_CATS : EXPENSE_CATS;
              const cat = cats.find(c => c.id === f.category) || cats[cats.length - 1];
              return (
                <Card key={f.id} theme={theme} style={{ marginBottom: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                        {cat.icon}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: theme.text }}>{cat.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.text2 }}>{f.note || fmtDate(f.date)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: f.type === 'income' ? COLORS.green : COLORS.red }}>
                        {f.type === 'income' ? '+' : '-'}{fmt(f.amount, f.currency)}
                      </p>
                      <button onClick={() => remove(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.red, padding: 0, marginTop: 2 }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: theme.text2, marginTop: 8 }}>Ma'lumot yo'q</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}

function FinanceForm({ theme, initial, onSave, onBack }) {
  const [type, setType] = useState(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initial?.currency || 'UZS');
  const [category, setCategory] = useState(initial?.category || 'other');
  const [note, setNote] = useState(initial?.note || '');
  const [err, setErr] = useState('');
  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontFamily: 'inherit' }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: '0 0 24px' }}>
          {initial?.id ? 'Tahrirlash' : 'Yangi yozuv'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['income', 'expense'].map(t => (
              <button key={t} onClick={() => { setType(t); setCategory('other'); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: `2px solid ${type === t ? (t === 'income' ? COLORS.green : COLORS.red) : theme.border}`, background: type === t ? (t === 'income' ? `${COLORS.green}20` : `${COLORS.red}20`) : 'transparent', color: type === t ? (t === 'income' ? COLORS.green : COLORS.red) : theme.text2, cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' }}>
                {t === 'income' ? '↑ Kirim' : '↓ Chiqim'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input theme={theme} placeholder="Summa" value={amount} onChange={setAmount} type="number"/>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['UZS', 'USD'].map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{ padding: '13px 12px', borderRadius: 12, border: `1.5px solid ${currency === c ? COLORS.orange : theme.border}`, background: currency === c ? `${COLORS.orange}20` : 'transparent', color: currency === c ? COLORS.orange : theme.text2, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: theme.text2, fontSize: 13, display: 'block', marginBottom: 8 }}>Kategoriya</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${category === c.id ? c.color : theme.border}`, background: category === c.id ? `${c.color}20` : 'transparent', color: category === c.id ? c.color : theme.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                  {c.icon}{c.name}
                </button>
              ))}
            </div>
          </div>
          <Input theme={theme} placeholder="Izoh (ixtiyoriy)" value={note} onChange={setNote} multiline/>
          {err && <p style={{ color: COLORS.red, fontSize: 13 }}>{err}</p>}
          <Btn onClick={() => { if (!amount || isNaN(+amount)) return setErr('Summani kiriting'); onSave({ ...initial, type, amount: +amount, currency, category, note }); }} color={type === 'income' ? COLORS.green : COLORS.red}>
            Saqlash
          </Btn>
        </div>
      </div>
    </Screen>
  );
}
