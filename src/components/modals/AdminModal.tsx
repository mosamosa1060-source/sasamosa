import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, Coins, VolumeX, ShieldCheck, UserCheck } from 'lucide-react';
import { UserAccount } from '../../types';

interface AdminModalProps {
  currentUser: string;
  account: UserAccount | undefined;
  cloudAccounts: Record<string, UserAccount>;
  onClose: () => void;
  onChangePassword: (target: string, newPass: string) => void;
  onToggleMod: (target: string) => void;
  onGrantPoints: (target: string, amount: number) => void;
  onMuteUser: (target: string, minutes: number) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  currentUser,
  account,
  cloudAccounts,
  onClose,
  onChangePassword,
  onToggleMod,
  onGrantPoints,
  onMuteUser,
}) => {
  const [passTarget, setPassTarget] = useState('');
  const [newPass, setNewPass] = useState('');

  const [modTarget, setModTarget] = useState('');

  const [pointsTarget, setPointsTarget] = useState('');
  const [pointsAmount, setPointsAmount] = useState('50');

  const [muteTarget, setMuteTarget] = useState('');
  const [muteMins, setMuteMins] = useState('10');

  const isAdmin = account?.isAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-300">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">لوحة الإدارة والمشرفين</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-purple-300/80">
          صلاحيتك الحالية: {isAdmin ? '👑 مدير عام (Admin)' : '🛡️ مشرف معتمد (Mod)'}
        </p>

        {/* Change password */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-right">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>تغيير كلمة مرور أي مستخدم فوراً</span>
          </h4>
          <input
            type="text"
            placeholder="اسم الحساب..."
            value={passTarget}
            onChange={(e) => setPassTarget(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <input
            type="text"
            placeholder="كلمة المرور الجديدة..."
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <button
            onClick={() => {
              if (passTarget && newPass) {
                onChangePassword(passTarget.trim(), newPass);
                setPassTarget('');
                setNewPass('');
              }
            }}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all"
          >
            تغيير كلمة المرور 🔒
          </button>
        </div>

        {/* Toggle Mod role (Admin only) */}
        {isAdmin && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-right">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منح / سحب رتبة مساعد مشرف (Mod)</span>
            </h4>
            <input
              type="text"
              placeholder="اسم الحساب..."
              value={modTarget}
              onChange={(e) => setModTarget(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
            />
            <button
              onClick={() => {
                if (modTarget) {
                  onToggleMod(modTarget.trim());
                  setModTarget('');
                }
              }}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              تحديث رتبة المساعد 🛡️
            </button>
          </div>
        )}

        {/* Grant coins */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-right">
          <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>شحن عملات ذهبية لمستخدم</span>
          </h4>
          <input
            type="text"
            placeholder="اسم الحساب..."
            value={pointsTarget}
            onChange={(e) => setPointsTarget(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <input
            type="number"
            placeholder="عدد العملات..."
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <button
            onClick={() => {
              const amt = parseInt(pointsAmount, 10);
              if (pointsTarget && amt > 0) {
                onGrantPoints(pointsTarget.trim(), amt);
                setPointsTarget('');
              }
            }}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
          >
            إضافة العملات لحسابه 🪙
          </button>
        </div>

        {/* Mute user */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-right">
          <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <VolumeX className="w-3.5 h-3.5" />
            <span>كتم / فك كتم المستخدم</span>
          </h4>
          <input
            type="text"
            placeholder="اسم الحساب..."
            value={muteTarget}
            onChange={(e) => setMuteTarget(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <input
            type="number"
            placeholder="عدد الدقائق (0 لفك الكتم)..."
            value={muteMins}
            onChange={(e) => setMuteMins(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          />
          <button
            onClick={() => {
              if (muteTarget) {
                onMuteUser(muteTarget.trim(), parseInt(muteMins, 10) || 0);
                setMuteTarget('');
              }
            }}
            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
          >
            تنفيذ قرار الكتم 🔇
          </button>
        </div>

        {/* Accounts inspector */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-right">
          <h4 className="text-xs font-bold text-purple-300">
            📋 الحسابات المسجلة بالسيرفر ({Object.keys(cloudAccounts).length})
          </h4>
          <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-300">
            {Object.keys(cloudAccounts).map((u) => {
              const acc = cloudAccounts[u];
              return (
                <div key={u} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="font-bold text-white">{u}</span>
                  <span className="text-slate-400">ID: {acc.idNum} | {acc.points} 🪙</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
