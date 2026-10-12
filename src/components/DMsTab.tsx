import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Send,
  Mic,
  Smile,
  Image as ImageIcon,
  Gift,
  Coins,
  DollarSign,
  Play,
  Pause,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { UserAccount, DirectMessage } from '../types';
import { QUICK_EMOJIS, GIFT_COST } from '../constants';

interface DMsTabProps {
  currentUser: string;
  cloudAccounts: Record<string, UserAccount>;
  onlineUsers: Record<string, number>;
  dmHistory: Record<string, DirectMessage[]>;
  unreadDm: Record<string, number>;
  activePartner: string | null;
  typingPartners: Record<string, boolean>;
  onSelectPartner: (partner: string) => void;
  onCloseConversation: () => void;
  onSendTextMessage: (text: string) => void;
  onSendVoiceMessage: (audioBase64: string) => void;
  onSendImageMessage: (file: File) => void;
  onOpenGiftModal: () => void;
  onOpenBuyModal: () => void;
  onOpenWithdrawModal: () => void;
  onNotifyTyping: () => void;
  onRespondTtt: (inviteId: string, fromUser: string, action: 'accept' | 'decline') => void;
  onViewImage: (imgUrl: string) => void;
}

export const DMsTab: React.FC<DMsTabProps> = ({
  currentUser,
  cloudAccounts,
  onlineUsers,
  dmHistory,
  unreadDm,
  activePartner,
  typingPartners,
  onSelectPartner,
  onCloseConversation,
  onSendTextMessage,
  onSendVoiceMessage,
  onSendImageMessage,
  onOpenGiftModal,
  onOpenBuyModal,
  onOpenWithdrawModal,
  onNotifyTyping,
  onRespondTtt,
  onViewImage,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'unread' | 'friends'>('all');
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const now = Date.now();
  const currentAcc = cloudAccounts[currentUser];

  // Auto scroll to bottom
  useEffect(() => {
    if (activePartner && msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activePartner, dmHistory, typingPartners]);

  // Voice recording logic
  const handleToggleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              onSendVoiceMessage(ev.target.result as string);
            }
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch {
        alert('تعذر الوصول إلى الميكروفون!');
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    onSendTextMessage(inputText.trim());
    setInputText('');
  };

  // Check mutual friendship
  const isMutualFriend = (otherUser: string) => {
    const accA = cloudAccounts[currentUser];
    const accB = cloudAccounts[otherUser];
    const aFollowsB = accA?.following?.includes(otherUser);
    const bFollowsA = accB?.following?.includes(currentUser);
    return !!(aFollowsB && bFollowsA);
  };

  // List of all known partners with history or searched
  const allPartners = Array.from(
    new Set([
      ...Object.keys(dmHistory).filter((k) => (dmHistory[k] || []).length > 0),
      ...Object.keys(cloudAccounts).filter((k) => k !== currentUser),
    ])
  );

  const filteredPartners = allPartners.filter((p) => {
    if (p === currentUser) return false;
    const isOnline = onlineUsers[p] && now - onlineUsers[p] <= 300000;
    const unread = (unreadDm[p] || 0) > 0;
    const mutual = isMutualFriend(p);

    if (filter === 'online' && !isOnline) return false;
    if (filter === 'unread' && !unread) return false;
    if (filter === 'friends' && !mutual) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const u = cloudAccounts[p];
      return p.toLowerCase().includes(q) || (u?.idNum && u.idNum.includes(q));
    }
    return true;
  });

  // If in 1-on-1 Conversation View
  if (activePartner) {
    const partnerAcc = cloudAccounts[activePartner];
    const isOnline = onlineUsers[activePartner] && now - onlineUsers[activePartner] <= 300000;
    const mutual = isMutualFriend(activePartner);
    const msgs = dmHistory[activePartner] || [];
    const isPartnerStaff = partnerAcc?.isAdmin || partnerAcc?.isMod;
    const isFemale = currentAcc?.gender?.includes('أنثى');

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-lg mx-auto bg-slate-950 text-white relative">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-purple-900/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onCloseConversation}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>

            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 border border-purple-500/20">
                {partnerAcc?.avatar ? (
                  <img src={partnerAcc.avatar} alt={activePartner} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center font-bold text-white">
                    {activePartner.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-bold text-white truncate">{activePartner}</span>
                {mutual && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    أصدقاء 🤝
                  </span>
                )}
              </div>
              <span className="text-[11px] text-purple-300/70">
                {isOnline ? 'متصل الآن 🟢' : 'غير متصل ⚪'}
              </span>
            </div>
          </div>

          {/* Quick Gift Button */}
          <button
            onClick={onOpenGiftModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 flex items-center gap-1 shrink-0"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>هدية (5 🪙)</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          {msgs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد رسائل سابقة. ابدأ المحادثة الآن بسلام أو هدية! ✨
            </div>
          ) : (
            msgs.map((m) => {
              if (m.sys) {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                      {m.text}
                    </span>
                  </div>
                );
              }

              const isMe = m.from === currentUser;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-bl-sm shadow-purple-900/20'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-br-sm shadow-black/20'
                    }`}
                  >
                    {/* Text Message */}
                    {m.text && <p className="text-sm leading-relaxed break-words">{m.text}</p>}

                    {/* Gift Notification */}
                    {m.type === 'gift' && (
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-3xl drop-shadow-md">{m.gift}</span>
                        <div>
                          <div className="text-xs font-bold text-amber-300">
                            هدية: {m.giftName}
                          </div>
                          <div className="text-[10px] text-white/70">
                            القيمة: {m.amount} عملة 🪙
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Message */}
                    {m.type === 'img' && m.img && (
                      <div className="mt-1">
                        <img
                          src={m.img}
                          alt="Photo"
                          onClick={() => onViewImage(m.img!)}
                          className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/20"
                        />
                      </div>
                    )}

                    {/* Voice Message */}
                    {m.type === 'voice' && m.audio && (
                      <div className="flex items-center gap-2 min-w-[180px] pt-1">
                        <audio controls src={m.audio} className="w-full max-w-[220px] h-8" />
                      </div>
                    )}

                    {/* Tic-Tac-Toe Game Challenge Invite */}
                    {m.type === 'ttt_invite' && (
                      <div className="space-y-2 py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎮</span>
                          <div>
                            <span className="text-xs font-bold text-amber-300">
                              تحدي إكس أو (رهان {m.stake || 5} 🪙)
                            </span>
                            <p className="text-[10px] text-white/80">
                              الفائز يكسب {(m.stake || 5) * 2 - 2} عملة ذهبية!
                            </p>
                          </div>
                        </div>

                        {!m.handled && !isMe ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => onRespondTtt(m.id, m.from, 'accept')}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                            >
                              ✅ قبول
                            </button>
                            <button
                              onClick={() => onRespondTtt(m.id, m.from, 'decline')}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                            >
                              ❌ رفض
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-300 italic pt-1">
                            انتهى هذا التحدي
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {typingPartners[activePartner] && (
            <div className="text-xs text-purple-300 italic animate-pulse">
              ✍️ {activePartner} يكتب الآن...
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Emoji Tray */}
        {showEmoji && (
          <div className="p-2 bg-slate-900 border-t border-purple-500/20">
            <div className="grid grid-cols-9 gap-1 max-h-24 overflow-y-auto">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setInputText((prev) => prev + e)}
                  className="text-xl p-1 hover:bg-slate-800 rounded-lg text-center"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-purple-900/20 space-y-2">
          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="إرسال صورة"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSendImageMessage(f);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="hidden"
            />

            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="إيموجي"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Special Staff buttons */}
            {isPartnerStaff && !isFemale && (
              <button
                onClick={onOpenBuyModal}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>شحن</span>
              </button>
            )}

            {isPartnerStaff && isFemale && (
              <button
                onClick={onOpenWithdrawModal}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>سحب أرباح</span>
              </button>
            )}

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                onNotifyTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendText();
              }}
              placeholder="اكتب رسالة..."
              className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 transition-colors"
            />

            {/* Voice record button */}
            <button
              onClick={handleToggleVoiceRecord}
              className={`p-2 rounded-xl transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isRecording ? 'إيقاف وإرسال التسجيل' : 'تسجيل صوتي'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send button */}
            <button
              onClick={handleSendText}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              title="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {isRecording && (
            <div className="text-center text-xs text-rose-400 font-bold animate-pulse">
              🎙️ جاري تسجيل الصوت ({recordingSeconds}s)... انقر مجدداً لإنهاء الإرسال
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inbox View (Conversations List)
  return (
    <div className="space-y-4 pb-20">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الحساب أو رقم الـ ID..."
          className="w-full py-2.5 px-4 pr-10 rounded-2xl bg-slate-900/70 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
      </div>

      {/* Filter Segmented Control */}
      <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-purple-900/30 gap-1 overflow-x-auto">
        {(['all', 'online', 'unread', 'friends'] as const).map((tabKey) => {
          const labels = {
            all: 'الجميع',
            online: 'متصل 🟢',
            unread: 'غير مقروء 📩',
            friends: 'الأصدقاء 🤝',
          };
          const isActive = filter === tabKey;

          return (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-purple-200/70 px-1">
          المحادثات ({filteredPartners.length})
        </div>

        {filteredPartners.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
            لا توجد محادثات مطابقة للتصفية الحالية
          </div>
        ) : (
          filteredPartners.map((partner) => {
            const partnerAcc = cloudAccounts[partner];
            const isOnline = onlineUsers[partner] && now - onlineUsers[partner] <= 300000;
            const mutual = isMutualFriend(partner);
            const history = dmHistory[partner] || [];
            const lastMsg = history[history.length - 1];
            const unreadCount = unreadDm[partner] || 0;

            let previewText = 'ابدأ المحادثة الآن... ✨';
            if (lastMsg) {
              if (lastMsg.type === 'gift') previewText = `🎁 أرسل هدية: ${lastMsg.giftName}`;
              else if (lastMsg.type === 'img') previewText = '🖼️ صورة مرفقة';
              else if (lastMsg.type === 'voice') previewText = '🎤 رسالة صوتية';
              else if (lastMsg.type === 'ttt_invite') previewText = '🎮 تحدي إكس أو';
              else previewText = lastMsg.text || '';
            }

            return (
              <div
                key={partner}
                onClick={() => onSelectPartner(partner)}
                className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-purple-500/20">
                      {partnerAcc?.avatar ? (
                        <img src={partnerAcc.avatar} alt={partner} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center font-bold text-white text-base">
                          {partner.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">{partner}</span>
                      {mutual && (
                        <span className="text-[10px] text-emerald-400 font-bold">🤝 أصدقاء</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{previewText}</p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center shadow-md shadow-rose-500/40">
                    {unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
