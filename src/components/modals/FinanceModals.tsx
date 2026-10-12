import React, { useState } from 'react';
import { X, Coins, DollarSign, Send } from 'lucide-react';

interface BuyCoinsModalProps {
  onClose: () => void;
  onRequestBuy: (points: number) => void;
}

export const BuyCoinsModal: React.FC<BuyCoinsModalProps> = ({ onClose, onRequestBuy }) => {
  const [points, setPoints] = useState(50);
  const usdPrice = (points / 50).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (points <= 0) return;
    onRequestBuy(points);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Coins className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">💎 طلب شحن عملات</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          سعر الصرف: كل 50 عملة = 1 دولار 💵. سيتم إرسال الطلب فوراً للإدارة في الخاص لتأكيد الدفع.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              عدد العملات المطلوبة:
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={points}
              onChange={(e) => setPoints(Math.max(10, parseInt(e.target.value, 10) || 10))}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-sm text-center outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-center">
            <span className="text-xs text-slate-400 block mb-1">المبلغ المطلوب للدفع:</span>
            <span className="text-xl font-black text-amber-400 font-mono">${usdPrice} USD</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4 rotate-180" />
            <span>إرسال طلب الشحن للإدارة ✅</span>
          </button>
        </form>
      </div>
    </div>
  );
};

interface WithdrawModalProps {
  myCoins: number;
  onClose: () => void;
  onRequestWithdraw: (amount: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  myCoins,
  onClose,
  onRequestWithdraw,
}) => {
  const [amount, setAmount] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > myCoins) {
      alert('⚠️ المبلغ المطلوب غير صالح أو يتجاوز رصيدك الحالي.');
      return;
    }
    onRequestWithdraw(amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">💸 طلب سحب الأرباح</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          اطلبي سحب أرباحك وعملاتك المكتسبة من الهدايا والمحادثات. رصيدك المتاح: <b className="text-amber-300">{myCoins} عملة</b>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              عدد العملات المراد سحبها:
            </label>
            <input
              type="number"
              min="10"
              max={myCoins}
              value={amount}
              onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value, 10) || 10))}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-bold text-sm text-center outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4 rotate-180" />
            <span>إرسال طلب السحب للإدارة 💸</span>
          </button>
        </form>
      </div>
    </div>
  );
};
