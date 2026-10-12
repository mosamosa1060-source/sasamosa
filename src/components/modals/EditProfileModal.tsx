import React, { useState } from 'react';
import { X, Copy, Save } from 'lucide-react';
import { UserAccount } from '../../types';

interface EditProfileModalProps {
  account: UserAccount | undefined;
  onClose: () => void;
  onSave: (newAge: number, newBio: string) => void;
  onCopyId: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  account,
  onClose,
  onSave,
  onCopyId,
}) => {
  const [age, setAge] = useState(account?.age?.toString() || '22');
  const [bio, setBio] = useState(account?.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAge = parseInt(age, 10) || 20;
    onSave(numAge, bio.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">✏️ تعديل الملف الشخصي</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Readonly ID */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              🆔 رقم الـ ID (ثابت):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={account?.idNum || ''}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs outline-none text-center font-bold"
              />
              <button
                type="button"
                onClick={onCopyId}
                className="px-3 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/50 text-xs font-bold"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">🎂 العمر:</label>
            <input
              type="number"
              min="10"
              max="99"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              ✍️ الحالة (Bio):
            </label>
            <textarea
              rows={3}
              maxLength={60}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب عبارة أو نبذة عنك..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات ✅</span>
          </button>
        </form>
      </div>
    </div>
  );
};
