import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  LogOut,
  Palette,
  Gift,
  Gamepad2,
  Smile,
  Send,
  Image as ImageIcon,
  Crown,
  Volume2,
  VolumeX,
  X,
  UserX,
  ShieldAlert,
} from 'lucide-react';
import { UserAccount, RoomChatMsg, RoomGiftEvent } from '../types';
import { ROOM_SEAT_COUNT, QUICK_EMOJIS } from '../constants';

interface ActiveRoomViewProps {
  currentUser: string;
  roomName: string;
  roomTitle: string;
  isOwner: boolean;
  roomSeats: Record<number | string, string | null>;
  roomMutes: Record<string, boolean>;
  roomBg: string;
  cloudAccounts: Record<string, UserAccount>;
  roomChatLog: RoomChatMsg[];
  mySeatIdx: number | null;
  isMicMuted: boolean;
  onLeaveRoom: () => void;
  onTakeSeat: (index: number) => void;
  onToggleMic: () => void;
  onAdminKick: (index: number) => void;
  onAdminMute: (index: number) => void;
  onOpenBgPicker: () => void;
  onOpenGiftModal: () => void;
  onSendChatMessage: (text: string) => void;
  onSendImageMessage: (file: File) => void;
  floatingGifts: RoomGiftEvent[];
  floatingTexts: RoomChatMsg[];
  onOpenXO: () => void;
}

export const ActiveRoomView: React.FC<ActiveRoomViewProps> = ({
  currentUser,
  roomName,
  roomTitle,
  isOwner,
  roomSeats,
  roomMutes,
  roomBg,
  cloudAccounts,
  roomChatLog,
  mySeatIdx,
  isMicMuted,
  onLeaveRoom,
  onTakeSeat,
  onToggleMic,
  onAdminKick,
  onAdminMute,
  onOpenBgPicker,
  onOpenGiftModal,
  onSendChatMessage,
  onSendImageMessage,
  floatingGifts,
  floatingTexts,
  onOpenXO,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [roomChatLog]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendImageMessage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const adminName = roomSeats[ROOM_SEAT_COUNT];
  const adminAcc = adminName ? cloudAccounts[adminName] : undefined;
  const isMeAdmin = adminName === currentUser;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white max-w-lg mx-auto overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 backdrop-blur-md border-b border-white/10 z-20">
        <button
          onClick={onLeaveRoom}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>

        <div className="text-center min-w-0 px-2">
          <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" />
            <span className="truncate">{roomTitle}</span>
          </div>
          <span className="text-[10px] text-slate-400">مضيف الغرفة: {roomName}</span>
        </div>

        <button
          onClick={onOpenBgPicker}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-xs"
          title="تغيير خلفية الغرفة"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* Main Room Stage */}
      <div
        className="flex-1 relative overflow-y-auto p-4 flex flex-col items-center justify-start transition-all duration-300"
        style={{
          background: roomBg.startsWith('url') ? roomBg : undefined,
          backgroundImage: !roomBg.startsWith('url') ? roomBg : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Floating gift animations */}
        {floatingGifts.map((fg, idx) => (
          <div
            key={fg.id || idx}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none text-center animate-float-gift"
          >
            <div className="text-6xl drop-shadow-2xl">{fg.gift}</div>
            <div className="mt-2 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-white text-xs font-bold shadow-2xl">
              <span className="text-amber-300">{fg.from}</span> أهدى {fg.giftName} إلى{' '}
              <span className="text-pink-300">{fg.to}</span>
              {fg.msg && <div className="text-[11px] text-slate-300 mt-0.5">💬 {fg.msg}</div>}
            </div>
          </div>
        ))}

        {/* Floating live text messages */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[85%] px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs text-center shadow-xl animate-room-text"
          >
            <span className="font-bold text-purple-300">{ft.from}: </span>
            <span>{ft.text}</span>
          </div>
        ))}

        {/* Admin Crown Seat at Top Center */}
        <div className="my-2 flex flex-col items-center">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center transition-all ${
                adminName ? 'speaking-pulse' : ''
              }`}
            >
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {adminAcc?.avatar ? (
                  <img src={adminAcc.avatar} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👑</span>
                )}
              </div>
            </div>

            {/* Admin Crown icon indicator */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
              <Crown className="w-3.5 h-3.5" />
            </div>

            {/* Mic toggle overlay if this is the admin seat and current user is the admin */}
            {isMeAdmin && (
              <button
                onClick={onToggleMic}
                className={`absolute bottom-0 left-0 p-1.5 rounded-full shadow-lg border border-white/40 transition-transform active:scale-90 ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
                title="كتم/تفعيل المايك"
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="mt-1 text-center">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1 justify-center">
              <span>{adminName || 'مقعد المضيف'}</span>
            </span>
            <span className="text-[10px] text-amber-200/70">المشرف 👑</span>
          </div>
        </div>

        {/* 8 Participant Seats (4x2 Grid) */}
        <div className="w-full max-w-sm mt-3">
          <div className="text-[11px] text-white/70 text-center mb-2 font-medium">
            🎤 اضغط على أي مقعد فارغ للصعود والتحدث
          </div>

          <div className="grid grid-cols-4 gap-3 justify-items-center">
            {Array.from({ length: ROOM_SEAT_COUNT }).map((_, idx) => {
              const occupantName = roomSeats[idx];
              const occupantAcc = occupantName ? cloudAccounts[occupantName] : undefined;
              const isMe = occupantName === currentUser;
              const isOccupantMuted = occupantName ? !!roomMutes[occupantName] : false;

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    onClick={() => {
                      if (!occupantName) onTakeSeat(idx);
                    }}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      occupantName
                        ? 'p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-lg shadow-emerald-500/20 speaking-pulse'
                        : 'border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/20 hover:border-purple-300'
                    }`}
                  >
                    {occupantName ? (
                      <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        {occupantAcc?.avatar ? (
                          <img
                            src={occupantAcc.avatar}
                            alt={occupantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-bold text-white">
                            {occupantName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-white/70">
                        <Mic className="w-4 h-4 text-purple-200" />
                        <span className="text-[9px] font-bold mt-0.5">{idx + 1}</span>
                      </div>
                    )}

                    {/* Own Seat Mic Toggle Button */}
                    {isMe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMic();
                        }}
                        className={`absolute -bottom-1 -left-1 p-1 rounded-full shadow-lg border border-white/40 transition-transform active:scale-90 ${
                          isMicMuted ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                        title="كتم/تفعيل المايك"
                      >
                        {isMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </button>
                    )}

                    {/* Mute indicator for other occupants */}
                    {!isMe && isOccupantMuted && (
                      <span className="absolute -bottom-1 -left-1 p-1 rounded-full bg-rose-600 text-white shadow-md">
                        <MicOff className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Seat name & controls */}
                  <span className="text-[11px] font-bold text-white truncate max-w-[65px] mt-1 text-center">
                    {occupantName || `مقعد ${idx + 1}`}
                  </span>

                  {/* Host kick & mute controls */}
                  {isOwner && occupantName && !isMe && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        onClick={() => onAdminKick(idx)}
                        className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[9px]"
                        title="طرد من المقعد"
                      >
                        طرد
                      </button>
                      <button
                        onClick={() => onAdminMute(idx)}
                        className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[9px]"
                        title="كتم/فك كتم"
                      >
                        {isOccupantMuted ? 'فك' : 'كتم'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio quality hint */}
        <div className="mt-auto mb-2 text-[10px] text-white/80 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-center max-w-sm">
          🎧 الصوت نقي ومباشر مع تقنية إلغاء الصدى والضوضاء
        </div>

        {/* In-Room Live Chat Scroll Area */}
        {showChatPanel && (
          <div className="w-full max-w-md bg-slate-950/70 backdrop-blur-xl rounded-2xl border border-white/10 p-3 max-h-36 overflow-y-auto mb-2 space-y-1.5 text-xs" ref={chatScrollRef}>
            {roomChatLog.length === 0 ? (
              <div className="text-slate-400 text-center py-2 text-[11px]">
                💬 الدردشة هادئة... كن أول من يرسل رسالة في الغرفة!
              </div>
            ) : (
              roomChatLog.map((msg) => (
                <div key={msg.id} className="flex items-start gap-1.5">
                  <span className="font-bold text-purple-300 shrink-0">{msg.from}:</span>
                  <span className="text-white/90 break-words">{msg.text}</span>
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="Uploaded in room"
                      className="w-16 h-16 object-cover rounded-lg border border-white/20 mt-1 cursor-pointer"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Mini-Games Drawer */}
      {showMiniGames && (
        <div className="bg-slate-900 border-t border-purple-500/30 p-3 z-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-200">🎮 ألعاب الغرفة التفاعلية</span>
            <button onClick={() => setShowMiniGames(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                setShowMiniGames(false);
                onOpenXO();
              }}
              className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 flex flex-col items-center gap-1 transition-all"
            >
              <span className="text-xl">❌⭕</span>
              <span className="text-[10px] font-bold text-white">إكس أو</span>
            </button>
            <button
              onClick={() => alert('🎲 لعبة لودو قادمة في التحديث القادم!')}
              className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center gap-1 opacity-70"
            >
              <span className="text-xl">🎲</span>
              <span className="text-[10px] font-bold text-slate-300">لودو (قريباً)</span>
            </button>
            <button
              onClick={() => alert('🃏 حرب الأوراق قادمة قريباً!')}
              className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center gap-1 opacity-70"
            >
              <span className="text-xl">🃏</span>
              <span className="text-[10px] font-bold text-slate-300">الأوراق (قريباً)</span>
            </button>
            <button
              onClick={() => alert('🏇 سباق الخيل التفاعلي قادم قريباً!')}
              className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center gap-1 opacity-70"
            >
              <span className="text-xl">🏇</span>
              <span className="text-[10px] font-bold text-slate-300">السباق (قريباً)</span>
            </button>
          </div>
        </div>
      )}

      {/* Emoji Drawer */}
      {showEmoji && (
        <div className="bg-slate-900 border-t border-purple-500/30 p-2 z-30">
          <div className="grid grid-cols-9 gap-1 max-h-24 overflow-y-auto">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setChatInput((prev) => prev + emoji)}
                className="text-xl p-1 hover:bg-slate-800 rounded-lg transition-colors text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Room Bottom Control Bar (Yoki / StarChat Style) */}
      <div className="flex items-center gap-2 p-3 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-20">
        {/* Gift Button */}
        <button
          onClick={onOpenGiftModal}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
          title="إرسال هدية في الغرفة"
        >
          <Gift className="w-5 h-5" />
        </button>

        {/* Mini-Games Button */}
        <button
          onClick={() => {
            setShowMiniGames(!showMiniGames);
            setShowEmoji(false);
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all shrink-0"
          title="الألعاب"
        >
          <Gamepad2 className="w-5 h-5 text-purple-300" />
        </button>

        {/* Emoji Button */}
        <button
          onClick={() => {
            setShowEmoji(!showEmoji);
            setShowMiniGames(false);
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all shrink-0"
          title="إيموجي"
        >
          <Smile className="w-5 h-5 text-amber-300" />
        </button>

        {/* Chat Input */}
        <div className="flex-1 flex items-center bg-white/10 border border-white/20 rounded-full px-3 py-1">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="اكتب في الغرفة..."
            className="flex-1 bg-transparent text-white placeholder-white/50 text-xs outline-none px-1"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-white/60 hover:text-white transition-colors"
            title="إرسال صورة"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all shrink-0"
          title="إرسال"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
