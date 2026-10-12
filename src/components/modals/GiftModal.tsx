import React, { useState } from 'react';
import { X, Gift, Sparkles, Send } from 'lucide-react';
import { GIFTS } from '../../constants';
import { GiftOption } from '../../types';

interface GiftModalProps {
  isRoomMode: boolean;
  roomUsers?: string[];
  partnerName?: string;
  myCoins: number;
  onClose: () => void;
  onSendGift: (gift: GiftOption, target: string, customMsg?: string) => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isRoomMode,
  roomUsers = [],
  partnerName = '',
  myCoins,
  onClose,
  onSendGift,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [targetUser, setTargetUser] = useState<string>(
    partnerName || (roomUsers.length > 0 ? roomUsers[0] : '')
  );
  const [customMsg, setCustomMsg] = useState('');

  const selectedGift = GIFTS[selectedIdx] || GIFTS[0];

  const handleConfirm = () => {
    if (!targetUser) {
      alert('⚠️ يرجى اختيار الشخص المستلم للهدية');
      return;
    }
    if (myCoins < selectedGift.cost) {
      alert(`⚠️ رصيدك غير كافٍ! تحتاج ${selectedGift.cost} عملة لإرسال هذه الهدية.`);
      return;
    }
    onSendGift(selectedGift, targetUser, customMsg.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Gift className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              {isRoomMode ? '🎁 إرسال هدية في الغرفة' : `🎁 إرسال هدية إلى ${partnerName}`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Recipient Picker */}
        {isRoomMode && (
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              👤 اختر المستلم في الغرفة:
            </label>
            <select
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
            >
              {roomUsers.length === 0 ? (
                <option value="">لا يوجد أعضاء في الغرفة</option>
              ) : (
                roomUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Custom message in room */}
        {isRoomMode && (
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              ✍️ رسالتك لتظهر على شاشة الغرفة:
            </label>
            <input
              type="text"
              maxLength={60}
              placeholder="اكتب رسالة تهنئة أو شكر..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>
        )}

        {/* Gifts Grid */}
        <div>
          <label className="block text-xs font-bold text-purple-200 mb-2">
            اختر نوع الهدية ({selectedGift.cost} 🪙):
          </label>
          <div className="grid grid-cols-4 gap-2">
            {GIFTS.map((g, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={g.n}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-400'
                  }`}
                >
                  <span className="text-2xl drop-shadow">{g.e}</span>
                  <span className="text-[10px] font-bold truncate max-w-[60px]">{g.n}</span>
                  <span className="text-[9px] text-amber-400/80 font-bold">{g.cost} 🪙</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance Status */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <span>رصيدك الحالي:</span>
          <span className="text-amber-300 font-bold">{myCoins} عملة 🪙</span>
        </div>

        {/* Send Action */}
        <button
          onClick={handleConfirm}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-400/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Send className="w-4 h-4 rotate-180" />
          <span>إرسال الهدية الآن ({selectedGift.cost} عملة) 🚀</span>
        </button>
      </div>
    </div>
  );
};
