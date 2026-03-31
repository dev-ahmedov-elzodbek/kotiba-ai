import React, { useState } from 'react';
import { Moon, Sun, Lock, Bell, LogOut, ChevronRight } from 'lucide-react';
import { COLORS } from '../constants';
import { LS } from '../helpers';
import { Screen, BotAvatar, Card } from './ui';
import { PINScreen } from './Auth';

export function SettingsScreen({ theme, user, onLogout }) {
  const [showPin, setShowPin] = useState(false);

  if (showPin) return (
    <PINScreen theme={theme} title="Yangi PIN kod" confirm onDone={(p) => {
      LS.set('kotiba_pin_' + user.phone, p);
      setShowPin(false);
    }}/>
  );

  return (
    <Screen theme={theme}>
      <div style={{ padding: '52px 16px 100px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: '0 0 24px' }}>⚙️ Sozlamalar</h2>

        <Card theme={theme} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BotAvatar size={52}/>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: theme.text }}>{user.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 14, color: theme.text2 }}>{user.phone}</p>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Dark mode toggle */}
          <Card theme={theme}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme.dark ? <Moon size={18} color={COLORS.purple}/> : <Sun size={18} color={COLORS.yellow}/>}
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: theme.text }}>
                  {theme.dark ? 'Tungi rejim' : 'Kunduzgi rejim'}
                </p>
              </div>
              <button onClick={theme.toggle} style={{ width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', background: theme.dark ? COLORS.purple : theme.border, transition: 'background 0.3s' }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', position: 'absolute', top: 3, left: theme.dark ? 25 : 3, transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}/>
              </button>
            </div>
          </Card>

          {/* PIN change */}
          <Card theme={theme} onClick={() => setShowPin(true)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} color={COLORS.orange}/>
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: theme.text }}>PIN kodni o'zgartirish</p>
              </div>
              <ChevronRight size={18} color={theme.text2}/>
            </div>
          </Card>

          {/* Notifications */}
          <Card theme={theme}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} color={COLORS.blue}/>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: theme.text }}>Bildirishnomalar</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.text2 }}>Ruxsat berish</p>
                </div>
              </div>
              <button onClick={() => Notification.requestPermission().then(p => alert(p === 'granted' ? 'Ruxsat berildi!' : 'Rad etildi'))}
                style={{ background: `${COLORS.blue}20`, border: 'none', borderRadius: 8, padding: '8px 14px', color: COLORS.blue, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Ruxsat
              </button>
            </div>
          </Card>

          {/* Logout */}
          <Card theme={theme} onClick={onLogout} style={{ cursor: 'pointer', borderColor: `${COLORS.red}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.red}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={18} color={COLORS.red}/>
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: COLORS.red }}>Chiqish</p>
            </div>
          </Card>
        </div>

        <p style={{ color: theme.text2, fontSize: 12, textAlign: 'center', marginTop: 32 }}>
          Kotiba AI v1.0.0 • Barcha huquqlar himoyalangan
        </p>
      </div>
    </Screen>
  );
}
