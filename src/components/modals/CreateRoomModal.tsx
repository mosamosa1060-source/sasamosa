import React, { useState } from 'react';
import { X, Radio, Sparkles } from 'lucide-react';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreateRoom: (roomName: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  onClose,
  onCreateRoom,
}) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) {
      alert('⚠️ يرجى كتابة اسم لغرفتك الصوتية');
      return;
    }
    onCreateRoom(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Radio className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">إنشاء غرفتك الخاصة</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          اختر اسماً لغرفتك الصوتية. ستكون أنت مضيف الغرفة 👑 وبها 8 مقاعد للمتحدثين بالإضافة إلى كرسي الأدمن.
        </p>

        <div>
          <label className="block text-xs font-bold text-purple-200 mb-1.5">
            🎙️ اسم الغرفة:
          </label>
          <input
            type="text"
            maxLength={25}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: سهرة النجوم والدردشة 🌟"
            className="w-full p-3 rounded-2xl bg-slate-950 border border-purple-500/30 focus:border-purple-400 text-white placeholder-slate-500 text-xs outline-none font-bold"
            autoFocus
          />
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all"
        >
          إنشاء الغرفة والدخول للمايك 🚀
        </button>
      </div>
    </div>
  );
};
