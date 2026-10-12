import { GiftOption } from './types';

export const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
export const ROOM_TOPIC = 'dardashti_stars_app_2026_v25';

export const ADMIN_NAME = 'sasa';
export const GIFT_COST = 5;
export const TTT_COMMISSION = 2;
export const ROOM_SEAT_COUNT = 8;

export const GIFTS: GiftOption[] = [
  { e: '🌹', n: 'وردة حمراء', cost: 5 },
  { e: '🪙', n: 'عملة ذهبية', cost: 5 },
  { e: '🎁', n: 'صندوق مفاجأة', cost: 5 },
  { e: '⚡', n: 'صاعقة النجوم', cost: 5 },
  { e: '🏆', n: 'كأس البطولة', cost: 5 },
  { e: '💎', n: 'ماسة فاخرة', cost: 5 },
  { e: '👑', n: 'تاج الملوك', cost: 10 },
  { e: '🚀', n: 'صاروخ المجرة', cost: 15 },
];

export const DIAMOND_LEVELS = [
  { min: 0, name: '🌱 بداية النجم' },
  { min: 1000, name: '⭐ نجمة صغيرة' },
  { min: 3000, name: '✨ نجمة لامعة' },
  { min: 6000, name: '🌙 قمر ساطع' },
  { min: 10000, name: '☀️ شمس مشرقة' },
  { min: 15000, name: '👑 ملكة النجوم' },
  { min: 21000, name: '💎 أميرة الماس' },
  { min: 28000, name: '💠 إمبراطورة الماس' },
  { min: 36000, name: '🔥 أسطورة الماس' },
  { min: 45000, name: '🌌 سيدة المجرات' },
  { min: 55000, name: '🏆 أسطورة النجوم' }
];

export const ROOM_BGS = [
  { id: 'purple', name: '🌌 سماء المجرة', css: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #701a75 100%)' },
  { id: 'ocean', name: '🌊 أعماق المحيط', css: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0e7490 100%)' },
  { id: 'sunset', name: '🌅 شفق الغروب', css: 'linear-gradient(135deg, #451a03 0%, #9a3412 50%, #c2410c 100%)' },
  { id: 'forest', name: '🌿 واحة الطبيعة', css: 'linear-gradient(135deg, #052e16 0%, #166534 50%, #15803d 100%)' },
  { id: 'royal', name: '🌸 القصر الوردي', css: 'linear-gradient(135deg, #500724 0%, #9d174d 50%, #db2777 100%)' },
  { id: 'dark', name: '🖤 أسود ملكي', css: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)' },
];

export const QUICK_EMOJIS = ['😀', '😂', '😍', '😎', '🔥', '💜', '🌹', '⭐', '✨', '🎉', '👑', '🙏', '😭', '🤣', '❤️', '👋', '👏', '🥳'];
