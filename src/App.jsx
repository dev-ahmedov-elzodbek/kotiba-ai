import { useState, useEffect, useRef } from "react";
import {
  Bell, DollarSign, CheckSquare, Mic, MicOff,
  Plus, Settings, Moon, Sun, ArrowLeft, LogOut, Send,
  TrendingUp, Users, Phone, Lock, ChevronRight,
  Trash2, Edit3, Check, BarChart2,
  Home, Smartphone, RefreshCw,
  Wallet, Star, Coffee, ShoppingCart,
  Car, Heart, Book, Wifi, Gift, Package, ChevronDown,
  CheckCircle, AlertTriangle,
  Bot, Sparkles, ArrowUpRight, ArrowDownRight, BookOpen, HelpCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, CartesianGrid
} from "recharts";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const C = {
  orange:  "#FF9F0A",
  green:   "#30D158",
  blue:    "#0A84FF",
  red:     "#FF453A",
  yellow:  "#FFD60A",
  purple:  "#BF5AF2",
  bgDark:  "#0F0F11",
  cardDark:"#1C1C1E",
  card2Dark:"#2C2C2E",
  borderDark:"#3A3A3C",
  bgLight: "#F2F2F7",
  cardLight:"#FFFFFF",
  card2Light:"#F2F2F7",
  borderLight:"#D1D1D6",
  textPrimary:"#FFFFFF",
  textSecondary:"#8E8E93",
};

const EXPENSE_CATS = [
  { id:"food",    name:"Oziq-ovqat",   icon:<ShoppingCart size={15}/>, color:C.orange },
  { id:"trans",   name:"Transport",    icon:<Car size={15}/>,          color:C.blue   },
  { id:"utility", name:"Kommunal",     icon:<Wifi size={15}/>,         color:C.yellow },
  { id:"clothes", name:"Kiyim",        icon:<Package size={15}/>,      color:C.purple },
  { id:"health",  name:"Sog'liq",      icon:<Heart size={15}/>,        color:C.red    },
  { id:"edu",     name:"Ta'lim",       icon:<Book size={15}/>,         color:C.green  },
  { id:"fun",     name:"Ko'ngilochar", icon:<Coffee size={15}/>,       color:C.purple },
  { id:"other",   name:"Boshqa",       icon:<Package size={15}/>,      color:C.textSecondary },
];
const INCOME_CATS = [
  { id:"salary", name:"Oylik maosh",    icon:<Wallet size={15}/>,    color:C.green  },
  { id:"biz",    name:"Biznes",         icon:<TrendingUp size={15}/>, color:C.blue   },
  { id:"debt",   name:"Qarz qaytarish", icon:<RefreshCw size={15}/>, color:C.orange },
  { id:"bonus",  name:"Bonus/Sovg'a",   icon:<Gift size={15}/>,      color:C.yellow },
  { id:"other",  name:"Boshqa",         icon:<Package size={15}/>,   color:C.textSecondary },
];
const REPEAT_OPTIONS = ["1 marta","Har kuni","Har hafta","Har oy"];
const NOTIF_OPTIONS  = ["Push","SMS","Push + SMS"];

// ═══════════════════════════════════════════════════
// PER-USER STORAGE
// Key format:  kotiba_{phone}_{dataType}
// Global keys: kotiba_users, kotiba_current_user
// ═══════════════════════════════════════════════════
const LS = {
  get: (k, def=null) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Returns storage key scoped to a specific user phone
const uKey = (phone, type) => `kotiba_${phone}_${type}`;

function loadUserData(phone) {
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = new Date().getMonth();
  return {
    reminders: LS.get(uKey(phone,"reminders"), []),
    finances:  LS.get(uKey(phone,"finances"),  [
      { id:1, type:"income",  amount:7000000, currency:"UZS", category:"salary", note:"Oylik maosh",  date: today.slice(0,7)+"-01" },
      { id:2, type:"expense", amount:1200000, currency:"UZS", category:"food",   note:"Bozor",        date: today.slice(0,7)+"-05" },
      { id:3, type:"expense", amount:800000,  currency:"UZS", category:"trans",  note:"Yonilg'i",     date: today.slice(0,7)+"-10" },
      { id:4, type:"expense", amount:500000,  currency:"UZS", category:"utility",note:"Kommunal",     date: today.slice(0,7)+"-12" },
    ]),
    tasks: LS.get(uKey(phone,"tasks"), [
      { id:1, text:"Hisobotni tayyorlash", deadline: today, status:"pending" },
      { id:2, text:"Dori olish",           deadline: today, status:"pending" },
    ]),
  };
}

// ═══════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════
function useTheme() {
  const [dark, setDark] = useState(() => LS.get("kotiba_dark", true));
  const toggle = () => setDark(d => { LS.set("kotiba_dark", !d); return !d; });
  return {
    dark, toggle,
    bg:     dark ? C.bgDark    : C.bgLight,
    card:   dark ? C.cardDark  : C.cardLight,
    card2:  dark ? C.card2Dark : C.card2Light,
    text:   dark ? C.textPrimary  : "#1C1C1E",
    text2:  dark ? C.textSecondary: "#636366",
    border: dark ? C.borderDark   : C.borderLight,
  };
}

// ═══════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════
const fmt = (n, cur="UZS") => cur==="USD" ? "$"+Number(n).toLocaleString("en-US") : Number(n).toLocaleString("uz-UZ")+" so'm";
const fmtDate = d => new Date(d).toLocaleDateString("uz-UZ",{day:"2-digit",month:"short",year:"numeric"});

// ═══════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════
function Screen({ children, theme, style={} }) {
  return (
    <div style={{ minHeight:"100%", background:theme.bg, color:theme.text,
      fontFamily:"'SF Pro Display',-apple-system,system-ui,sans-serif", ...style }}>
      {children}
    </div>
  );
}

function Input({ theme, placeholder, value, onChange, icon, type="text", multiline }) {
  const base = { width:"100%", borderRadius:12, border:`1.5px solid ${theme.border}`,
    background:theme.card2, color:theme.text, fontSize:16, outline:"none",
    fontFamily:"inherit", transition:"border-color 0.2s", boxSizing:"border-box" };
  return (
    <div style={{ position:"relative" }}>
      {icon && !multiline && (
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:theme.text2, zIndex:1 }}>{icon}</span>
      )}
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            style={{ ...base, padding:"12px 16px", minHeight:80, resize:"vertical" }}/>
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            type={type} style={{ ...base, padding: icon ? "14px 16px 14px 44px" : "14px 16px" }}
            onFocus={e=>e.target.style.borderColor=C.orange}
            onBlur={e=>e.target.style.borderColor=theme.border}/>
      }
    </div>
  );
}

function Btn({ children, onClick, color=C.orange, outline, small, disabled }) {
  return (
    <button onClick={disabled?null:onClick} style={{
      width:small?"auto":"100%", padding:small?"8px 16px":"15px",
      borderRadius:12, border:outline?`2px solid ${color}`:"none",
      background:disabled?"#555":outline?"transparent":color,
      color:outline?color:"#fff",
      fontSize:small?13:16, fontWeight:700,
      cursor:disabled?"not-allowed":"pointer",
      transition:"all 0.2s", opacity:disabled?0.6:1 }}>
      {children}
    </button>
  );
}

function Card({ theme, children, style={}, onClick }) {
  // Use longhand border props so callers can override borderColor without shorthand conflict
  const base = {
    background: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.border,
    cursor: onClick ? "pointer" : undefined,
    transition: "transform 0.15s",
  };
  return (
    <div onClick={onClick} style={{ ...base, ...style }}
      onMouseDown={e=>onClick&&(e.currentTarget.style.transform="scale(0.97)")}
      onMouseUp={e=>onClick&&(e.currentTarget.style.transform="scale(1)")}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.transform="scale(1)")}>
      {children}
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{ background:`${color}20`, color, padding:"3px 10px",
      borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function BotAvatar({ size=40 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size/2,
      background:`linear-gradient(135deg,${C.orange},${C.red})`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Bot size={size*0.55} color="#fff"/>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); }, []);
  const bg = type==="success"?C.green:type==="error"?C.red:C.orange;
  return (
    <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
      background:bg, color:"#fff", padding:"10px 20px", borderRadius:12, zIndex:9999,
      fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
      animation:"slideDown 0.3s ease", maxWidth:320, textAlign:"center", width:"90%" }}>
      {msg}
    </div>
  );
}

function TypeWriter({ text, speed=35, onDone }) {
  const [shown, setShown] = useState("");
  const i = useRef(0);
  useEffect(() => {
    i.current=0; setShown("");
    const timer = setInterval(()=>{
      setShown(text.slice(0, i.current+1));
      i.current++;
      if (i.current>=text.length) { clearInterval(timer); onDone&&onDone(); }
    }, speed);
    return ()=>clearInterval(timer);
  }, [text]);
  return <span>{shown}<span style={{ opacity:shown.length<text.length?1:0 }}>|</span></span>;
}

// ═══════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════
function BottomNav({ active, onChange, theme }) {
  const items = [
    { key:"home",      icon:<Home size={20}/>,        label:"Bosh"    },
    { key:"reminders", icon:<Bell size={20}/>,        label:"Eslatma" },
    { key:"finance",   icon:<DollarSign size={20}/>,  label:"Moliya"  },
    { key:"tasks",     icon:<CheckSquare size={20}/>, label:"Vazifa"  },
    { key:"guide",     icon:<BookOpen size={20}/>,    label:"Yordam"  },
    { key:"settings",  icon:<Settings size={20}/>,    label:"Sozlama" },
  ];
  return (
    <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430, background:theme.card,
      borderTop:`1px solid ${theme.border}`, display:"flex",
      paddingBottom:"env(safe-area-inset-bottom,8px)", zIndex:50 }}>
      {items.map(it => (
        <button key={it.key} onClick={()=>onChange(it.key)}
          style={{ flex:1, padding:"10px 4px 6px", background:"none", border:"none",
            color:active===it.key?C.orange:theme.text2, cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            fontSize:10, fontWeight:active===it.key?700:400 }}>
          {it.icon}{it.label}
        </button>
      ))}
    </nav>
  );
}

// ═══════════════════════════════════════════════════
// WELCOME SCREEN
// ═══════════════════════════════════════════════════
function WelcomeScreen({ theme, user, data, isFirstTime, onDone }) {
  const [done, setDone] = useState(false);
  const pending = data.tasks.filter(t=>t.status==="pending").length;
  const text = isFirstTime
    ? `Assalomu aleykum, ${user.name}! Men sizning shaxsiy Kotiba AI kotibingizman. Kundalik harajatlaringizni hisoblash, eslatmalar va vazifalarni boshqarishda yordam beraman.`
    : `Assalomu aleykum, ${user.name}! Bugun sizda ${data.reminders.length} ta eslatma va ${pending} ta bajarilmagan vazifa bor.`;

  useEffect(() => { if(done){ const t=setTimeout(onDone,1200); return()=>clearTimeout(t); } }, [done]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200,
      background:`linear-gradient(135deg,#0F0F11 0%,#1a0800 50%,#0F0F11 100%)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      {[C.orange,C.blue,C.green].map((col,i)=>(
        <div key={i} style={{ position:"absolute", width:200+i*60, height:200+i*60,
          borderRadius:"50%", background:col, opacity:0.04,
          top:["-5%","45%","65%"][i], left:["-10%","55%","-15%"][i],
          animation:`float ${3+i}s ease-in-out infinite alternate`, pointerEvents:"none" }}/>
      ))}
      <div style={{ animation:"fadeInUp 0.6s ease" }}><BotAvatar size={88}/></div>
      <div style={{ marginTop:28, textAlign:"center", maxWidth:320 }}>
        <p style={{ fontSize:19, fontWeight:600, color:"#fff", lineHeight:1.65, minHeight:110 }}>
          <TypeWriter text={text} speed={32} onDone={()=>setDone(true)}/>
        </p>
      </div>
      {done && (
        <button onClick={onDone} style={{ marginTop:36, background:C.orange, color:"#fff",
          border:"none", padding:"14px 44px", borderRadius:24, fontSize:16,
          fontWeight:700, cursor:"pointer", animation:"fadeIn 0.5s ease" }}>
          Boshlash →
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// AUTH — REGISTER
// ═══════════════════════════════════════════════════
function RegisterScreen({ theme, onOTP, onLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) return setErr("Ismingizni kiriting");
    if (!/^\+998\d{9}$/.test(phone)) return setErr("Format: +998901234567");
    const users = LS.get("kotiba_users",[]);
    if (users.find(u=>u.phone===phone)) return setErr("Bu raqam allaqachon ro'yxatdan o'tgan!");
    setErr(""); onOTP({ name:name.trim(), phone, isNew:true });
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding:"60px 24px 40px", display:"flex", flexDirection:"column", gap:28 }}>
        <div style={{ textAlign:"center" }}>
          <BotAvatar size={72}/>
          <h1 style={{ fontSize:28, fontWeight:800, color:theme.text, marginTop:16, marginBottom:4 }}>Kotiba AI</h1>
          <p style={{ color:theme.text2, fontSize:14 }}>Shaxsiy sun'iy intellektli kotibingiz</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:theme.text }}>Ro'yxatdan o'tish</h2>
          <Input theme={theme} placeholder="Ismingiz" value={name} onChange={setName} icon={<Users size={18}/>}/>
          <Input theme={theme} placeholder="+998901234567" value={phone} onChange={setPhone} icon={<Phone size={18}/>} type="tel"/>
          {err && <p style={{ color:C.red, fontSize:13 }}>{err}</p>}
          <Btn onClick={submit} color={C.orange}>SMS kod yuborish →</Btn>
          <p style={{ textAlign:"center", color:theme.text2, fontSize:14 }}>
            Hisobingiz bormi?{" "}
            <span onClick={onLogin} style={{ color:C.orange, fontWeight:600, cursor:"pointer" }}>Kirish</span>
          </p>
        </div>
      </div>
    </Screen>
  );
}

function LoginForm({ theme, onOTP }) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!/^\+998\d{9}$/.test(phone)) return setErr("Format: +998901234567");
    const users = LS.get("kotiba_users",[]);
    if (!users.find(u=>u.phone===phone)) return setErr("Bu raqam ro'yxatdan o'tmagan!");
    setErr(""); onOTP({ phone, isNew:false });
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Input theme={theme} placeholder="+998901234567" value={phone} onChange={setPhone} icon={<Phone size={18}/>} type="tel"/>
      {err && <p style={{ color:C.red, fontSize:13 }}>{err}</p>}
      <Btn onClick={submit} color={C.orange}>SMS kod yuborish →</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// AUTH — OTP
// ═══════════════════════════════════════════════════
function OTPScreen({ theme, data, onSuccess, onBack }) {
  const [otp, setOtp] = useState(["","","","",""]);
  const [err, setErr] = useState("");
  const [timer, setTimer] = useState(60);
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef()];
  const DEMO_CODE = "12345";

  useEffect(() => { const t=setInterval(()=>setTimer(p=>p>0?p-1:0),1000); return()=>clearInterval(t); },[]);

  const handleInput = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next=[...otp]; next[idx]=val; setOtp(next);
    if (val && idx<4) refs[idx+1].current?.focus();
    if (!val && idx>0) refs[idx-1].current?.focus();
    if (next.every(d=>d) && next.join("")===DEMO_CODE) { setErr(""); setTimeout(()=>onSuccess(data),300); }
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding:"60px 24px 40px", display:"flex", flexDirection:"column", gap:24 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
          color:theme.text2,display:"flex",alignItems:"center",gap:6,fontSize:14 }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:64,height:64,borderRadius:32,background:`${C.orange}20`,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <Smartphone size={32} color={C.orange}/>
          </div>
          <h2 style={{ fontSize:22,fontWeight:700,color:theme.text }}>SMS Kodni kiriting</h2>
          <p style={{ color:theme.text2,fontSize:14,marginTop:8 }}>{data.phone} ga kod yuborildi</p>
          <p style={{ color:C.orange,fontSize:12,marginTop:4,fontWeight:600 }}>🔑 Demo kod: 12345</p>
        </div>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          {otp.map((d,i)=>(
            <input key={i} ref={refs[i]} value={d}
              onChange={e=>handleInput(i,e.target.value)}
              onKeyDown={e=>e.key==="Backspace"&&!d&&i>0&&refs[i-1].current?.focus()}
              style={{ width:52,height:56,borderRadius:12,
                border:`2px solid ${d?C.orange:theme.border}`,
                background:theme.card2,color:theme.text,
                fontSize:24,fontWeight:700,textAlign:"center",outline:"none" }}
              maxLength={1} inputMode="numeric"/>
          ))}
        </div>
        {err && <p style={{ color:C.red,fontSize:13,textAlign:"center" }}>{err}</p>}
        <Btn onClick={()=>{ if(otp.join("")!==DEMO_CODE) setErr("Noto'g'ri kod! (Demo: 12345)"); else onSuccess(data); }} color={C.orange}>Tasdiqlash</Btn>
        <p style={{ textAlign:"center",color:theme.text2,fontSize:14 }}>
          {timer>0 ? `Qayta yuborish: ${timer}s` : <span style={{ color:C.orange,cursor:"pointer" }}>Qayta yuborish</span>}
        </p>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// AUTH — PIN
// ═══════════════════════════════════════════════════
function PINScreen({ theme, title, confirm, onDone, onError }) {
  const [pin, setPin] = useState([]);
  const [confirmPin, setConfirmPin] = useState([]);
  const [phase, setPhase] = useState("enter");
  const [err, setErr] = useState("");
  const current = phase==="enter"?pin:confirmPin;

  const handleNum = n => {
    if (current.length>=4) return;
    if (phase==="enter") {
      const next=[...pin,n]; setPin(next);
      if (next.length===4 && confirm) setPhase("confirm");
      else if (next.length===4 && !confirm) onDone(next.join(""));
    } else {
      const next=[...confirmPin,n]; setConfirmPin(next);
      if (next.length===4) {
        if (next.join("")===pin.join("")) onDone(pin.join(""));
        else { setErr("PIN kodlar mos kelmadi!"); setPin([]); setConfirmPin([]); setPhase("enter"); }
      }
    }
  };
  const del = () => { if(phase==="enter") setPin(p=>p.slice(0,-1)); else setConfirmPin(p=>p.slice(0,-1)); };
  const display = phase==="enter"?pin:confirmPin;

  return (
    <Screen theme={theme}>
      <div style={{ padding:"60px 24px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:28 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:64,height:64,borderRadius:32,background:`${C.orange}20`,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <Lock size={32} color={C.orange}/>
          </div>
          <h2 style={{ fontSize:22,fontWeight:700,color:theme.text }}>
            {phase==="confirm"?"PIN ni qayta kiriting":title}
          </h2>
          <p style={{ color:theme.text2,fontSize:14,marginTop:8 }}>4 xonali maxfiy kod</p>
        </div>
        <div style={{ display:"flex",gap:16 }}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{ width:16,height:16,borderRadius:8,
              background:i<display.length?C.orange:theme.border, transition:"background 0.2s" }}/>
          ))}
        </div>
        {err && <p style={{ color:C.red,fontSize:13 }}>{err}</p>}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:"100%",maxWidth:280 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((n,i)=>(
            <button key={i} onClick={()=>n==="⌫"?del():n!==""?handleNum(n):null}
              style={{ height:64,borderRadius:16,border:"none",
                background:n===""?"transparent":theme.card2,
                color:n==="⌫"?C.orange:theme.text,
                fontSize:22,fontWeight:600,
                cursor:n===""?"default":"pointer",
                boxShadow:n===""?"none":theme.dark?"0 2px 8px rgba(0,0,0,0.3)":"0 2px 8px rgba(0,0,0,0.1)" }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
function Dashboard({ theme, user, data, onNav, onVoice, recording }) {
  const today = new Date().toDateString();
  const todayRem = data.reminders.filter(r=>r.status!=="done"&&new Date(r.date).toDateString()===today);
  const pendingTasks = data.tasks.filter(t=>t.status==="pending");
  const m = new Date().getMonth();
  const income  = data.finances.filter(f=>f.type==="income" &&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const expense = data.finances.filter(f=>f.type==="expense"&&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const overspent = expense>income && income>0;

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 110px" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <BotAvatar size={44}/>
            <div>
              <p style={{ color:theme.text2,fontSize:13,margin:0 }}>Salom,</p>
              <h2 style={{ fontSize:20,fontWeight:800,color:theme.text,margin:0 }}>{user.name} 👋</h2>
            </div>
          </div>
          <button onClick={()=>onNav("ai-chat")}
            style={{ background:`${C.blue}20`,border:"none",borderRadius:12,
              padding:"8px 14px",color:C.blue,cursor:"pointer",
              display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600 }}>
            <Bot size={16}/> AI Chat
          </button>
        </div>

        {/* Overspend warning */}
        {overspent && (
          <Card theme={theme} style={{ marginBottom:14,background:`${C.red}15`,borderColor:`${C.red}40` }}>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
              <AlertTriangle size={20} color={C.red} style={{ flexShrink:0,marginTop:2 }}/>
              <div>
                <p style={{ fontWeight:700,color:C.red,margin:0,fontSize:14 }}>⚠️ Harajatlar oshib ketdi!</p>
                <p style={{ color:theme.text2,fontSize:13,margin:"4px 0 0" }}>
                  Chiqimlaringiz kirimingizdan oshib ketyapti. Tejamkorlikka o'ting!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Balance card */}
        <div style={{ background:`linear-gradient(135deg,${C.orange},${C.red})`,
          borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",right:-20,top:-20,width:120,height:120,
            borderRadius:60,background:"rgba(255,255,255,0.08)" }}/>
          <p style={{ color:"rgba(255,255,255,0.8)",fontSize:13,margin:0 }}>Bu oylik balans</p>
          <h2 style={{ fontSize:26,fontWeight:800,color:"#fff",margin:"6px 0 14px" }}>{fmt(income-expense)}</h2>
          <div style={{ display:"flex",gap:24 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.7)",fontSize:11,margin:0 }}>↑ Kirim</p>
              <p style={{ color:"#fff",fontWeight:700,margin:0,fontSize:14 }}>{fmt(income)}</p>
            </div>
            <div>
              <p style={{ color:"rgba(255,255,255,0.7)",fontSize:11,margin:0 }}>↓ Chiqim</p>
              <p style={{ color:"#fff",fontWeight:700,margin:0,fontSize:14 }}>{fmt(expense)}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
          <Card theme={theme} onClick={()=>onNav("reminders")} style={{ padding:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <div style={{ width:34,height:34,borderRadius:10,background:`${C.blue}20`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Bell size={17} color={C.blue}/>
              </div>
              <span style={{ color:theme.text2,fontSize:12 }}>Eslatmalar</span>
            </div>
            <p style={{ fontSize:26,fontWeight:800,color:theme.text,margin:0 }}>{todayRem.length}</p>
            <p style={{ color:theme.text2,fontSize:11,margin:"2px 0 0" }}>Bugun</p>
          </Card>
          <Card theme={theme} onClick={()=>onNav("tasks")} style={{ padding:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <div style={{ width:34,height:34,borderRadius:10,background:`${C.green}20`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <CheckSquare size={17} color={C.green}/>
              </div>
              <span style={{ color:theme.text2,fontSize:12 }}>Vazifalar</span>
            </div>
            <p style={{ fontSize:26,fontWeight:800,color:theme.text,margin:0 }}>{pendingTasks.length}</p>
            <p style={{ color:theme.text2,fontSize:11,margin:"2px 0 0" }}>Kutilmoqda</p>
          </Card>
        </div>

        {/* Recent reminders */}
        <h3 style={{ fontSize:15,fontWeight:700,color:theme.text,margin:"0 0 10px" }}>Yaqin eslatmalar</h3>
        {data.reminders.length===0
          ? <Card theme={theme} style={{ textAlign:"center",padding:24 }}>
              <Bell size={30} color={theme.text2} style={{ opacity:0.3 }}/>
              <p style={{ color:theme.text2,margin:"8px 0 0",fontSize:14 }}>Eslatmalar yo'q</p>
            </Card>
          : data.reminders.slice(0,3).map(r=>(
            <Card key={r.id} theme={theme} style={{ marginBottom:8,padding:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <p style={{ margin:0,fontWeight:600,fontSize:14,color:theme.text }}>{r.text}</p>
                  <p style={{ margin:"2px 0 0",fontSize:12,color:theme.text2 }}>
                    {fmtDate(r.date)}{r.time&&` • ${r.time}`}
                  </p>
                </div>
                <Tag label={r.status==="done"?"✓ Bajarildi":"● Faol"} color={r.status==="done"?C.green:C.orange}/>
              </div>
            </Card>
          ))
        }

        {/* AI Advice */}
        <Card theme={theme} onClick={()=>onNav("ai-advice")}
          style={{ marginTop:14,background:`linear-gradient(135deg,${C.blue}15,${C.purple}15)`,borderColor:`${C.blue}40` }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:`${C.blue}20`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Sparkles size={22} color={C.blue}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700,fontSize:15,color:theme.text,margin:0 }}>AI Maslahatlari</p>
              <p style={{ color:theme.text2,fontSize:12,margin:"2px 0 0" }}>Moliyaviy va kunlik maslahatlar</p>
            </div>
            <ChevronRight size={18} color={theme.text2}/>
          </div>
        </Card>
      </div>

      {/* Mic FAB */}
      <button onClick={onVoice}
        style={{ position:"fixed",bottom:74,left:"50%",transform:"translateX(-50%)",
          width:60,height:60,borderRadius:30,
          background:recording?C.red:C.orange,border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 4px 20px ${recording?C.red:C.orange}60`,
          animation:recording?"pulse 1s ease-in-out infinite":"none", zIndex:40 }}>
        {recording?<MicOff size={26} color="#fff"/>:<Mic size={26} color="#fff"/>}
      </button>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════════
function RemindersScreen({ theme, data, setData, showToast }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState("all");

  const list = data.reminders.filter(r=>
    filter==="all"?true:filter==="active"?r.status!=="done":r.status==="done"
  );

  const save = r => {
    const updated = form?.id
      ? data.reminders.map(x=>x.id===form.id?r:x)
      : [...data.reminders, {...r,id:Date.now(),status:"active"}];
    setData(d=>({...d,reminders:updated}));
    showToast("Eslatma saqlandi!","success"); setForm(null);
  };
  const remove = id => setData(d=>({...d,reminders:d.reminders.filter(r=>r.id!==id)}));
  const toggle = id => setData(d=>({...d,reminders:d.reminders.map(r=>r.id===id?{...r,status:r.status==="done"?"active":"done"}:r)}));

  if (form!==null) return <ReminderForm theme={theme} initial={form} onSave={save} onBack={()=>setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <h2 style={{ fontSize:22,fontWeight:800,color:theme.text,margin:0 }}>🔔 Eslatmalar</h2>
          <button onClick={()=>setForm({})}
            style={{ background:C.orange,border:"none",borderRadius:12,padding:"8px 14px",
              color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,
              display:"flex",alignItems:"center",gap:5 }}>
            <Plus size={15}/> Qo'shish
          </button>
        </div>

        <div style={{ display:"flex",gap:8,marginBottom:14 }}>
          {[["all","Hammasi"],["active","Faol"],["done","Bajarildi"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"6px 14px",borderRadius:20,
                border:`1.5px solid ${filter===f?C.orange:theme.border}`,
                background:filter===f?C.orange:"transparent",
                color:filter===f?"#fff":theme.text2,cursor:"pointer",fontSize:13 }}>
              {l}
            </button>
          ))}
        </div>

        {list.length===0 && (
          <div style={{ textAlign:"center",padding:60 }}>
            <Bell size={44} color={theme.text2} style={{ opacity:0.25 }}/>
            <p style={{ color:theme.text2,marginTop:10 }}>Eslatmalar yo'q</p>
          </div>
        )}

        {list.map(r=>{
          const urgent = new Date(r.date).getTime()-Date.now()<86400000;
          return (
            <Card key={r.id} theme={theme} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                <button onClick={()=>toggle(r.id)}
                  style={{ width:24,height:24,borderRadius:12,flexShrink:0,marginTop:2,
                    border:`2px solid ${r.status==="done"?C.green:theme.border}`,
                    background:r.status==="done"?C.green:"transparent",
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {r.status==="done"&&<Check size={13} color="#fff"/>}
                </button>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0,fontWeight:600,fontSize:15,color:theme.text,
                    textDecoration:r.status==="done"?"line-through":"none",opacity:r.status==="done"?0.55:1 }}>
                    {r.text}
                  </p>
                  <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap" }}>
                    <Tag label={`📅 ${fmtDate(r.date)}`} color={C.blue}/>
                    {r.time&&<Tag label={`⏰ ${r.time}`} color={C.orange}/>}
                    {urgent&&r.status!=="done"&&<Tag label="🔴 Yaqin" color={C.red}/>}
                    {r.repeat&&r.repeat!=="1 marta"&&<Tag label={`🔄 ${r.repeat}`} color={C.purple}/>}
                  </div>
                </div>
                <div style={{ display:"flex",gap:5 }}>
                  <button onClick={()=>setForm(r)} style={{ background:`${C.blue}20`,border:"none",borderRadius:8,padding:6,cursor:"pointer",color:C.blue }}>
                    <Edit3 size={13}/>
                  </button>
                  <button onClick={()=>remove(r.id)} style={{ background:`${C.red}20`,border:"none",borderRadius:8,padding:6,cursor:"pointer",color:C.red }}>
                    <Trash2 size={13}/>
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
  const [text, setText] = useState(initial?.text||"");
  const [date, setDate] = useState(initial?.date||new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(initial?.time||"09:00");
  const [repeat, setRepeat] = useState(initial?.repeat||REPEAT_OPTIONS[0]);
  const [notif, setNotif] = useState(initial?.notif||NOTIF_OPTIONS[0]);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!text.trim()) return setErr("Eslatma matnini kiriting");
    onSave({...initial,text,date,time,repeat,notif});
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
          color:theme.text2,display:"flex",alignItems:"center",gap:6,marginBottom:20 }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize:20,fontWeight:800,color:theme.text,margin:"0 0 22px" }}>
          {initial?.id?"Eslatmani tahrirlash":"Yangi eslatma"}
        </h2>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Input theme={theme} placeholder="Eslatma matni" value={text} onChange={setText} multiline/>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:6 }}>Sana</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{ width:"100%",padding:"13px 16px",borderRadius:12,
                border:`1.5px solid ${theme.border}`,background:theme.card2,
                color:theme.text,fontSize:16,outline:"none",boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:6 }}>Vaqt</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
              style={{ width:"100%",padding:"13px 16px",borderRadius:12,
                border:`1.5px solid ${theme.border}`,background:theme.card2,
                color:theme.text,fontSize:16,outline:"none",boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:8 }}>Takrorlash</label>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {REPEAT_OPTIONS.map(o=>(
                <button key={o} onClick={()=>setRepeat(o)}
                  style={{ padding:"8px 14px",borderRadius:20,
                    border:`1.5px solid ${repeat===o?C.orange:theme.border}`,
                    background:repeat===o?`${C.orange}20`:"transparent",
                    color:repeat===o?C.orange:theme.text2,cursor:"pointer",fontSize:13 }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:8 }}>Bildirishnoma</label>
            <div style={{ display:"flex",gap:8 }}>
              {NOTIF_OPTIONS.map(o=>(
                <button key={o} onClick={()=>setNotif(o)}
                  style={{ flex:1,padding:"10px",borderRadius:12,
                    border:`1.5px solid ${notif===o?C.blue:theme.border}`,
                    background:notif===o?`${C.blue}20`:"transparent",
                    color:notif===o?C.blue:theme.text2,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          {err&&<p style={{ color:C.red,fontSize:13 }}>{err}</p>}
          <Btn onClick={submit} color={C.orange}>Saqlash</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════
function FinanceScreen({ theme, data, setData, showToast }) {
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const m = new Date().getMonth();
  const income  = data.finances.filter(f=>f.type==="income" &&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const expense = data.finances.filter(f=>f.type==="expense"&&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);

  const catData = EXPENSE_CATS.map(c=>{
    const total = data.finances.filter(f=>f.type==="expense"&&f.category===c.id).reduce((s,f)=>s+f.amount,0);
    return { name:c.name, value:total, color:c.color };
  }).filter(d=>d.value>0);

  const last6 = Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const mo=d.getMonth();
    const label=d.toLocaleDateString("uz-UZ",{month:"short"});
    const inc=data.finances.filter(f=>f.type==="income"&&new Date(f.date).getMonth()===mo).reduce((s,f)=>s+f.amount,0);
    const exp=data.finances.filter(f=>f.type==="expense"&&new Date(f.date).getMonth()===mo).reduce((s,f)=>s+f.amount,0);
    return { name:label, Kirim:Math.round(inc/1000000), Chiqim:Math.round(exp/1000000) };
  }).reverse();

  const save = f => {
    const updated = form?.id
      ? data.finances.map(x=>x.id===form.id?f:x)
      : [...data.finances, {...f,id:Date.now(),date:new Date().toISOString().split("T")[0]}];
    setData(d=>({...d,finances:updated}));
    showToast(f.type==="income"?"Kirim saqlandi!":"Chiqim saqlandi!","success"); setForm(null);
  };
  const remove = id => setData(d=>({...d,finances:d.finances.filter(f=>f.id!==id)}));
  const filtered = data.finances.filter(f=>filterType==="all"?true:f.type===filterType);

  if (form!==null) return <FinanceForm theme={theme} initial={form} onSave={save} onBack={()=>setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <h2 style={{ fontSize:22,fontWeight:800,color:theme.text,margin:0 }}>💰 Moliya</h2>
          <button onClick={()=>setForm({})}
            style={{ background:C.orange,border:"none",borderRadius:12,padding:"8px 14px",
              color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,
              display:"flex",alignItems:"center",gap:5 }}>
            <Plus size={15}/> Qo'shish
          </button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18 }}>
          <div style={{ background:`linear-gradient(135deg,${C.green},#1a8c3e)`,borderRadius:16,padding:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <ArrowUpRight size={16} color="rgba(255,255,255,0.8)"/>
              <span style={{ color:"rgba(255,255,255,0.8)",fontSize:12 }}>Kirim</span>
            </div>
            <p style={{ fontSize:17,fontWeight:800,color:"#fff",margin:0 }}>{fmt(income)}</p>
          </div>
          <div style={{ background:`linear-gradient(135deg,${C.red},#8c1a1a)`,borderRadius:16,padding:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <ArrowDownRight size={16} color="rgba(255,255,255,0.8)"/>
              <span style={{ color:"rgba(255,255,255,0.8)",fontSize:12 }}>Chiqim</span>
            </div>
            <p style={{ fontSize:17,fontWeight:800,color:"#fff",margin:0 }}>{fmt(expense)}</p>
          </div>
        </div>

        <div style={{ display:"flex",gap:8,marginBottom:14 }}>
          {[["overview","Grafik"],["list","Ro'yxat"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:"7px 18px",borderRadius:20,
                border:`1.5px solid ${tab===t?C.orange:theme.border}`,
                background:tab===t?C.orange:"transparent",
                color:tab===t?"#fff":theme.text2,cursor:"pointer",fontSize:13 }}>
              {l}
            </button>
          ))}
        </div>

        {tab==="overview" ? (
          <>
            {catData.length>0&&(
              <Card theme={theme} style={{ marginBottom:14 }}>
                <h4 style={{ color:theme.text,margin:"0 0 12px",fontSize:14,fontWeight:700 }}>Chiqim taqsimoti</h4>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {catData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip formatter={v=>[fmt(v),"Summa"]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center" }}>
                  {catData.map(d=>(
                    <div key={d.name} style={{ display:"flex",alignItems:"center",gap:4 }}>
                      <div style={{ width:8,height:8,borderRadius:4,background:d.color }}/>
                      <span style={{ fontSize:11,color:theme.text2 }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card theme={theme}>
              <h4 style={{ color:theme.text,margin:"0 0 12px",fontSize:14,fontWeight:700 }}>6 oylik taqqoslama (mln so'm)</h4>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={last6}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="name" tick={{ fill:theme.text2,fontSize:10 }}/>
                  <YAxis tick={{ fill:theme.text2,fontSize:10 }}/>
                  <Tooltip/>
                  <Bar dataKey="Kirim" fill={C.green} radius={[4,4,0,0]}/>
                  <Bar dataKey="Chiqim" fill={C.red} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : (
          <>
            <div style={{ display:"flex",gap:8,marginBottom:12 }}>
              {[["all","Hammasi"],["income","Kirim"],["expense","Chiqim"]].map(([f,l])=>(
                <button key={f} onClick={()=>setFilterType(f)}
                  style={{ padding:"6px 12px",borderRadius:20,
                    border:`1.5px solid ${filterType===f?C.orange:theme.border}`,
                    background:filterType===f?`${C.orange}20`:"transparent",
                    color:filterType===f?C.orange:theme.text2,cursor:"pointer",fontSize:12 }}>
                  {l}
                </button>
              ))}
            </div>
            {filtered.slice().reverse().map(f=>{
              const cats = f.type==="income"?INCOME_CATS:EXPENSE_CATS;
              const cat = cats.find(c=>c.id===f.category)||cats[cats.length-1];
              return (
                <Card key={f.id} theme={theme} style={{ marginBottom:8,padding:12 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:`${cat.color}20`,
                        display:"flex",alignItems:"center",justifyContent:"center",color:cat.color }}>
                        {cat.icon}
                      </div>
                      <div>
                        <p style={{ margin:0,fontWeight:600,fontSize:14,color:theme.text }}>{cat.name}</p>
                        <p style={{ margin:"2px 0 0",fontSize:12,color:theme.text2 }}>{f.note||fmtDate(f.date)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ margin:0,fontWeight:700,fontSize:15,color:f.type==="income"?C.green:C.red }}>
                        {f.type==="income"?"+":"-"}{fmt(f.amount,f.currency)}
                      </p>
                      <button onClick={()=>remove(f.id)}
                        style={{ background:"none",border:"none",cursor:"pointer",color:C.red,padding:0,marginTop:2 }}>
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
            {filtered.length===0&&(
              <div style={{ textAlign:"center",padding:40 }}>
                <DollarSign size={38} color={theme.text2} style={{ opacity:0.25 }}/>
                <p style={{ color:theme.text2,marginTop:8 }}>Ma'lumot yo'q</p>
              </div>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}

function FinanceForm({ theme, initial, onSave, onBack }) {
  const [type, setType] = useState(initial?.type||"expense");
  const [amount, setAmount] = useState(initial?.amount?.toString()||"");
  const [currency, setCurrency] = useState(initial?.currency||"UZS");
  const [category, setCategory] = useState(initial?.category||"other");
  const [note, setNote] = useState(initial?.note||"");
  const [err, setErr] = useState("");
  const cats = type==="income"?INCOME_CATS:EXPENSE_CATS;

  const submit = () => {
    if (!amount||isNaN(+amount)||+amount<=0) return setErr("To'g'ri summani kiriting");
    onSave({...initial,type,amount:+amount,currency,category,note});
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
          color:theme.text2,display:"flex",alignItems:"center",gap:6,marginBottom:20 }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize:20,fontWeight:800,color:theme.text,margin:"0 0 22px" }}>
          {initial?.id?"Tahrirlash":"Yangi yozuv"}
        </h2>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"flex",gap:8 }}>
            {[["income","↑ Kirim",C.green],["expense","↓ Chiqim",C.red]].map(([t,l,col])=>(
              <button key={t} onClick={()=>{setType(t);setCategory("other");}}
                style={{ flex:1,padding:12,borderRadius:12,
                  border:`2px solid ${type===t?col:theme.border}`,
                  background:type===t?`${col}20`:"transparent",
                  color:type===t?col:theme.text2,cursor:"pointer",fontWeight:700,fontSize:15 }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <div style={{ flex:1 }}>
              <Input theme={theme} placeholder="Summa" value={amount} onChange={setAmount} type="number"/>
            </div>
            <div style={{ display:"flex",gap:4 }}>
              {["UZS","USD"].map(cur=>(
                <button key={cur} onClick={()=>setCurrency(cur)}
                  style={{ padding:"13px 12px",borderRadius:12,
                    border:`1.5px solid ${currency===cur?C.orange:theme.border}`,
                    background:currency===cur?`${C.orange}20`:"transparent",
                    color:currency===cur?C.orange:theme.text2,cursor:"pointer",fontWeight:700,fontSize:14 }}>
                  {cur}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:8 }}>Kategoriya</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {cats.map(c=>(
                <button key={c.id} onClick={()=>setCategory(c.id)}
                  style={{ padding:"10px 12px",borderRadius:12,
                    border:`1.5px solid ${category===c.id?c.color:theme.border}`,
                    background:category===c.id?`${c.color}20`:"transparent",
                    color:category===c.id?c.color:theme.text2,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600 }}>
                  {c.icon}{c.name}
                </button>
              ))}
            </div>
          </div>
          <Input theme={theme} placeholder="Izoh (ixtiyoriy)" value={note} onChange={setNote} multiline/>
          {err&&<p style={{ color:C.red,fontSize:13 }}>{err}</p>}
          <Btn onClick={submit} color={type==="income"?C.green:C.red}>Saqlash</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════
function TasksScreen({ theme, data, setData, showToast }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState("all");

  const list = data.tasks.filter(t=>filter==="all"?true:t.status===filter);

  const priority = deadline => {
    const diff = new Date(deadline)-Date.now();
    if (diff<86400000)   return { label:"🔴 Shoshilinch", color:C.red    };
    if (diff<86400000*3) return { label:"🟡 O'rta",       color:C.yellow };
    return                      { label:"🟢 Oddiy",        color:C.green  };
  };

  const save = t => {
    const updated = form?.id
      ? data.tasks.map(x=>x.id===form.id?t:x)
      : [...data.tasks, {...t,id:Date.now(),status:"pending"}];
    setData(d=>({...d,tasks:updated}));
    showToast("Vazifa saqlandi!","success"); setForm(null);
  };
  const toggle = id => setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status:t.status==="done"?"pending":"done"}:t)}));
  const remove = id => setData(d=>({...d,tasks:d.tasks.filter(t=>t.id!==id)}));

  if (form!==null) return <TaskForm theme={theme} initial={form} onSave={save} onBack={()=>setForm(null)}/>;

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <h2 style={{ fontSize:22,fontWeight:800,color:theme.text,margin:0 }}>✅ Vazifalar</h2>
          <button onClick={()=>setForm({})}
            style={{ background:C.green,border:"none",borderRadius:12,padding:"8px 14px",
              color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,
              display:"flex",alignItems:"center",gap:5 }}>
            <Plus size={15}/> Qo'shish
          </button>
        </div>
        <div style={{ display:"flex",gap:8,marginBottom:14 }}>
          {[["all","Hammasi"],["pending","Kutilmoqda"],["done","Bajarildi"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"6px 14px",borderRadius:20,
                border:`1.5px solid ${filter===f?C.green:theme.border}`,
                background:filter===f?C.green:"transparent",
                color:filter===f?"#fff":theme.text2,cursor:"pointer",fontSize:13 }}>
              {l}
            </button>
          ))}
        </div>
        {list.length===0&&(
          <div style={{ textAlign:"center",padding:60 }}>
            <CheckSquare size={44} color={theme.text2} style={{ opacity:0.25 }}/>
            <p style={{ color:theme.text2,marginTop:10 }}>Vazifalar yo'q</p>
          </div>
        )}
        {list.map(t=>{
          const p = t.deadline?priority(t.deadline):null;
          return (
            <Card key={t.id} theme={theme} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                <button onClick={()=>toggle(t.id)}
                  style={{ width:24,height:24,borderRadius:12,flexShrink:0,marginTop:2,
                    border:`2px solid ${t.status==="done"?C.green:theme.border}`,
                    background:t.status==="done"?C.green:"transparent",
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {t.status==="done"&&<Check size={13} color="#fff"/>}
                </button>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0,fontWeight:600,fontSize:15,color:theme.text,
                    textDecoration:t.status==="done"?"line-through":"none",
                    opacity:t.status==="done"?0.55:1 }}>{t.text}</p>
                  <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap" }}>
                    {t.deadline&&<Tag label={`📅 ${fmtDate(t.deadline)}`} color={C.blue}/>}
                    {p&&t.status!=="done"&&<Tag label={p.label} color={p.color}/>}
                  </div>
                </div>
                <div style={{ display:"flex",gap:5 }}>
                  <button onClick={()=>setForm(t)} style={{ background:`${C.blue}20`,border:"none",borderRadius:8,padding:6,cursor:"pointer",color:C.blue }}>
                    <Edit3 size={13}/>
                  </button>
                  <button onClick={()=>remove(t.id)} style={{ background:`${C.red}20`,border:"none",borderRadius:8,padding:6,cursor:"pointer",color:C.red }}>
                    <Trash2 size={13}/>
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
  const [text, setText] = useState(initial?.text||"");
  const [deadline, setDeadline] = useState(initial?.deadline||"");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!text.trim()) return setErr("Vazifa matnini kiriting");
    onSave({...initial,text,deadline});
  };
  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
          color:theme.text2,display:"flex",alignItems:"center",gap:6,marginBottom:20 }}>
          <ArrowLeft size={18}/> Orqaga
        </button>
        <h2 style={{ fontSize:20,fontWeight:800,color:theme.text,margin:"0 0 22px" }}>
          {initial?.id?"Tahrirlash":"Yangi vazifa"}
        </h2>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Input theme={theme} placeholder="Vazifa tavsifi" value={text} onChange={setText} multiline/>
          <div>
            <label style={{ color:theme.text2,fontSize:13,display:"block",marginBottom:6 }}>Muddat (deadline)</label>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
              style={{ width:"100%",padding:"13px 16px",borderRadius:12,
                border:`1.5px solid ${theme.border}`,background:theme.card2,
                color:theme.text,fontSize:16,outline:"none",boxSizing:"border-box" }}/>
          </div>
          {err&&<p style={{ color:C.red,fontSize:13 }}>{err}</p>}
          <Btn onClick={submit} color={C.green}>Saqlash</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// AI CHAT
// ═══════════════════════════════════════════════════
function AIChatScreen({ theme, user, data }) {
  const [messages, setMessages] = useState([
    { role:"assistant", text:`Assalomu aleykum, ${user.name}! Men Kotiba AI — sizning shaxsiy yordamchingizman. Eslatma, moliya va vazifalar haqida gaplasha olamiz! 😊` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef();

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const m = new Date().getMonth();
  const income  = data.finances.filter(f=>f.type==="income" &&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const expense = data.finances.filter(f=>f.type==="expense"&&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);

  const send = async text => {
    if (!text.trim()) return;
    setMessages(p=>[...p,{role:"user",text}]); setInput(""); setLoading(true);
    const ctx = `Foydalanuvchi: ${user.name} | Bugun: ${new Date().toLocaleDateString("uz-UZ")} | Kirim: ${income.toLocaleString()} so'm | Chiqim: ${expense.toLocaleString()} so'm | Eslatmalar: ${data.reminders.length} | Bajarilmagan vazifalar: ${data.tasks.filter(t=>t.status==="pending").length}`;
    try {
      const res = await fetch("/groq/openai/v1/chat/completions",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"llama-3.3-70b-versatile",
          max_tokens:1000,
          messages:[
            {role:"system", content:`Sen "Kotiba AI" — O'zbek tilida ishlaydigan shaxsiy moliyaviy kotib. ${ctx}
Faqat o'zbek tilida javob ber. Faqat eslatma, moliya, vazifalar haqida gaplash. Boshqa mavzularda: "Kechirasiz, faqat moliya va vazifalar bo'yicha yordam bera olaman." Qisqa va aniq javob ber.`},
            ...messages.map(m=>({role:m.role,content:m.text})),
            {role:"user",content:text}
          ]
        })
      });
      const d = await res.json();
      const reply = d.choices?.[0]?.message?.content||"Xatolik yuz berdi.";
      setMessages(p=>[...p,{role:"assistant",text:reply}]);
    } catch {
      setMessages(p=>[...p,{role:"assistant",text:"Internet xatosi. Iltimos qaytadan urinib ko'ring."}]);
    }
    setLoading(false);
  };

  return (
    <Screen theme={theme}>
      <div style={{ display:"flex",flexDirection:"column",height:"100vh" }}>
        <div style={{ padding:"52px 16px 12px",background:theme.card,
          borderBottom:`1px solid ${theme.border}`,display:"flex",alignItems:"center",gap:12 }}>
          <BotAvatar size={38}/>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:theme.text }}>Kotiba AI</h3>
            <p style={{ margin:0,fontSize:11,color:C.green }}>● Online</p>
          </div>
        </div>

        <div style={{ flex:1,overflowY:"auto",padding:"16px 16px 0" }}>
          {messages.map((msg,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:14,
              flexDirection:msg.role==="user"?"row-reverse":"row" }}>
              {msg.role==="assistant"&&<BotAvatar size={30}/>}
              <div style={{ maxWidth:"82%",padding:"11px 15px",borderRadius:16,
                background:msg.role==="user"?C.orange:theme.card2,
                color:msg.role==="user"?"#fff":theme.text,
                borderBottomRightRadius:msg.role==="user"?4:16,
                borderBottomLeftRadius:msg.role==="assistant"?4:16,
                fontSize:15,lineHeight:1.5 }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{ display:"flex",gap:8,marginBottom:14 }}>
              <BotAvatar size={30}/>
              <div style={{ padding:"12px 16px",borderRadius:16,background:theme.card2 }}>
                <div style={{ display:"flex",gap:5 }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{ width:7,height:7,borderRadius:4,background:theme.text2,
                      animation:`bounce 1s ${i*0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height:16 }}/>
        </div>

        <div style={{ padding:"12px 16px",paddingBottom:"calc(80px + env(safe-area-inset-bottom,0px))",
          background:theme.card,borderTop:`1px solid ${theme.border}` }}>
          <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
            <button onClick={()=>setRecording(r=>!r)}
              style={{ width:42,height:42,borderRadius:21,border:"none",flexShrink:0,
                background:recording?C.red:`${C.orange}20`,
                color:recording?"#fff":C.orange,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
              {recording?<MicOff size={19}/>:<Mic size={19}/>}
            </button>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send(input))}
              placeholder="Xabar yozing..."
              rows={1}
              style={{ flex:1,padding:"10px 14px",borderRadius:20,
                border:`1.5px solid ${theme.border}`,background:theme.card2,
                color:theme.text,fontSize:15,outline:"none",resize:"none",
                fontFamily:"inherit",maxHeight:100,boxSizing:"border-box",lineHeight:1.4 }}/>
            <button onClick={()=>send(input)} disabled={!input.trim()||loading}
              style={{ width:42,height:42,borderRadius:21,border:"none",flexShrink:0,
                background:input.trim()&&!loading?C.orange:theme.card2,
                color:input.trim()&&!loading?"#fff":theme.text2,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Send size={18}/>
            </button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// AI ADVICE
// ═══════════════════════════════════════════════════
function AIAdviceScreen({ theme, data, user }) {
  const [active, setActive] = useState(null);
  const [advice, setAdvice] = useState({});
  const [loading, setLoading] = useState({});

  const m = new Date().getMonth();
  const income  = data.finances.filter(f=>f.type==="income" &&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const expense = data.finances.filter(f=>f.type==="expense"&&new Date(f.date).getMonth()===m).reduce((s,f)=>s+f.amount,0);
  const pending = data.tasks.filter(t=>t.status==="pending").length;

  const sections = [
    { key:"finance",   icon:"💰", label:"Moliyaviy maslahat",   color:C.orange,
      prompt:`${user.name} uchun moliyaviy maslahat. Kirim: ${income.toLocaleString()} so'm, Chiqim: ${expense.toLocaleString()} so'm. ${expense>income?"OGOHLANTIRISH: Harajatlar kirimdan oshib ketgan!":""} Qisqa va amaliy maslahat ber.` },
    { key:"tasks",     icon:"✅", label:"Vazifalar bo'yicha",    color:C.green,
      prompt:`${user.name}da ${pending} ta bajarilmagan vazifa bor. Vazifalarni samarali bajarish haqida maslahat ber.` },
    { key:"reminders", icon:"🔔", label:"Eslatmalar bo'yicha",   color:C.blue,
      prompt:`${user.name}da ${data.reminders.length} ta eslatma bor. Eslatmalarni qanday yaxshiroq boshqarish haqida maslahat ber.` },
    { key:"summary",   icon:"📊", label:"Umumiy tahlil",         color:C.purple,
      prompt:`${user.name} uchun umumiy holat tahlili: Kirim ${income.toLocaleString()} so'm, Chiqim ${expense.toLocaleString()} so'm, ${data.reminders.length} eslatma, ${pending} vazifa. Tahlil va tavsiyalar ber.` },
  ];

  const getAdvice = async s => {
    if (advice[s.key]) { setActive(k=>k===s.key?null:s.key); return; }
    setActive(s.key); setLoading(l=>({...l,[s.key]:true}));
    try {
      const res = await fetch("/groq/openai/v1/chat/completions",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"llama-3.3-70b-versatile",
          max_tokens:1000,
          messages:[
            {role:"system", content:"O'zbek tilida qisqa va amaliy maslahat beruvchi shaxsiy moliyaviy asistent. Markdown ishlatma. Rag'batlantiruvchi va do'stona ton."},
            {role:"user", content:s.prompt}
          ]
        })
      });
      const d = await res.json();
      setAdvice(a=>({...a,[s.key]:d.choices?.[0]?.message?.content||"Xatolik."}));
    } catch {
      setAdvice(a=>({...a,[s.key]:"Internet xatosi. Qaytadan urinib ko'ring."}));
    }
    setLoading(l=>({...l,[s.key]:false}));
  };

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:`${C.orange}20`,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Sparkles size={22} color={C.orange}/>
          </div>
          <div>
            <h2 style={{ fontSize:22,fontWeight:800,color:theme.text,margin:0 }}>AI Maslahatlari</h2>
            <p style={{ color:theme.text2,fontSize:13,margin:0 }}>Shaxsiy yordamchi</p>
          </div>
        </div>

        {expense>income&&income>0&&(
          <Card theme={theme} style={{ marginBottom:14,background:`${C.red}15`,borderColor:`${C.red}40` }}>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <AlertTriangle size={20} color={C.red}/>
              <p style={{ margin:0,fontSize:14,color:theme.text }}>
                <strong style={{ color:C.red }}>{user.name}</strong>, harajatlaringiz kirimingizdan oshib ketyapti!
              </p>
            </div>
          </Card>
        )}

        {sections.map(s=>(
          <div key={s.key}>
            <Card theme={theme} onClick={()=>getAdvice(s)}
              style={{ marginBottom:active===s.key?0:12, borderColor:active===s.key?s.color:theme.border,
                borderBottomLeftRadius:active===s.key?0:16, borderBottomRightRadius:active===s.key?0:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:`${s.color}20`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
                  {s.icon}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0,fontWeight:700,fontSize:15,color:theme.text }}>{s.label}</p>
                  <p style={{ margin:"2px 0 0",fontSize:12,color:theme.text2 }}>
                    {loading[s.key]?"Yuklanmoqda...":advice[s.key]?"Maslahat tayyor":"Bosib maslahat oling"}
                  </p>
                </div>
                <ChevronDown size={18} color={theme.text2}
                  style={{ transform:active===s.key?"rotate(180deg)":"rotate(0)",transition:"transform 0.3s" }}/>
              </div>
            </Card>
            {active===s.key&&(
              <Card theme={theme} style={{ marginBottom:14,borderRadius:"0 0 16px 16px",
                background:`${s.color}08`,borderColor:`${s.color}30`,borderTopWidth:0 }}>
                {loading[s.key]
                  ? <div style={{ display:"flex",gap:6,padding:8 }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:4,background:theme.text2,animation:`bounce 1s ${i*0.2}s infinite` }}/>)}
                    </div>
                  : <p style={{ margin:0,fontSize:14,color:theme.text,lineHeight:1.65,whiteSpace:"pre-wrap" }}>
                      {advice[s.key]}
                    </p>
                }
              </Card>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════
function SettingsScreen({ theme, user, onLogout }) {
  const [showPin, setShowPin] = useState(false);

  if (showPin) return (
    <PINScreen theme={theme} title="Yangi PIN kod" confirm
      onDone={p=>{ LS.set("kotiba_pin_"+user.phone, p); setShowPin(false); }}/>
  );

  return (
    <Screen theme={theme}>
      <div style={{ padding:"52px 16px 100px" }}>
        <h2 style={{ fontSize:22,fontWeight:800,color:theme.text,margin:"0 0 22px" }}>⚙️ Sozlamalar</h2>

        <Card theme={theme} style={{ marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <BotAvatar size={50}/>
            <div>
              <p style={{ margin:0,fontWeight:700,fontSize:17,color:theme.text }}>{user.name}</p>
              <p style={{ margin:"2px 0 0",fontSize:14,color:theme.text2 }}>{user.phone}</p>
            </div>
          </div>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <Card theme={theme}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,
                  background:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {theme.dark?<Moon size={17} color={C.purple}/>:<Sun size={17} color={C.yellow}/>}
                </div>
                <p style={{ margin:0,fontWeight:600,fontSize:15,color:theme.text }}>
                  {theme.dark?"Tungi rejim":"Kunduzgi rejim"}
                </p>
              </div>
              <button onClick={theme.toggle}
                style={{ width:48,height:27,borderRadius:14,border:"none",cursor:"pointer",
                  position:"relative",background:theme.dark?C.purple:theme.border,transition:"background 0.3s" }}>
                <div style={{ width:21,height:21,borderRadius:11,background:"#fff",
                  position:"absolute",top:3,left:theme.dark?24:3,transition:"left 0.3s",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
              </button>
            </div>
          </Card>

          <Card theme={theme} onClick={()=>setShowPin(true)} style={{ cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:`${C.orange}20`,
                  display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Lock size={17} color={C.orange}/>
                </div>
                <p style={{ margin:0,fontWeight:600,fontSize:15,color:theme.text }}>PIN kodni o'zgartirish</p>
              </div>
              <ChevronRight size={17} color={theme.text2}/>
            </div>
          </Card>

          <Card theme={theme}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:`${C.blue}20`,
                  display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Bell size={17} color={C.blue}/>
                </div>
                <div>
                  <p style={{ margin:0,fontWeight:600,fontSize:15,color:theme.text }}>Bildirishnomalar</p>
                  <p style={{ margin:"2px 0 0",fontSize:12,color:theme.text2 }}>Brauzerlarga ruxsat</p>
                </div>
              </div>
              <button onClick={()=>typeof Notification!=="undefined"&&Notification.requestPermission()}
                style={{ background:`${C.blue}20`,border:"none",borderRadius:8,padding:"7px 12px",
                  color:C.blue,cursor:"pointer",fontSize:13,fontWeight:600 }}>
                Ruxsat
              </button>
            </div>
          </Card>

          <Card theme={theme} onClick={onLogout} style={{ cursor:"pointer",borderColor:`${C.red}40` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:`${C.red}20`,
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <LogOut size={17} color={C.red}/>
              </div>
              <p style={{ margin:0,fontWeight:600,fontSize:15,color:C.red }}>Chiqish</p>
            </div>
          </Card>
        </div>

        <p style={{ color:theme.text2,fontSize:12,textAlign:"center",marginTop:32 }}>
          Kotiba AI v1.0.0 • © 2026
        </p>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// VOICE MODAL — real Web Speech API + Groq AI
// ═══════════════════════════════════════════════════
function VoiceModal({ theme, onClose, onCommand }) {
  const [state, setState]         = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError]         = useState("");
  const recognitionRef            = useRef(null);

  const stop = () => {
    recognitionRef.current?.stop();
  };

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Brauzeringiz ovoz tanishni qo'llab-quvvatlamaydi. Chrome yoki Edge ishlating.");
      return;
    }
    setError(""); setTranscript("");
    const rec = new SR();
    rec.lang            = "ru-RU";
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setState("recording");
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setState("processing");
        rec.stop();
      }
    };
    rec.onerror = ev => {
      if (ev.error === "no-speech") setError("Ovoz eshitilmadi. Qaytadan urinib ko'ring.");
      else setError("Xato: " + ev.error);
      setState("idle");
    };
    rec.onend = () => {
      if (state === "recording") setState("idle");
    };
    recognitionRef.current = rec;
    rec.start();
  };

  // When transcript is final — send to Groq
  useEffect(() => {
    if (state !== "processing" || !transcript) return;
    const today = new Date().toISOString().split("T")[0];
    const prompt = `Foydalanuvchi ovoz buyrug'i: "${transcript}"

Quyidagi JSON formatida qaytaring (boshqa hech narsa yozmang):
{
  "action": "navigate" | "add_task" | "add_reminder" | "add_finance" | "query",
  "screen": "home" | "reminders" | "finance" | "tasks" | "settings" | "guide" | "ai-chat",
  "text": "vazifa yoki eslatma matni",
  "date": "YYYY-MM-DD yoki null",
  "time": "HH:MM yoki null",
  "type": "income" | "expense",
  "amount": 0,
  "category": "food|trans|utility|clothes|health|edu|fun|other|salary|biz|debt|bonus",
  "note": "izoh",
  "reply": "foydalanuvchiga qisqa javob o'zbek tilida"
}

Bugun: ${today}. Navigatsiya so'zlari: bosh/home, eslatma/reminders, moliya/finance, vazifa/tasks, sozlama/settings, yordam/guide. Misollar:
- "Vazifa qo'sh: hisobot yozish" → add_task
- "Eslatma qo'sh ertaga soat 3 da uchrashuv" → add_reminder  
- "200 ming so'm kirim qo'sh maosh" → add_finance income
- "Moliya ekraniga o't" → navigate finance
- "Bugungi balansim qancha?" → query`;

    fetch("/groq/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    })
      .then(r => r.json())
      .then(d => {
        const raw = d.choices?.[0]?.message?.content || "{}";
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        onCommand(parsed, transcript);
        setState("done");
        setTranscript(parsed.reply || transcript);
      })
      .catch(() => {
        setError("Tarmoq xatosi. Internetni tekshiring.");
        setState("idle");
      });
  // eslint-disable-next-line
  }, [state]);

  const stateColor = state === "recording" ? C.red : C.orange;

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,
      display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div style={{ width:"100%",maxWidth:430,background:theme.card,
        borderRadius:"24px 24px 0 0",padding:"20px 24px 44px",animation:"slideUp 0.3s ease" }}>
        <div style={{ width:36,height:4,borderRadius:2,background:theme.border,margin:"0 auto 20px" }}/>
        <h3 style={{ textAlign:"center",color:theme.text,fontWeight:700,fontSize:17,margin:"0 0 6px" }}>
          🎙 Ovozli buyruq
        </h3>
        <p style={{ textAlign:"center",color:theme.text2,fontSize:12,margin:"0 0 20px" }}>
          O'zbek yoki rus tilida gapiring
        </p>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
          {/* mic circle */}
          <div style={{ width:96,height:96,borderRadius:48,
            background:`${stateColor}18`,display:"flex",alignItems:"center",justifyContent:"center",
            animation:state==="recording"?"pulse 1s ease-in-out infinite":"none",
            border:`3px solid ${stateColor}`,transition:"all 0.3s" }}>
            {state==="recording"
              ? <MicOff size={38} color={C.red}/>
              : state==="processing"
                ? <div style={{ width:28,height:28,borderRadius:14,border:`3px solid ${C.orange}`,
                    borderTopColor:"transparent",animation:"spin 0.8s linear infinite" }}/>
                : <Mic size={38} color={C.orange}/>
            }
          </div>

          {/* status text */}
          <p style={{ color:theme.text2,fontSize:14,textAlign:"center",minHeight:40,
            padding:"0 16px",lineHeight:1.5 }}>
            {error ? <span style={{ color:C.red }}>{error}</span>
             : state==="idle"     ? "Tugmani bosing va gapiring"
             : state==="recording"? "🔴 Eshityapman... (to'xtatish uchun qayta bosing)"
             : state==="processing"? "🤖 AI tahlil qilmoqda..."
             : <span style={{ color:C.green }}>✅ {transcript}</span>}
          </p>

          {/* transcript preview while recording */}
          {state==="recording" && transcript && (
            <div style={{ width:"100%",background:theme.card2,borderRadius:12,padding:"10px 14px" }}>
              <p style={{ color:theme.text,fontSize:14,margin:0 }}>{transcript}</p>
            </div>
          )}

          {/* buttons */}
          {(state==="idle"||state==="done") && (
            <Btn onClick={start} color={C.orange}>
              {state==="done" ? "🔄 Qaytadan" : "🎙 Yozishni boshlash"}
            </Btn>
          )}
          {state==="recording" && (
            <Btn onClick={stop} color={C.red}>⏹ To'xtatish</Btn>
          )}
          {state==="done" && (
            <Btn onClick={onClose} color={C.green}>✅ Yopish</Btn>
          )}
          <button onClick={()=>{ stop(); onClose(); }}
            style={{ background:"none",border:"none",color:theme.text2,cursor:"pointer",fontSize:14 }}>
            Bekor qilish
          </button>
        </div>

        {/* quick commands hint */}
        {state==="idle" && (
          <div style={{ marginTop:20,background:theme.card2,borderRadius:14,padding:"12px 14px" }}>
            <p style={{ color:theme.text2,fontSize:11,margin:"0 0 8px",fontWeight:600 }}>MISOL BUYRUQLAR:</p>
            {[
              "Vazifa qo'sh: hisobot yozish",
              "Moliya ekraniga o't",
              "200 ming so'm kirim qo'sh",
              "Eslatma: soat 3 da uchrashuv",
            ].map((ex,i) => (
              <p key={i} style={{ color:theme.text,fontSize:12,margin:"4px 0",
                padding:"4px 8px",background:theme.bg,borderRadius:8 }}>
                💬 "{ex}"
              </p>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GUIDE SCREEN — Yo'riqnoma
// ═══════════════════════════════════════════════════
function GuideScreen({ theme }) {
  const sections = [
    {
      icon:"🎙", title:"Ovozli buyruqlar",
      color: C.orange,
      items:[
        { cmd:"Vazifa qo'sh: [matn]",       desc:"Yangi vazifa qo'shadi" },
        { cmd:"Eslatma: [matn]",             desc:"Eslatma yaratadi" },
        { cmd:"[miqdor] so'm kirim qo'sh",   desc:"Daromad qo'shadi" },
        { cmd:"[miqdor] so'm chiqim qo'sh",  desc:"Xarajat qo'shadi" },
        { cmd:"[ekran nomi] ekraniga o't",   desc:"Ekran almashtiradi" },
        { cmd:"Bugungi balansim qancha?",     desc:"AI javob beradi" },
      ]
    },
    {
      icon:"📋", title:"Vazifalar",
      color: C.blue,
      items:[
        { cmd:"+ Yangi vazifa",   desc:"Qo'shish tugmasi orqali yangi vazifa" },
        { cmd:"✅ belgisi",       desc:"Vazifani bajarilgan deb belgilash" },
        { cmd:"🗑 tugmasi",      desc:"Vazifani o'chirish" },
        { cmd:"Muddatni tanlash", desc:"Sanani belgilang" },
      ]
    },
    {
      icon:"💰", title:"Moliya",
      color: C.green,
      items:[
        { cmd:"Kirim / Chiqim",    desc:"Tranzaksiya turini tanlang" },
        { cmd:"Kategoriya",        desc:"Oziq-ovqat, transport va h.k." },
        { cmd:"UZS / USD",         desc:"Valyutani tanlash imkoniyati" },
        { cmd:"Grafik",            desc:"Oylik xarajatlar diagrammasi" },
      ]
    },
    {
      icon:"🔔", title:"Eslatmalar",
      color: C.purple,
      items:[
        { cmd:"Sana va vaqt",      desc:"Eslatma vaqtini belgilang" },
        { cmd:"Takrorlanish",      desc:"Har kuni / hafta / oy" },
        { cmd:"Bildirishnoma",     desc:"Push yoki SMS" },
      ]
    },
    {
      icon:"🤖", title:"AI Yordamchi",
      color: C.blue,
      items:[
        { cmd:"AI Chat",           desc:"Istalgan savol bering" },
        { cmd:"Moliyaviy maslahat",desc:"Xarajatlaringizni tahlil qiladi" },
        { cmd:"Reja",              desc:"Oylik byudjet rejasi" },
      ]
    },
    {
      icon:"⚙️", title:"Sozlamalar",
      color: C.textSecondary,
      items:[
        { cmd:"PIN kod",           desc:"Xavfsizlik uchun PIN o'rnating" },
        { cmd:"Mavzu",             desc:"Qorong'u / Yorug' rejim" },
        { cmd:"Chiqish",           desc:"Hisobdan chiqish" },
      ]
    },
  ];

  return (
    <Screen theme={theme}>
      <div style={{ padding:"60px 20px 100px" }}>
        {/* header */}
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ fontSize:48,marginBottom:8 }}>📖</div>
          <h1 style={{ fontSize:24,fontWeight:800,color:theme.text,margin:"0 0 8px" }}>
            Kotiba AI Yo'riqnoma
          </h1>
          <p style={{ color:theme.text2,fontSize:14,lineHeight:1.5 }}>
            Ilovadan to'g'ri foydalanish uchun quyidagi qo'llanmani o'qing
          </p>
        </div>

        {/* PWA install tip */}
        <div style={{ background:`${C.orange}15`,border:`1px solid ${C.orange}40`,
          borderRadius:16,padding:"14px 16px",marginBottom:20,
          display:"flex",gap:12,alignItems:"flex-start" }}>
          <span style={{ fontSize:22 }}>📱</span>
          <div>
            <p style={{ color:C.orange,fontWeight:700,fontSize:13,margin:"0 0 4px" }}>
              Telefonga o'rnatish
            </p>
            <p style={{ color:theme.text2,fontSize:12,margin:0,lineHeight:1.5 }}>
              Chrome → ⋮ menyu → "Bosh ekranga qo'shish" — ilovani telefon ilovasi sifatida ishlatishingiz mumkin
            </p>
          </div>
        </div>

        {/* voice tip */}
        <div style={{ background:`${C.green}15`,border:`1px solid ${C.green}40`,
          borderRadius:16,padding:"14px 16px",marginBottom:24,
          display:"flex",gap:12,alignItems:"flex-start" }}>
          <span style={{ fontSize:22 }}>🎙</span>
          <div>
            <p style={{ color:C.green,fontWeight:700,fontSize:13,margin:"0 0 4px" }}>
              Ovozli boshqaruv
            </p>
            <p style={{ color:theme.text2,fontSize:12,margin:0,lineHeight:1.5 }}>
              Bosh ekrandagi sariq mikrofon tugmasini bosing va o'zbek tilida buyruq bering. AI buyruqni tushunib, kerakli amalni bajaradi.
            </p>
          </div>
        </div>

        {/* sections */}
        {sections.map((sec,si) => (
          <div key={si} style={{ marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:`${sec.color}20`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                {sec.icon}
              </div>
              <h2 style={{ fontSize:16,fontWeight:700,color:theme.text,margin:0 }}>{sec.title}</h2>
            </div>
            <div style={{ background:theme.card,borderRadius:16,overflow:"hidden",
              border:`1px solid ${theme.border}` }}>
              {sec.items.map((item,ii) => (
                <div key={ii} style={{ padding:"12px 16px",
                  borderBottom:ii<sec.items.length-1?`1px solid ${theme.border}`:"none",
                  display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:13,fontWeight:600,color:sec.color,flex:"0 0 auto",
                    background:`${sec.color}15`,padding:"4px 10px",borderRadius:8 }}>
                    {item.cmd}
                  </span>
                  <span style={{ fontSize:12,color:theme.text2,textAlign:"right" }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* footer */}
        <div style={{ textAlign:"center",marginTop:28,padding:"20px",
          background:theme.card,borderRadius:16 }}>
          <p style={{ color:theme.text2,fontSize:12,margin:0,lineHeight:1.6 }}>
            🤖 <strong style={{ color:theme.text }}>Kotiba AI</strong> — shaxsiy moliya va vaqtni boshqarish yordamchingiz.{"\n"}
            Savollar uchun AI Chat ga murojaat qiling.
          </p>
        </div>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
export default function KotibaAI() {
  const theme = useTheme();
  const [authStage, setAuthStage] = useState(()=>{
    const u = LS.get("kotiba_current_user");
    return u?"pin-login":"register";
  });
  const [pendingUser, setPendingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(()=>LS.get("kotiba_current_user"));
  const [screen, setScreen] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [toast, setToast] = useState(null);
  const [showVoice, setShowVoice] = useState(false);

  // ─── PER-USER DATA ───────────────────────────────
  const [data, setDataRaw] = useState({ reminders:[], finances:[], tasks:[] });

  // Load data when user is known
  useEffect(()=>{
    if (currentUser?.phone) setDataRaw(loadUserData(currentUser.phone));
  },[currentUser?.phone]);

  // Persist data under user's phone key
  const setData = updater => {
    setDataRaw(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      if (currentUser?.phone) {
        LS.set(uKey(currentUser.phone,"reminders"), next.reminders);
        LS.set(uKey(currentUser.phone,"finances"),  next.finances);
        LS.set(uKey(currentUser.phone,"tasks"),     next.tasks);
      }
      return next;
    });
  };
  // ─────────────────────────────────────────────────

  const showToast = (msg,type="info") => setToast({msg,type});

  // AUTH
  const handleOTP  = u => { setPendingUser(u); setAuthStage("otp"); };
  const handleLoginOTP = u => { setPendingUser(u); setAuthStage("otp"); };

  const handleOTPSuccess = u => {
    if (u.isNew) { setPendingUser(u); setAuthStage("pin-setup"); }
    else { setPendingUser(u); setAuthStage("pin-login-new"); }
  };

  const handlePINSetup = pin => {
    LS.set("kotiba_pin_"+pendingUser.phone, pin);
    const users = LS.get("kotiba_users",[]);
    if (!users.find(x=>x.phone===pendingUser.phone)) users.push(pendingUser);
    LS.set("kotiba_users", users);
    LS.set("kotiba_current_user", pendingUser);
    setCurrentUser(pendingUser);
    setIsFirstTime(true); setShowWelcome(true); setAuthStage("app");
  };

  const handlePINLogin = pin => {
    const user = LS.get("kotiba_current_user") || pendingUser;
    const saved = LS.get("kotiba_pin_"+user?.phone,"");
    if (pin===saved||saved==="") {
      setCurrentUser(user); setIsFirstTime(false); setShowWelcome(true); setAuthStage("app");
    } else {
      showToast("Noto'g'ri PIN kod!","error");
    }
  };

  const handleLogout = () => {
    LS.set("kotiba_current_user",null);
    setCurrentUser(null); setAuthStage("register"); setScreen("home");
  };

  const w = { maxWidth:430,margin:"0 auto",position:"relative",
    height:"100vh",overflowY:"auto",overflowX:"hidden",
    fontFamily:"'SF Pro Display',-apple-system,system-ui,sans-serif" };

  const css = `
    @keyframes fadeInUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-18px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,69,58,0.4)}50%{box-shadow:0 0 0 18px rgba(255,69,58,0)}}
    @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
    @keyframes float{from{transform:translateY(0)}to{transform:translateY(-18px)}}
    *{-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{display:none}
    input,textarea,select{color-scheme:${theme.dark?"dark":"light"}}
  `;

  // AUTH SCREENS
  if (authStage==="register") return (
    <div style={w}><style>{css}</style>
      <RegisterScreen theme={theme} onOTP={handleOTP} onLogin={()=>setAuthStage("login")}/>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (authStage==="login") return (
    <div style={w}><style>{css}</style>
      <Screen theme={theme}>
        <div style={{ padding:"60px 24px 40px",display:"flex",flexDirection:"column",gap:28 }}>
          <button onClick={()=>setAuthStage("register")} style={{ background:"none",border:"none",
            cursor:"pointer",color:theme.text2,display:"flex",alignItems:"center",gap:6,fontSize:14 }}>
            <ArrowLeft size={18}/> Orqaga
          </button>
          <div style={{ textAlign:"center" }}>
            <BotAvatar size={68}/>
            <h2 style={{ fontSize:24,fontWeight:800,color:theme.text,marginTop:14 }}>Kirish</h2>
          </div>
          <LoginForm theme={theme} onOTP={handleLoginOTP}/>
        </div>
      </Screen>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (authStage==="otp") return (
    <div style={w}><style>{css}</style>
      <OTPScreen theme={theme} data={pendingUser} onSuccess={handleOTPSuccess}
        onBack={()=>setAuthStage(pendingUser?.isNew?"register":"login")}/>
    </div>
  );

  if (authStage==="pin-setup") return (
    <div style={w}><style>{css}</style>
      <PINScreen theme={theme} title="PIN kod o'rnating" confirm onDone={handlePINSetup}/>
    </div>
  );

  if (authStage==="pin-login"||authStage==="pin-login-new") return (
    <div style={w}><style>{css}</style>
      <PINScreen theme={theme}
        title={`Xush kelibsiz, ${(LS.get("kotiba_current_user")||pendingUser)?.name||""}!`}
        onDone={handlePINLogin}/>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  // VOICE COMMAND HANDLER
  const handleVoiceCommand = (parsed, originalText) => {
    const today = new Date().toISOString().split("T")[0];
    const screenMap = {
      home:"home", bosh:"home",
      reminders:"reminders", eslatma:"reminders",
      finance:"finance", moliya:"finance",
      tasks:"tasks", vazifa:"tasks",
      settings:"settings", sozlama:"settings",
      guide:"guide", yordam:"guide", "yo'riqnoma":"guide",
      "ai-chat":"ai-chat", chat:"ai-chat",
    };

    switch(parsed.action) {
      case "navigate": {
        const dest = screenMap[parsed.screen?.toLowerCase()] || parsed.screen;
        if (dest) { setScreen(dest); showToast(`✅ ${parsed.reply || dest+" ekraniga o'tildi"}`,"success"); }
        break;
      }
      case "add_task":
        setData(d => ({...d, tasks:[...d.tasks,{
          id:Date.now(), text:parsed.text||originalText,
          deadline:parsed.date||today, status:"pending"
        }]}));
        showToast("✅ " + (parsed.reply||"Vazifa qo'shildi!"), "success");
        setScreen("tasks");
        break;
      case "add_reminder":
        setData(d => ({...d, reminders:[...d.reminders,{
          id:Date.now(), text:parsed.text||originalText,
          date:parsed.date||today, time:parsed.time||"09:00",
          repeat:"1 marta", notif:"Push"
        }]}));
        showToast("✅ " + (parsed.reply||"Eslatma qo'shildi!"), "success");
        setScreen("reminders");
        break;
      case "add_finance":
        setData(d => ({...d, finances:[...d.finances,{
          id:Date.now(), type:parsed.type||"expense",
          amount:parsed.amount||0, currency:"UZS",
          category:parsed.category||"other",
          note:parsed.note||originalText, date:today
        }]}));
        showToast("✅ " + (parsed.reply||(parsed.type==="income"?"Kirim":"Chiqim")+" qo'shildi!"), "success");
        setScreen("finance");
        break;
      case "query":
        showToast("🤖 " + (parsed.reply||"AI javob bermoqda..."), "info");
        setScreen("ai-chat");
        break;
      default:
        showToast(parsed.reply||"Buyruq bajarildi ✅", "success");
    }
  };

  // MAIN APP
  const navScreens = ["home","reminders","finance","tasks","guide","settings"];

  const renderScreen = () => {
    switch(screen) {
      case "home":      return <Dashboard theme={theme} user={currentUser} data={data} onNav={setScreen} onVoice={()=>setShowVoice(true)} recording={false}/>;
      case "reminders": return <RemindersScreen theme={theme} data={data} setData={setData} showToast={showToast}/>;
      case "finance":   return <FinanceScreen theme={theme} data={data} setData={setData} showToast={showToast}/>;
      case "tasks":     return <TasksScreen theme={theme} data={data} setData={setData} showToast={showToast}/>;
      case "settings":  return <SettingsScreen theme={theme} user={currentUser} onLogout={handleLogout}/>;
      case "guide":     return <GuideScreen theme={theme}/>;
      case "ai-chat":
        return (
          <div>
            <button onClick={()=>setScreen("home")}
              style={{ position:"fixed",top:12,left:16,zIndex:100,background:theme.card2,
                border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",
                color:theme.text2,display:"flex",alignItems:"center",gap:4,fontSize:13 }}>
              <ArrowLeft size={15}/> Orqaga
            </button>
            <AIChatScreen theme={theme} user={currentUser} data={data} setData={setData} showToast={showToast}/>
          </div>
        );
      case "ai-advice":
        return (
          <div>
            <button onClick={()=>setScreen("home")}
              style={{ position:"fixed",top:12,left:16,zIndex:100,background:theme.card2,
                border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",
                color:theme.text2,display:"flex",alignItems:"center",gap:4,fontSize:13 }}>
              <ArrowLeft size={15}/> Orqaga
            </button>
            <AIAdviceScreen theme={theme} data={data} user={currentUser} showToast={showToast}/>
          </div>
        );
      default: return <Dashboard theme={theme} user={currentUser} data={data} onNav={setScreen} onVoice={()=>setShowVoice(true)} recording={false}/>;
    }
  };

  return (
    <div style={w}>
      <style>{css}</style>
      {showWelcome && (
        <WelcomeScreen theme={theme} user={currentUser} data={data}
          isFirstTime={isFirstTime} onDone={()=>setShowWelcome(false)}/>
      )}
      {renderScreen()}
      {navScreens.includes(screen)&&(
        <BottomNav active={screen} onChange={setScreen} theme={theme}/>
      )}
      {showVoice&&(
        <VoiceModal theme={theme} onClose={()=>setShowVoice(false)}
          onCommand={(parsed, text)=>{ handleVoiceCommand(parsed, text); setShowVoice(false); }}/>
      )}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
