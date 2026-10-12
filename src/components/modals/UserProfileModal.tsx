import React from 'react';
import { X, UserPlus, UserCheck, MessageSquare, VolumeX, Volume2, Shield } from 'lucide-react';
import { UserAccount } from '../../types';

interface UserProfileModalProps {
  targetUser: string;
  account: UserAccount | undefined;
  isFollowing: boolean;
  isMuted: boolean;
  onClose: () => void;
  onToggleFollow: () => void;
  onToggleMute: () => void;
  onStartDm: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  targetUser,
  account,
  isFollowing,
  isMuted,
  onClose,
  onToggleFollow,
  onToggleMute,
  onStartDm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full mx-auto p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-600/30">
          <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
            {account?.avatar ? (
              <img src={account.avatar} alt={targetUser} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">
                {targetUser.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Name & ID */}
        <div>
          <h3 className="text-lg font-black text-white">{targetUser}</h3>
          <span className="text-xs text-purple-300 font-mono">
            ID: {account?.idNum || '--------'}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-200 text-xs font-bold border border-purple-500/30">
            {account?.gender || 'ذكر 👨'}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
            العمر: {account?.age || 22} سنة
          </span>
        </div>

        {/* Bio */}
        {account?.bio && (
          <p className="text-xs text-slate-300 italic px-2">"{account.bio}"</p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onToggleFollow}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isFollowing
                ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
            }`}
          >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isFollowing ? 'أصدقاء ✓' : '➕ متابعة'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onStartDm();
            }}
            className="py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>محادثة خاصة 📩</span>
          </button>
        </div>

        {/* Mute User Button */}
        <button
          onClick={onToggleMute}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isMuted
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
          }`}
        >
          {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{isMuted ? 'إلغاء كتم هذا المستخدم' : 'كتم المستخدم (تجاهل رسائله)'}</span>
        </button>
      </div>
    </div>
  );
};
