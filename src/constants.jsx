import React from 'react';
import {
  ShoppingCart, Car, Wifi, Package, Heart, Book, Coffee,
  Wallet, TrendingUp, RefreshCw, Gift,
} from 'lucide-react';

export const COLORS = {
  orange:       '#FF9F0A',
  green:        '#30D158',
  blue:         '#0A84FF',
  red:          '#FF453A',
  yellow:       '#FFD60A',
  purple:       '#BF5AF2',
  bgDark:       '#0F0F11',
  cardDark:     '#1C1C1E',
  card2Dark:    '#2C2C2E',
  textPrimary:  '#FFFFFF',
  textSecondary:'#8E8E93',
  bgLight:      '#F2F2F7',
  cardLight:    '#FFFFFF',
  card2Light:   '#F2F2F7',
  borderDark:   '#3A3A3C',
  borderLight:  '#D1D1D6',
};

export const EXPENSE_CATS = [
  { id:'food',    name:"Oziq-ovqat",   icon:<ShoppingCart size={16}/>, color:COLORS.orange },
  { id:'trans',   name:"Transport",    icon:<Car size={16}/>,          color:COLORS.blue   },
  { id:'utility', name:"Kommunal",     icon:<Wifi size={16}/>,         color:COLORS.yellow },
  { id:'clothes', name:"Kiyim",        icon:<Package size={16}/>,      color:COLORS.purple },
  { id:'health',  name:"Sog'liq",      icon:<Heart size={16}/>,        color:COLORS.red    },
  { id:'edu',     name:"Ta'lim",       icon:<Book size={16}/>,         color:COLORS.green  },
  { id:'fun',     name:"Ko'ngilochar", icon:<Coffee size={16}/>,       color:COLORS.purple },
  { id:'other',   name:"Boshqa",       icon:<Package size={16}/>,      color:COLORS.textSecondary },
];

export const INCOME_CATS = [
  { id:'salary', name:"Oylik maosh",    icon:<Wallet size={16}/>,    color:COLORS.green  },
  { id:'biz',    name:"Biznes",         icon:<TrendingUp size={16}/>, color:COLORS.blue   },
  { id:'debt',   name:"Qarz qaytarish", icon:<RefreshCw size={16}/>,  color:COLORS.orange },
  { id:'bonus',  name:"Bonus/Sovg'a",   icon:<Gift size={16}/>,       color:COLORS.yellow },
  { id:'other',  name:"Boshqa",         icon:<Package size={16}/>,    color:COLORS.textSecondary },
];

export const REPEAT_OPTIONS = ['1 marta', 'Har kuni', 'Har hafta', 'Har oy'];
export const NOTIF_OPTIONS  = ['Push', 'SMS', 'Push + SMS'];
