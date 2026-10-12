import React from 'react';
import { X, Gem, Award, CheckCircle, Lock } from 'lucide-react';
import { DIAMOND_LEVELS } from '../../constants';

interface LevelsModalProps {
  diamonds: number;
  onClose: () => void;
}

export const LevelsModal: React.FC<LevelsModalProps> = ({ diamonds, onClose }) => {
  let currentLevelIdx = 0;
  for (let i = DIAMOND_LEVELS.length - 1; i >= 0; i--) {
    if (diamonds >= DIAMOND_LEVELS[i].min) {
      currentLevelIdx = i;
      break;
    }
  }

  const currentLevel = DIAMOND_LEVELS[currentLevelIdx];
  const nextLevel = DIAMOND_LEVELS[currentLevelIdx + 1];
  const nextReq = nextLevel ? nextLevel.min : currentLevel.min;
  const progressPct = nextLevel
    ? Math.min(
        100,
        Math.round(((diamonds - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
      )
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-pink-300">
            <Gem className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white">💎 نظام مستويات الماس</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Level Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-pink-600/30 via-purple-600/20 to-indigo-600/30 border border-pink-500/30 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center mx-auto text-2xl shadow-inner">
            💎
          </div>
          <h4 className="text-base font-black text-white">{currentLevel.name}</h4>
          <p className="text-xs text-pink-200">
            رصيدك: <b className="text-white">{diamonds.toLocaleString()}</b> ماسة
          </p>

          {/* Progress bar */}
          {nextLevel && (
            <div className="space-y-1 pt-1">
              <div className="w-full h-2 rounded-full bg-slate-950/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-purple-300/80">
                <span>المستوى {currentLevelIdx}</span>
                <span>المستوى {currentLevelIdx + 1} ({nextReq.toLocaleString()} 💎)</span>
              </div>
            </div>
          )}
        </div>

        {/* Tiers List */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-purple-200">خارطة الرتب والترقيات:</div>
          {DIAMOND_LEVELS.map((lvl, idx) => {
            const isCompleted = idx < currentLevelIdx;
            const isCurrent = idx === currentLevelIdx;

            return (
              <div
                key={lvl.name}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isCurrent
                    ? 'bg-purple-950/80 border-pink-400/60 shadow-md shadow-pink-500/10'
                    : isCompleted
                    ? 'bg-slate-950/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/30 border-slate-800 text-slate-500 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent
                        ? 'bg-pink-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : idx}
                  </div>
                  <span className={`font-bold ${isCurrent ? 'text-white' : ''}`}>
                    {lvl.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>{lvl.min.toLocaleString()} 💎</span>
                  {isCurrent ? (
                    <span className="text-pink-400 font-bold">حالي</span>
                  ) : isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
