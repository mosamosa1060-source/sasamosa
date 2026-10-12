import React from 'react';
import { Plus, Radio, Users, Sparkles, Volume2 } from 'lucide-react';

interface RoomsTabProps {
  currentUser: string;
  roomHeartbeats: Record<string, number>;
  roomNames: Record<string, string>;
  onOpenCreateModal: () => void;
  onJoinRoom: (owner: string) => void;
  onEnterMyRoom: () => void;
  hasMyRoom: boolean;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({
  currentUser,
  roomHeartbeats,
  roomNames,
  onOpenCreateModal,
  onJoinRoom,
  onEnterMyRoom,
  hasMyRoom,
}) => {
  const now = Date.now();
  const activeRooms = Object.keys(roomHeartbeats).filter((owner) => {
    return now - roomHeartbeats[owner] <= 9000 && owner !== currentUser;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Create Room Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-900/60 via-indigo-950/60 to-slate-900 border border-purple-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">غرف الدردشة الصوتية المباشرة</h2>
            <p className="text-xs text-purple-300/80">
              تحدث على الهواء مباشرة، استقبل الهدايا، وشارك أصدقاءك الأجواء 🎙️
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onOpenCreateModal}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء غرفة صوتية باسم خاص 🚀</span>
          </button>

          {hasMyRoom && (
            <button
              onClick={onEnterMyRoom}
              className="py-3 px-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all shrink-0"
            >
              غرفتي 👑
            </button>
          )}
        </div>
      </div>

      {/* Active rooms list */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-purple-200/70 mb-3 px-1">
          <span>الغرف المتاحة حالياً ({activeRooms.length})</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>مباشر الآن</span>
          </span>
        </div>

        {activeRooms.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-2xl">
              🎙️
            </div>
            <p className="text-sm font-semibold text-white">لا توجد غرف نشطة حالياً</p>
            <p className="text-xs text-slate-500">
              كن أنت المبادر وافتح غرفتك الصوتية ليجتمع فيها الأصدقاء!
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ابدأ غرفتك الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeRooms.map((owner) => {
              const displayName = roomNames[owner] || `غرفة ${owner}`;

              return (
                <div
                  key={owner}
                  onClick={() => onJoinRoom(owner)}
                  className="group p-4 rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-purple-900/30 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-600 p-0.5 shadow-md shadow-purple-900/30 shrink-0">
                      <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center text-2xl">
                        🎙️
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {displayName}
                      </h3>
                      <p className="text-xs text-purple-300/70 truncate mt-0.5">
                        المضيف: <span className="text-white font-medium">{owner}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>8 مقاعد + كرسي الأدمن 👑</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white text-xs font-bold transition-all shrink-0">
                    دخول
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
