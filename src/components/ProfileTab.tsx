import React, { useRef } from 'react';
import {
  Coins,
  Crown,
  Shield,
  Copy,
  Gamepad2,
  Gift,
  Flame,
  CheckCircle,
  Edit3,
  Award,
  LogOut,
  Camera,
  Gem,
} from 'lucide-react';
import { UserAccount } from '../types';
import { DIAMOND_LEVELS } from '../constants';

interface ProfileTabProps {
  currentUser: string;
  account: UserAccount | undefined;
  coins: number;
  onOpenGames: () => void;
  onOpenInvite: () => void;
  onOpenLevels: () => void;
  onOpenEditProfile: () => void;
  onShowToast: (msg: string) => void;
  onLogout: () => void;
  onChangeAvatar: (file: File) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  account,
  coins,
  onOpenGames,
  onOpenInvite,
  onOpenLevels,
  onOpenEditProfile,
  onShowToast,
  onLogout,
  onChangeAvatar,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isFemale = account?.gender?.includes('أنثى');
  const diamonds = account?.diamonds || 0;

  // Calculate level
  let currentLevelIdx = 0;
  for (let i = DIAMOND_LEVELS.length - 1; i >= 0; i--) {
    if (diamonds >= DIAMOND_LEVELS[i].min) {
      currentLevelIdx = i;
      break;
    }
  }
  const currentLevel = DIAMOND_LEVELS[currentLevelIdx];
  const nextLevel = DIAMOND_LEVELS[currentLevelIdx + 1];

  const handleCopyId = () => {
    if (account?.idNum) {
      navigator.clipboard?.writeText(account.idNum);
      onShowToast(`📋 تم نسخ رقم الـ ID: ${account.idNum}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChangeAvatar(file);
    }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const roleText = account?.isAdmin
    ? 'أدمن رئيسي 👑'
    : account?.isMod
    ? 'مساعد أدمن 🛡️'
    : 'عضو مميز ⭐';

  return (
    <div className="space-y-4 pb-20">
      {/* Luxury Profile Hero */}
      <div className="rounded-3xl bg-gradient-to-b from-purple-900/80 via-slate-900 to-slate-950 border border-purple-500/30 p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Avatar with edit badge */}
        <div className="relative inline-block mx-auto mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 shadow-xl shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {account?.avatar ? (
                <img
                  src={account.avatar}
                  alt={currentUser}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-white">
                  {currentUser.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg border-2 border-slate-900 transition-transform active:scale-90"
            title="تغيير الصورة الشخصية"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Name & ID */}
        <h2 className="text-xl font-black text-white">{currentUser}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-purple-300 font-mono">
            ID: {account?.idNum || '--------'}
          </span>
          <button
            onClick={handleCopyId}
            className="text-purple-400 hover:text-white transition-colors"
            title="نسخ الـ ID"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role & Bio */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-bold">
            {roleText}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
            {account?.gender || 'ذكر 👨'}
          </span>
        </div>

        {account?.bio && (
          <p className="text-xs text-slate-300 mt-3 max-w-xs mx-auto italic">
            "{account.bio}"
          </p>
        )}

        {/* Coins Wallet Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl">
              🪙
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-200/80 font-bold block">
                رصيد العملات المتاح
              </span>
              <span className="text-xl font-black text-amber-300 tabular-nums">
                {coins} <span className="text-xs font-bold">عملة</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => onShowToast('💎 للشحن أو السحب، تواصل مع المشرف في الرسائل')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 hover:opacity-95 active:scale-95 transition-all"
          >
            إدارة الرصيد
          </button>
        </div>

        {/* Diamond Level (For Females) */}
        {isFemale && (
          <div
            onClick={onOpenLevels}
            className="mt-3 p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-right">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-lg">
                💎
              </div>
              <div>
                <span className="text-xs font-bold text-pink-200 block">
                  {currentLevel.name} (المستوى {currentLevelIdx})
                </span>
                <span className="text-[10px] text-purple-300">
                  {diamonds} ماسة تم جمعها
                </span>
              </div>
            </div>

            <span className="text-xs text-pink-400 font-bold">عرض خارطة المستويات ←</span>
          </div>
        )}
      </div>

      {/* Menu Actions List */}
      <div className="space-y-2">
        <button
          onClick={onOpenGames}
          className="w-full p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-right text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">🎮 ساحة الألعاب والتحديات</span>
          </div>
          <span className="text-slate-400 text-xs">إكس أو ❌⭕</span>
        </button>

        <button
          onClick={onOpenInvite}
          className="w-full p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-right text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">🎁 دعوة أصدقاء (كود الـ ID)</span>
          </div>
          <span className="text-slate-400 text-xs">مكافآت وانضمامات</span>
        </button>

        <button
          onClick={() => onShowToast('🔥 المهمات اليومية — قريباً بإذن الله! تابع التحديثات ✨')}
          className="w-full p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-right text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">🔥 المهمات اليومية</span>
          </div>
          <span className="text-amber-400 text-xs font-bold">قريباً ✨</span>
        </button>

        <button
          onClick={() => onShowToast('✔️ توثيق الحساب بالعلامة الزرقاء — قريباً بإذن الله ✨')}
          className="w-full p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-right text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">✔️ توثيق الحساب</span>
          </div>
          <span className="text-blue-400 text-xs font-bold">شارة التوثيق</span>
        </button>

        <button
          onClick={onOpenEditProfile}
          className="w-full p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-right text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">✏️ تعديل الملف الشخصي والحالة</span>
          </div>
          <span className="text-slate-400 text-xs">العمر والـ Bio</span>
        </button>

        {isFemale && (
          <button
            onClick={onOpenLevels}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-between text-right text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-amber-300">🏆 نظام مستويات الماس</span>
            </div>
            <span className="text-amber-300 text-xs font-bold">رتب البنات 💎</span>
          </button>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
      >
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج من الحساب</span>
      </button>
    </div>
  );
};
