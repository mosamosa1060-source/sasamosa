import React from 'react';
import { X, Copy, Users, Check, Gift } from 'lucide-react';

interface InviteModalProps {
  idNum: string;
  myInvites: { friend: string; ts: number }[];
  onClose: () => void;
  onCopySuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  idNum,
  myInvites,
  onClose,
  onCopySuccess,
}) => {
  const handleCopy = () => {
    if (idNum) {
      navigator.clipboard?.writeText(idNum);
      onCopySuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">🎁 دعوة أصدقائك</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          شارك كود الدعوة الخاص بك مع أصدقائك. عند تسجيلهم به يظهر لك إشعار فوري وينضمون لقائمة أصدقائك!
        </p>

        {/* Code Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 text-center space-y-2">
          <span className="text-[11px] text-purple-300 font-bold block">
            كود الدعوة الخاص بك (رقم الـ ID)
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-wider select-all">
            {idNum || '--------'}
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-98"
          >
            <Copy className="w-4 h-4" />
            <span>نسخ الكود ومشاركته 📋</span>
          </button>
        </div>

        {/* Invited friends counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200">
            <span>الأصدقاء المنضمون عبر كودك:</span>
            <span className="text-emerald-400 font-black">{myInvites.length} صديق 👥</span>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-slate-300">
            {myInvites.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 text-center text-[11px] text-slate-500">
                لم ينضم أي صديق بعد. شارك كودك الآن على واتساب وتليجرام! 📲
              </div>
            ) : (
              myInvites.map((inv, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <span className="font-bold text-white">✨ {inv.friend}</span>
                  <span className="text-[10px] text-emerald-400">انضم بنجاح ✓</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
