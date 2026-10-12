import React from 'react';
import { Volume2, VolumeX, Bell, BellOff, ShieldCheck, Crown, Coins, Radio } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  currentUser: string;
  account: UserAccount | undefined;
  coins: number;
  soundEnabled: boolean;
  audioActive: boolean;
  isConnected: boolean;
  onToggleSound: () => void;
  onEnableAudio: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  account,
  coins,
  soundEnabled,
  audioActive,
  isConnected,
  onToggleSound,
  onEnableAudio,
  onOpenAdmin,
}) => {
  const isStaff = account?.isAdmin || account?.isMod;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-purple-900/20 px-4 py-3 flex items-center justify-between gap-3 text-white">
      {/* Brand & user name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
          <span className="text-lg">🌟</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent truncate">
              دردشة النجوم
            </h1>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
              title={isConnected ? 'متصل بالسيرفر' : 'جاري الاتصال...'}
            />
          </div>
          <p className="text-[11px] text-purple-300/70 truncate">
            أهلاً، <span className="text-white font-medium">{currentUser}</span>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Coins wallet */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold shadow-inner">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="tabular-nums">{coins}</span>
          <span className="text-[10px] text-amber-400/80">عملة</span>
        </div>

        {/* Audio enable */}
        <button
          onClick={onEnableAudio}
          className={`p-2 rounded-xl text-xs font-medium transition-colors border ${
            audioActive
              ? 'bg-purple-950/60 border-purple-500/30 text-purple-300 hover:bg-purple-900/50'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
          }`}
          title={audioActive ? 'الصوت مفعل' : 'انقر لتفعيل الصوت'}
        >
          {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Bell FX toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title={soundEnabled ? 'تنبيهات الصوت مفعلة' : 'التنبيهات صامتة'}
        >
          {soundEnabled ? <Bell className="w-4 h-4 text-purple-300" /> : <BellOff className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Secret Admin Button */}
        {isStaff && (
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all shadow-md shadow-amber-500/20"
            title="لوحة الإدارة والمشرفين"
          >
            {account?.isAdmin ? (
              <Crown className="w-4 h-4 text-amber-300" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
