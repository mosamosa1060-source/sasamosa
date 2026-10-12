import React, { useState } from 'react';
import { Swords, Coins, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { UserAccount, TicTacToeState } from '../types';
import { TTT_COMMISSION } from '../constants';

interface GamesTabProps {
  currentUser: string;
  coins: number;
  onlineUsers: Record<string, number>;
  cloudAccounts: Record<string, UserAccount>;
  tttState: TicTacToeState;
  onInvitePlayer: (target: string, stake: number) => void;
  onPlayCell: (index: number) => void;
  onExitGame: () => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  currentUser,
  coins,
  onlineUsers,
  cloudAccounts,
  tttState,
  onInvitePlayer,
  onPlayCell,
  onExitGame,
}) => {
  const [stakeInput, setStakeInput] = useState(5);
  const now = Date.now();

  const availablePlayers = Object.keys(cloudAccounts).filter(
    (n) => n !== currentUser && onlineUsers[n] && now - onlineUsers[n] <= 300000
  );

  const totalPrize = Math.max(0, stakeInput * 2 - TTT_COMMISSION);

  // Active Game Board View
  if (tttState.active) {
    const isMyTurn = tttState.myTurn;

    return (
      <div className="space-y-6 pb-20 max-w-sm mx-auto text-center">
        {/* Game Status Banner */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-purple-500/30 shadow-xl">
          <div className="flex items-center justify-between text-xs text-purple-300 mb-2">
            <span>تحدي إكس أو ❌⭕</span>
            <span className="font-bold text-amber-300">الرهان: {tttState.stake} 🪙</span>
          </div>

          <div className="text-sm font-bold text-white">
            {isMyTurn ? (
              <span className="text-emerald-400 font-black animate-pulse">
                🎮 دورك الآن — اختر مربعاً للعب ({tttState.myMark})
              </span>
            ) : (
              <span className="text-slate-300">
                ⏳ انتظر حركة الخصم ({tttState.opp})...
              </span>
            )}
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-3xl border border-purple-900/30 aspect-square max-w-[320px] mx-auto shadow-2xl">
          {tttState.board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => onPlayCell(idx)}
              disabled={!isMyTurn || !!cell}
              className={`rounded-2xl text-4xl font-black transition-all flex items-center justify-center aspect-square select-none ${
                cell
                  ? cell === 'X'
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 cursor-default'
                    : 'bg-pink-600/20 text-pink-400 border border-pink-500/40 cursor-default'
                  : isMyTurn
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-400 text-transparent cursor-pointer active:scale-95'
                  : 'bg-slate-900/80 border border-slate-800 cursor-not-allowed opacity-60'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Forfeit button */}
        <button
          onClick={onExitGame}
          className="w-full py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all shadow-md active:scale-98"
        >
          🚪 انسحاب من الجولة (الانسحاب = خسارة الرهان)
        </button>
      </div>
    );
  }

  // Lobby View
  return (
    <div className="space-y-4 pb-20">
      {/* Game Card Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-900/60 via-indigo-950/60 to-slate-900 border border-purple-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-600/30">
            ❌⭕
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تحدي إكس أو برهان العملات</h2>
            <p className="text-xs text-purple-300/80">
              تحدَّ أصدقاءك في مباراة مباشرة! الفائز يحصد الجائزة كاملة 💰
            </p>
          </div>
        </div>

        {/* Stake Settings */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-purple-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>مبلغ رهان كل لاعب:</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="500"
                value={stakeInput}
                onChange={(e) => setStakeInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 py-1 px-2 rounded-xl bg-slate-900 border border-purple-500/40 text-amber-300 font-bold text-sm text-center outline-none"
              />
              <span className="text-xs text-amber-400 font-bold">عملة</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              الفائز يحصل على <b className="text-amber-300">{totalPrize} عملة</b> (مجموع الرهانين ناقص 2 عملة عمولة). في حال التعادل تُعاد العملات بالكامل لكلا الطرفين.
            </div>
          </div>
        </div>
      </div>

      {/* Waiting banner if in queue */}
      {tttState.waiting && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
          <span>⏳ تم إرسال التحدي إلى {tttState.opp} برهان {tttState.stake} عملة...</span>
        </div>
      )}

      {/* Opponent Selection List */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-purple-200/70 mb-3 px-1">
          <span>اختر خصمك للبدء ({availablePlayers.length} متصل)</span>
          <span className="text-emerald-400 text-[11px]">جاهزون للتحدي</span>
        </div>

        {availablePlayers.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
            لا يوجد لاعبون متصلون حالياً. انتظر انضمام أصدقائك أو ادعُهم بكود الدعوة!
          </div>
        ) : (
          <div className="space-y-2">
            {availablePlayers.map((player) => {
              const pAcc = cloudAccounts[player];

              return (
                <div
                  key={player}
                  className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-purple-500/20 shrink-0">
                      {pAcc?.avatar ? (
                        <img src={pAcc.avatar} alt={player} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-purple-700 flex items-center justify-center font-bold text-white">
                          {player.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white truncate block">{player}</span>
                      <span className="text-[11px] text-amber-300 font-medium">
                        🪙 {pAcc?.points || 0} عملة
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onInvitePlayer(player, stakeInput)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>تحدي ⚔️</span>
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
