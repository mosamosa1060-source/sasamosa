import React, { useState } from 'react';
import { Crown, Sparkles, Search, MessageSquare, Heart, Shield, Check } from 'lucide-react';
import { UserAccount } from '../types';

interface OnlineUsersTabProps {
  currentUser: string;
  cloudAccounts: Record<string, UserAccount>;
  onlineUsers: Record<string, number>;
  onOpenUserModal: (username: string) => void;
  onOpenDmWith: (username: string) => void;
}

export const OnlineUsersTab: React.FC<OnlineUsersTabProps> = ({
  currentUser,
  cloudAccounts,
  onlineUsers,
  onOpenUserModal,
  onOpenDmWith,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const now = Date.now();

  // Find top winner excluding sasa
  const rankedUsers = Object.keys(cloudAccounts)
    .filter((n) => n !== 'sasa')
    .map((name) => ({
      name,
      points: cloudAccounts[name]?.points || 0,
      account: cloudAccounts[name],
    }))
    .sort((a, b) => b.points - a.points);

  const topWinner = rankedUsers[0];

  // Filter users
  const userList = Object.keys(cloudAccounts)
    .filter((name) => name !== currentUser)
    .filter((name) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const u = cloudAccounts[name];
      return name.toLowerCase().includes(q) || (u?.idNum && u.idNum.includes(q));
    });

  return (
    <div className="space-y-4 pb-20">
      {/* 🏆 Leaderboard King Card */}
      {topWinner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-amber-500/10 border border-amber-500/30 p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/30">
                  {topWinner.account?.avatar ? (
                    <img
                      src={topWinner.account.avatar}
                      alt={topWinner.name}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl">
                      👑
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">
                  1
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>ملك النجوم 👑</span>
                </div>
                <h3 className="text-base font-black text-white">{topWinner.name}</h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200/90 bg-amber-400/10 px-2 py-0.5 rounded-md mt-0.5 border border-amber-400/20">
                  <span>🪙 {topWinner.points} عملة</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenDmWith(topWinner.name)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 hover:opacity-95 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>محادثة</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الـ ID..."
          className="w-full py-2.5 px-4 pr-10 rounded-2xl bg-slate-900/70 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 transition-colors shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
      </div>

      {/* Online Users List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-purple-200/70 px-1">
          <span>المستخدمون ({userList.length})</span>
          <span>الحالة</span>
        </div>

        {userList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            لا يوجد مستخدمون مطابقون لبحثك
          </div>
        ) : (
          userList.map((username) => {
            const user = cloudAccounts[username];
            const isOnline = onlineUsers[username] && now - onlineUsers[username] <= 300000;
            const isStaff = user?.isAdmin || user?.isMod;

            return (
              <div
                key={username}
                onClick={() => onOpenUserModal(username)}
                className="group p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with Status Ring */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-purple-500/20">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center text-lg text-white font-bold">
                          {username.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-sm" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {username}
                      </span>
                      {isStaff && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" />
                          <span>{user?.isAdmin ? 'أدمن' : 'مشرف'}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {user?.gender || 'ذكر 👨'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {user?.bio || 'اللهم اعف عنا واغفر لنا... ✨'}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button: HI */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDmWith(username);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
                  title="إرسال تحية سريعة"
                >
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                  <span>HI</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
