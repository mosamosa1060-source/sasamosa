import React, { useRef } from 'react';
import { X, Palette, Image as ImageIcon } from 'lucide-react';
import { ROOM_BGS } from '../../constants';

interface RoomBgModalProps {
  currentBg: string;
  onClose: () => void;
  onSelectBg: (css: string) => void;
  onUploadCustomBg: (file: File) => void;
}

export const RoomBgModal: React.FC<RoomBgModalProps> = ({
  currentBg,
  onClose,
  onSelectBg,
  onUploadCustomBg,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Palette className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">🎨 خلفية الغرفة الصوتية</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          اختر قالباً مميزاً لغرفتك أو ارفع صورة خلفية خاصة من هاتفك:
        </p>

        {/* Preset themes */}
        <div className="grid grid-cols-2 gap-2.5">
          {ROOM_BGS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                onSelectBg(bg.css);
                onClose();
              }}
              className="p-3 rounded-2xl text-xs font-bold text-white border border-white/20 hover:scale-105 transition-all text-center shadow-md"
              style={{ background: bg.css }}
            >
              {bg.name}
            </button>
          ))}
        </div>

        {/* Custom file upload */}
        <div className="pt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>رفع صورة خلفية من جهازك 🖼️</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadCustomBg(file);
                onClose();
              }
            }}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
