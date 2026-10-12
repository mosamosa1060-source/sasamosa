import React, { useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';

// Icons & Models
import { UserAccount, DirectMessage, PostItem, RoomGiftEvent, RoomChatMsg, TicTacToeState, GiftOption } from './types';
import { BROKER_URL, ROOM_TOPIC, ADMIN_NAME, GIFT_COST, TTT_COMMISSION, ROOM_SEAT_COUNT } from './constants';
import { generateSessionId, generateUniqueId } from './utils/helpers';
import {
  getAudioContext,
  playBeep,
  playDmSound,
  playMicJoinSound,
  getBestMicStream,
  getRecorderOptions,
} from './utils/audio';

// Components
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { AuthScreen } from './components/AuthScreen';
import { OnlineUsersTab } from './components/OnlineUsersTab';
import { RoomsTab } from './components/RoomsTab';
import { ActiveRoomView } from './components/ActiveRoomView';
import { DMsTab } from './components/DMsTab';
import { GamesTab } from './components/GamesTab';
import { PostsTab } from './components/PostsTab';
import { ProfileTab } from './components/ProfileTab';

// Modals
import { AdminModal } from './components/modals/AdminModal';
import { GiftModal } from './components/modals/GiftModal';
import { RoomBgModal } from './components/modals/RoomBgModal';
import { CreateRoomModal } from './components/modals/CreateRoomModal';
import { InviteModal } from './components/modals/InviteModal';
import { LevelsModal } from './components/modals/LevelsModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { BuyCoinsModal, WithdrawModal } from './components/modals/FinanceModals';
import { ImageLightboxModal } from './components/modals/ImageLightboxModal';

export default function App() {
  // Session & Authentication
  const [mySessionId] = useState(() => generateSessionId());
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Accounts & Persistence
  const [cloudAccounts, setCloudAccounts] = useState<Record<string, UserAccount>>(() => {
    const raw = localStorage.getItem('cloud_accounts_sync_v25');
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed['sasa']) {
      parsed['sasa'] = {
        pass: 'mosa',
        points: 1000,
        gender: 'ذكر 👨',
        age: 25,
        bio: 'مؤسس المنصة 🌟',
        idNum: '99999999',
        isAdmin: true,
        isMod: false,
        avatar: '',
        mutedUntil: 0,
        isBanned: false,
        diamonds: 0,
        following: [],
        mutes: [],
        status: 'online',
      };
    }
    return parsed;
  });

  const [onlineUsers, setOnlineUsers] = useState<Record<string, number>>({});
  const [currentCoins, setCurrentCoins] = useState<number>(50);

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Audio & Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sound_on_v25') !== '0';
  });
  const [audioActive, setAudioActive] = useState(false);

  // Real-time MQTT
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Direct Messages
  const [dmHistory, setDmHistory] = useState<Record<string, DirectMessage[]>>(() => {
    const raw = localStorage.getItem('dm_history_v25');
    return raw ? JSON.parse(raw) : {};
  });
  const [unreadDm, setUnreadDm] = useState<Record<string, number>>({});
  const [activeDmPartner, setActiveDmPartner] = useState<string | null>(null);
  const [typingPartners, setTypingPartners] = useState<Record<string, boolean>>({});

  // Posts Feed
  const [postsFeed, setPostsFeed] = useState<PostItem[]>(() => {
    const raw = localStorage.getItem('posts_feed_v25');
    return raw ? JSON.parse(raw) : [];
  });

  // Invites
  const [myInvites, setMyInvites] = useState<{ friend: string; ts: number }[]>(() => {
    const raw = localStorage.getItem('my_invites_v25');
    return raw ? JSON.parse(raw) : [];
  });

  // Tic-Tac-Toe
  const [tttState, setTttState] = useState<TicTacToeState>({
    gameId: null,
    active: false,
    waiting: false,
    board: Array(9).fill(''),
    myMark: 'X',
    opp: null,
    myTurn: false,
    stake: 5,
    waitDeadline: 0,
  });

  // Rooms
  const [roomHeartbeats, setRoomHeartbeats] = useState<Record<string, number>>({});
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isMyRoomAdmin, setIsMyRoomAdmin] = useState(false);
  const [myRoomCustomName, setMyRoomCustomName] = useState('');
  const [roomSeats, setRoomSeats] = useState<Record<number | string, string | null>>({});
  const [roomMutes, setRoomMutes] = useState<Record<string, boolean>>({});
  const [roomBg, setRoomBg] = useState('linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #701a75 100%)');
  const [roomChatLog, setRoomChatLog] = useState<RoomChatMsg[]>([]);
  const [myRoomSeatIdx, setMyRoomSeatIdx] = useState<number | null>(null);
  const [isRoomMicMuted, setIsRoomMicMuted] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<RoomGiftEvent[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<RoomChatMsg[]>([]);

  // Room Audio Stream
  const roomStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioQueue = useRef<string[]>([]);
  const remoteAudioPlaying = useRef(false);

  // Modals state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftModalIsRoom, setGiftModalIsRoom] = useState(false);
  const [showRoomBgModal, setShowRoomBgModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState<string | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Sync to localStorage
  const saveCloudAccounts = useCallback((newAccs: Record<string, UserAccount>) => {
    setCloudAccounts(newAccs);
    localStorage.setItem('cloud_accounts_sync_v25', JSON.stringify(newAccs));
  }, []);

  const saveDmHistory = useCallback((newHist: Record<string, DirectMessage[]>) => {
    setDmHistory(newHist);
    localStorage.setItem('dm_history_v25', JSON.stringify(newHist));
  }, []);

  const savePostsFeed = useCallback((newPosts: PostItem[]) => {
    setPostsFeed(newPosts);
    localStorage.setItem('posts_feed_v25', JSON.stringify(newPosts));
  }, []);

  const saveInvites = useCallback((newInvs: { friend: string; ts: number }[]) => {
    setMyInvites(newInvs);
    localStorage.setItem('my_invites_v25', JSON.stringify(newInvs));
  }, []);

  // Publish helper
  const publish = useCallback((sub: string, payload: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish(`${ROOM_TOPIC}/${sub}`, JSON.stringify(payload));
    }
  }, []);

  // Change user coins helper
  const modifyUserCoins = useCallback(
    (targetName: string | null | undefined, delta: number) => {
      if (!targetName) return;
      setCloudAccounts((prev) => {
        const acc = prev[targetName];
        if (!acc) return prev;
        const updatedPoints = Math.max(0, (acc.points || 0) + delta);
        const updated = {
          ...prev,
          [targetName]: {
            ...acc,
            points: updatedPoints,
          },
        };
        saveCloudAccounts(updated);
        publish('sync_account', { name: targetName, user: updated[targetName] });
        if (targetName === currentUser) {
          setCurrentCoins(updatedPoints);
        }
        return updated;
      });
    },
    [currentUser, publish, saveCloudAccounts]
  );

  // Play remote audio chunk with web audio
  const playNextRemoteAudio = useCallback(() => {
    if (remoteAudioPlaying.current || remoteAudioQueue.current.length === 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const base64Data = remoteAudioQueue.current.shift();
      if (!base64Data) return;
      const binStr = atob(base64Data.split(',')[1] || base64Data);
      const arr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i);

      remoteAudioPlaying.current = true;
      ctx.decodeAudioData(arr.buffer.slice(0)).then((buf) => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.onended = () => {
          remoteAudioPlaying.current = false;
          playNextRemoteAudio();
        };
        src.start();
      }).catch(() => {
        remoteAudioPlaying.current = false;
        playNextRemoteAudio();
      });
    } catch {
      remoteAudioPlaying.current = false;
      playNextRemoteAudio();
    }
  }, []);

  const queueRemoteAudio = useCallback((audioBase64: string) => {
    remoteAudioQueue.current.push(audioBase64);
    playNextRemoteAudio();
  }, [playNextRemoteAudio]);

  // Connect to MQTT
  useEffect(() => {
    const client = mqtt.connect(BROKER_URL);
    clientRef.current = client;

    client.on('connect', () => {
      setIsConnected(true);
      const subTopics = [
        'game',
        'users',
        'sync_account',
        'admin_points',
        'request_db',
        'session_kick',
        'dm',
        'gift',
        'control',
        'typing',
        'dm_sync',
        'egypt_voice',
        'posts',
        'invite',
        'rooms',
        'rooms_voice',
        'room_chat',
      ];
      subTopics.forEach((s) => client.subscribe(`${ROOM_TOPIC}/${s}`));
      client.publish(`${ROOM_TOPIC}/request_db`, JSON.stringify({ req: true }));
    });

    client.on('offline', () => setIsConnected(false));
    client.on('error', () => setIsConnected(false));

    client.on('message', (topic, payload) => {
      try {
        const d = JSON.parse(payload.toString());
        const t = topic.toString();

        if (t.endsWith('/session_kick')) {
          if (currentUser && d.username === currentUser && d.sessionId !== mySessionId) {
            alert(d.adminKick ? '👢 تم طردك من الجلسة!' : '⚠️ تم فتح حسابك من جهاز آخر!');
            window.location.reload();
          }
        } else if (t.endsWith('/sync_account')) {
          if (d.db) {
            setCloudAccounts((prev) => {
              const merged = { ...prev, ...d.db };
              localStorage.setItem('cloud_accounts_sync_v25', JSON.stringify(merged));
              return merged;
            });
          } else if (d.name && d.user) {
            setCloudAccounts((prev) => {
              const updated = { ...prev, [d.name]: d.user };
              localStorage.setItem('cloud_accounts_sync_v25', JSON.stringify(updated));
              return updated;
            });
          }
        } else if (t.endsWith('/request_db')) {
          setCloudAccounts((accs) => {
            publish('sync_account', { db: accs });
            return accs;
          });
        } else if (t.endsWith('/users')) {
          if (d.name) {
            setOnlineUsers((prev) => ({ ...prev, [d.name]: Date.now() }));
            if (d.points !== undefined) {
              setCloudAccounts((prev) => {
                const u = prev[d.name];
                if (!u) return prev;
                return { ...prev, [d.name]: { ...u, points: d.points } };
              });
            }
          }
        } else if (t.endsWith('/admin_points')) {
          if (d.target) {
            setCloudAccounts((prev) => {
              const acc = prev[d.target];
              if (!acc) return prev;
              const updated = { ...prev, [d.target]: { ...acc, points: d.newPts } };
              localStorage.setItem('cloud_accounts_sync_v25', JSON.stringify(updated));
              return updated;
            });
            if (d.target === currentUser) {
              setCurrentCoins(d.newPts);
              showToast(`🎁 وصلتك ${d.amount} عملة من الإدارة!`);
            }
          }
        } else if (t.endsWith('/control')) {
          if (d.target) {
            setCloudAccounts((prev) => {
              const acc = prev[d.target];
              if (!acc) return prev;
              const next = { ...acc };
              if (d.mutedUntil !== undefined) next.mutedUntil = d.mutedUntil;
              if (d.isBanned !== undefined) next.isBanned = d.isBanned;
              if (d.pass !== undefined) next.pass = d.pass;
              if (d.isMod !== undefined) next.isMod = d.isMod;
              const updated = { ...prev, [d.target]: next };
              localStorage.setItem('cloud_accounts_sync_v25', JSON.stringify(updated));
              return updated;
            });
            if (d.target === currentUser && d.mutedUntil) {
              showToast(d.mutedUntil > Date.now() ? '🔇 تم كتمك من الإدارة' : '🔊 تم فك كتمك');
            }
          }
        } else if (t.endsWith('/dm')) {
          if (d.from === currentUser || d.to === currentUser) {
            const partner = d.from === currentUser ? d.to : d.from;
            setDmHistory((prev) => {
              const list = prev[partner] || [];
              if (list.some((m) => m.id === d.id)) return prev;
              const nextList = [...list, d];
              const updated = { ...prev, [partner]: nextList };
              localStorage.setItem('dm_history_v25', JSON.stringify(updated));
              return updated;
            });

            if (d.to === currentUser) {
              playDmSound(soundEnabled);
              if (activeDmPartner !== partner) {
                setUnreadDm((prev) => ({ ...prev, [partner]: (prev[partner] || 0) + 1 }));
                showToast(`📩 رسالة جديدة من ${partner}`);
              }
            }
          }
        } else if (t.endsWith('/typing')) {
          if (d.to === currentUser && d.name) {
            setTypingPartners((prev) => ({ ...prev, [d.name]: true }));
            setTimeout(() => {
              setTypingPartners((prev) => ({ ...prev, [d.name]: false }));
            }, 3000);
          }
        } else if (t.endsWith('/posts')) {
          if (d && d.from && d.from !== currentUser) {
            setPostsFeed((prev) => {
              const updated = [d, ...prev.filter((p) => p.id !== d.id)].slice(0, 60);
              localStorage.setItem('posts_feed_v25', JSON.stringify(updated));
              return updated;
            });
          }
        } else if (t.endsWith('/invite')) {
          if (d && d.type === 'joined' && d.inviter === currentUser) {
            setMyInvites((prev) => {
              const updated = [{ friend: d.friend, ts: Date.now() }, ...prev];
              localStorage.setItem('my_invites_v25', JSON.stringify(updated));
              return updated;
            });
            showToast(`✨ انضم صديق جديد عبر كود الدعوة الخاص بك: ${d.friend}`);
          }
        } else if (t.endsWith('/rooms')) {
          if (d.type === 'hb') {
            if (d.owner && d.owner !== currentUser) {
              setRoomHeartbeats((prev) => ({ ...prev, [d.owner]: Date.now() }));
              if (d.roomName) setRoomNames((prev) => ({ ...prev, [d.owner]: d.roomName }));
            }
          } else if (d.type === 'get') {
            if (isMyRoomAdmin && d.owner === currentUser) {
              publish('rooms', {
                type: 'state',
                room: currentUser,
                seats: roomSeats,
                mutes: roomMutes,
                bg: roomBg,
                roomName: myRoomCustomName,
              });
            }
          } else if (d.type === 'state') {
            if (d.room === currentRoom && !isMyRoomAdmin) {
              if (d.roomName) setRoomNames((prev) => ({ ...prev, [d.room]: d.roomName }));
              if (d.seats) setRoomSeats(d.seats);
              if (d.mutes) setRoomMutes(d.mutes);
              if (d.bg) setRoomBg(d.bg);
            }
          } else if (d.type === 'take_seat') {
            if (isMyRoomAdmin && d.room === currentUser) {
              const s = parseInt(d.seat, 10);
              setRoomSeats((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((k) => {
                  if (updated[k] === d.name) updated[k] = null;
                });
                if (!updated[s]) updated[s] = d.name;
                publish('rooms', {
                  type: 'state',
                  room: currentUser,
                  seats: updated,
                  mutes: roomMutes,
                  bg: roomBg,
                  roomName: myRoomCustomName,
                });
                return updated;
              });
            }
          } else if (d.type === 'leave_seat') {
            if (isMyRoomAdmin && d.room === currentUser) {
              setRoomSeats((prev) => {
                const updated = { ...prev };
                if (updated[d.seat] === d.name) updated[d.seat] = null;
                publish('rooms', {
                  type: 'state',
                  room: currentUser,
                  seats: updated,
                  mutes: roomMutes,
                  bg: roomBg,
                  roomName: myRoomCustomName,
                });
                return updated;
              });
            }
          } else if (d.type === 'kick') {
            if (!isMyRoomAdmin && d.room === currentRoom && d.name === currentUser) {
              showToast('👢 تم طردك من الغرفة من قِبل المشرف');
              leaveCurrentRoom();
            }
          } else if (d.type === 'gift') {
            if (currentRoom !== null && (d.room === currentRoom || d.room === currentUser)) {
              setFloatingGifts((prev) => [
                ...prev,
                { id: 'fg_' + Date.now(), room: d.room, from: d.from, to: d.to, gift: d.gift, giftName: d.giftName, msg: d.msg },
              ]);
              showToast(`🎁 ${d.from} أرسل ${d.gift} إلى ${d.to}!`);
            }
          } else if (d.type === 'room_closed') {
            if (!isMyRoomAdmin && d.room === currentRoom) {
              showToast('🔒 قام المشرف بإغلاق الغرفة');
              leaveCurrentRoom();
            }
          }
        } else if (t.endsWith('/rooms_voice')) {
          if (d.room === currentRoom && d.name !== currentUser && d.audio) {
            queueRemoteAudio(d.audio);
          }
        } else if (t.endsWith('/room_chat')) {
          if (d.room === currentRoom && d.from !== currentUser) {
            setRoomChatLog((prev) => [...prev.slice(-50), d]);
            setFloatingTexts((prev) => [...prev.slice(-3), d]);
            setTimeout(() => {
              setFloatingTexts((prev) => prev.filter((item) => item.id !== d.id));
            }, 5000);
          }
        } else if (t.endsWith('/game')) {
          // Tic-Tac-Toe events
          if (d.type === 'ttt_invite' && d.target === currentUser) {
            publish('dm', {
              id: 'tttinv_' + Date.now(),
              from: d.sender,
              to: currentUser,
              type: 'ttt_invite',
              gameId: d.gameId,
              stake: d.stake || 5,
              text: `🎮 ${d.sender} يتحداك في إكس أو برهان ${d.stake || 5} 🪙!`,
            });
          } else if (d.type === 'ttt_accept') {
            if (d.inviter === currentUser) {
              setTttState((prev) => ({
                ...prev,
                gameId: d.gameId,
                active: true,
                waiting: false,
                board: Array(9).fill(''),
                myMark: 'X',
                opp: d.accepter,
                myTurn: true,
                stake: d.stake || 5,
              }));
              setActiveTab('dms');
              showToast('✅ تم قبول التحدي — بالتوفيق!');
            }
          } else if (d.type === 'ttt_decline' && d.inviter === currentUser) {
            setTttState((prev) => {
              if (prev.waiting && prev.stake) {
                modifyUserCoins(currentUser, prev.stake);
                showToast(`❌ ${d.accepter} اعتذر عن التحدي — رُدّ رهانك (+${prev.stake} عملة)`);
              }
              return { ...prev, waiting: false, active: false };
            });
          } else if (d.type === 'ttt_move' && d.from !== currentUser) {
            setTttState((prev) => {
              if (!prev.active || prev.gameId !== d.gameId) return prev;
              const nextBoard = [...prev.board];
              nextBoard[d.i] = d.mark;

              // Check win
              const winMark = checkTttWinner(nextBoard);
              if (winMark === 'draw') {
                finishTtt(null, prev.stake, prev.opp, false);
                return { ...prev, board: nextBoard, active: false };
              } else if (winMark) {
                finishTtt(d.from, prev.stake, prev.opp, false);
                return { ...prev, board: nextBoard, active: false };
              } else {
                return { ...prev, board: nextBoard, myTurn: true };
              }
            });
          } else if (d.type === 'ttt_forfeit' && d.winner === currentUser) {
            setTttState((prev) => {
              if (prev.active) finishTtt(currentUser, prev.stake, prev.opp, false);
              return { ...prev, active: false };
            });
          }
        }
      } catch {
        // Ignore json parse error
      }
    });

    return () => {
      client.end();
    };
  }, [
    currentUser,
    mySessionId,
    soundEnabled,
    currentRoom,
    isMyRoomAdmin,
    roomSeats,
    roomMutes,
    roomBg,
    myRoomCustomName,
    activeDmPartner,
    publish,
    queueRemoteAudio,
    showToast,
    modifyUserCoins,
  ]);

  // Ping presence every 3 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      publish('users', { type: 'ping', name: currentUser, points: currentCoins });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser, currentCoins, publish]);

  // Clean stale online users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOnlineUsers((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((u) => {
          if (now - next[u] > 300000) {
            delete next[u];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Room host heartbeats
  useEffect(() => {
    if (!isMyRoomAdmin || !currentUser) return;
    const interval = setInterval(() => {
      publish('rooms', {
        type: 'hb',
        owner: currentUser,
        bg: roomBg,
        roomName: myRoomCustomName || `غرفة ${currentUser}`,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isMyRoomAdmin, currentUser, roomBg, myRoomCustomName, publish]);

  // Helper check TTT winner
  const checkTttWinner = (b: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, c, e2] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[e2]) return b[a];
    }
    return b.every((x) => !!x) ? 'draw' : null;
  };

  const finishTtt = (winner: string | null, stake: number, opp: string | null, announce: boolean) => {
    const prize = stake * 2 - TTT_COMMISSION;
    if (winner === currentUser) {
      modifyUserCoins(currentUser, prize);
      showToast(`🏆 مبروك! فزت بالجولة وحصلت على ${prize} عملة ذهبية!`);
    } else if (winner) {
      showToast(`😢 خسرت الرهان (${stake} عملة) — الفائز: ${winner}`);
    } else {
      modifyUserCoins(currentUser, stake);
      if (opp) modifyUserCoins(opp, stake);
      showToast(`🤝 تعادل! استرددت رهانك (${stake} عملة) بالكامل.`);
    }

    if (announce && opp) {
      const msg = winner
        ? `🏆 ${winner} فاز في تحدي إكس أو (+${prize} عملة)`
        : '🤝 انتهت جولة إكس أو بالتعادل';
      publish('dm', { id: 'tttend_' + Date.now(), sys: true, from: currentUser, to: opp, text: msg });
    }
  };

  // Leave room handler
  const leaveCurrentRoom = () => {
    if (roomStreamRef.current) {
      roomStreamRef.current.getTracks().forEach((t) => t.stop());
      roomStreamRef.current = null;
    }
    if (isMyRoomAdmin && currentUser) {
      publish('rooms', { type: 'room_closed', room: currentUser });
    } else if (currentRoom && myRoomSeatIdx !== null && currentUser) {
      publish('rooms', { type: 'leave_seat', room: currentRoom, seat: myRoomSeatIdx, name: currentUser });
    }
    setCurrentRoom(null);
    setIsMyRoomAdmin(false);
    setMyRoomSeatIdx(null);
    setIsRoomMicMuted(false);
    setRoomSeats({});
    setRoomChatLog([]);
    setFloatingGifts([]);
    setFloatingTexts([]);
  };

  // Broadcast microphone voice chunks in room
  const startRoomMicBroadcast = (stream: MediaStream) => {
    const recOpts = getRecorderOptions();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, recOpts);
    } catch {
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0 && !isRoomMicMuted && currentRoom && clientRef.current?.connected) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            publish('rooms_voice', {
              room: isMyRoomAdmin ? currentUser : currentRoom,
              name: currentUser,
              audio: ev.target.result,
            });
          }
        };
        reader.readAsDataURL(e.data);
      }
    };

    recorder.onstop = () => {
      if (currentRoom && roomStreamRef.current) {
        setTimeout(() => {
          try {
            startRoomMicBroadcast(stream);
          } catch {}
        }, 30);
      }
    };

    recorder.start();
    setTimeout(() => {
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {}
    }, 400);
  };

  // Take a seat in room
  const handleTakeSeat = async (seatIdx: number) => {
    if (!currentRoom || !currentUser) return;
    if (roomSeats[seatIdx]) {
      showToast('⚠️ هذا المقعد محجوز');
      return;
    }

    try {
      if (!roomStreamRef.current) {
        const stream = await getBestMicStream();
        roomStreamRef.current = stream;
        startRoomMicBroadcast(stream);
      }
      setMyRoomSeatIdx(seatIdx);
      setIsRoomMicMuted(false);
      publish('rooms', { type: 'take_seat', room: currentRoom, seat: seatIdx, name: currentUser });
      playMicJoinSound(soundEnabled);
      showToast(`🎙️ تم الانتقال للمقعد ${seatIdx + 1}`);
    } catch {
      showToast('❌ تعذر تفعيل الميكروفون!');
    }
  };

  // Toggle Mic inside room
  const handleToggleRoomMic = () => {
    if (!roomStreamRef.current) return;
    const nextState = !isRoomMicMuted;
    setIsRoomMicMuted(nextState);
    roomStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !nextState;
    });
    showToast(nextState ? '🔇 تم كتم المايك' : '🎙️ المايك مفتوح الآن');
  };

  // Start My Room
  const handleCreateRoom = (roomName: string) => {
    if (!currentUser) return;
    setMyRoomCustomName(roomName);
    setIsMyRoomAdmin(true);
    setCurrentRoom(currentUser);

    const initialSeats: Record<number | string, string | null> = {};
    for (let i = 0; i < ROOM_SEAT_COUNT; i++) initialSeats[i] = null;
    initialSeats[ROOM_SEAT_COUNT] = currentUser;
    setRoomSeats(initialSeats);

    getBestMicStream().then((stream) => {
      roomStreamRef.current = stream;
      setIsRoomMicMuted(false);
      startRoomMicBroadcast(stream);
    }).catch(() => {});

    publish('rooms', {
      type: 'state',
      room: currentUser,
      seats: initialSeats,
      mutes: {},
      bg: roomBg,
      roomName: roomName,
    });
    showToast('👑 غرفتك الصوتية المباشرة جاهزة الآن!');
  };

  // Join someone's room
  const handleJoinRoom = (owner: string) => {
    setCurrentRoom(owner);
    setIsMyRoomAdmin(false);
    setMyRoomSeatIdx(null);
    publish('rooms', { type: 'get', owner });
  };

  // Sending DM Text
  const handleSendDmText = (text: string) => {
    if (!activeDmPartner || !currentUser) return;
    const userAcc = cloudAccounts[currentUser];
    if (userAcc?.mutedUntil && userAcc.mutedUntil > Date.now()) {
      showToast('🔇 أنت مكتوم حالياً من قِبل الإدارة');
      return;
    }

    const partnerAcc = cloudAccounts[activeDmPartner];
    if (partnerAcc?.mutes?.includes(currentUser)) {
      showToast('⚠️ قام هذا المستخدم بكتمك، لا يمكن مراسلته');
      return;
    }

    // Check pricing: 3 coins for males unless staff or mutual friends
    const isStaff = userAcc?.isAdmin || userAcc?.isMod || partnerAcc?.isAdmin || partnerAcc?.isMod;
    const isMutual = userAcc?.following?.includes(activeDmPartner) && partnerAcc?.following?.includes(currentUser);
    const isFemale = userAcc?.gender?.includes('أنثى');

    if (!isStaff && !isMutual && !isFemale) {
      if (currentCoins < 3) {
        showToast('⚠️ رصيدك أقل من 3 عملات لإرسال الرسالة!');
        return;
      }
      modifyUserCoins(currentUser, -3);
      if (partnerAcc?.gender?.includes('أنثى')) {
        setCloudAccounts((prev) => {
          const u = prev[activeDmPartner];
          if (!u) return prev;
          const updated = { ...prev, [activeDmPartner]: { ...u, diamonds: (u.diamonds || 0) + 3 } };
          saveCloudAccounts(updated);
          publish('sync_account', { name: activeDmPartner, user: updated[activeDmPartner] });
          return updated;
        });
      }
    }

    const msg: DirectMessage = {
      id: 'dm_' + Date.now(),
      from: currentUser,
      to: activeDmPartner,
      text,
      timestamp: Date.now(),
    };

    publish('dm', msg);
    setDmHistory((prev) => {
      const list = prev[activeDmPartner] || [];
      const updated = { ...prev, [activeDmPartner]: [...list, msg] };
      saveDmHistory(updated);
      return updated;
    });
  };

  // Sending DM Image
  const handleSendDmImage = (file: File) => {
    if (!activeDmPartner || !currentUser) return;
    if (file.size > 280 * 1024) {
      showToast('⚠️ حجم الصورة كبير! اختر صورة أقل من 280KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgData = ev.target?.result as string;
      const msg: DirectMessage = {
        id: 'dmimg_' + Date.now(),
        from: currentUser,
        to: activeDmPartner,
        type: 'img',
        img: imgData,
        timestamp: Date.now(),
      };
      publish('dm', msg);
      setDmHistory((prev) => {
        const list = prev[activeDmPartner] || [];
        const updated = { ...prev, [activeDmPartner]: [...list, msg] };
        saveDmHistory(updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  // Sending DM Voice
  const handleSendDmVoice = (audioBase64: string) => {
    if (!activeDmPartner || !currentUser) return;
    const msg: DirectMessage = {
      id: 'dmvoice_' + Date.now(),
      from: currentUser,
      to: activeDmPartner,
      type: 'voice',
      audio: audioBase64,
      timestamp: Date.now(),
    };
    publish('dm', msg);
    setDmHistory((prev) => {
      const list = prev[activeDmPartner] || [];
      const updated = { ...prev, [activeDmPartner]: [...list, msg] };
      saveDmHistory(updated);
      return updated;
    });
    showToast('🎤 تم إرسال الرسالة الصوتية');
  };

  // Send Gift (in DM or in Room)
  const handleSendGift = (gift: GiftOption, target: string, customMsg?: string) => {
    if (!currentUser) return;
    if (currentCoins < gift.cost) {
      showToast(`⚠️ رصيدك غير كافٍ! تحتاج ${gift.cost} عملة.`);
      return;
    }

    modifyUserCoins(currentUser, -gift.cost);

    // If female recipient, add diamonds
    const targetAcc = cloudAccounts[target];
    if (targetAcc?.gender?.includes('أنثى')) {
      setCloudAccounts((prev) => {
        const u = prev[target];
        if (!u) return prev;
        const updated = { ...prev, [target]: { ...u, diamonds: (u.diamonds || 0) + gift.cost } };
        saveCloudAccounts(updated);
        publish('sync_account', { name: target, user: updated[target] });
        return updated;
      });
    }

    if (giftModalIsRoom && currentRoom) {
      // Room gift broadcast
      publish('rooms', {
        type: 'gift',
        room: isMyRoomAdmin ? currentUser : currentRoom,
        from: currentUser,
        to: target,
        gift: gift.e,
        giftName: gift.n,
        msg: customMsg || '',
      });
      setFloatingGifts((prev) => [
        ...prev,
        {
          id: 'fg_' + Date.now(),
          room: currentRoom,
          from: currentUser,
          to: target,
          gift: gift.e,
          giftName: gift.n,
          msg: customMsg || '',
        },
      ]);
      showToast(`🎁 أرسلت ${gift.e} ${gift.n} إلى ${target}!`);
    } else {
      // Direct message gift
      const giftMsg: DirectMessage = {
        id: 'gift_' + Date.now(),
        from: currentUser,
        to: target,
        type: 'gift',
        gift: gift.e,
        giftName: gift.n,
        amount: gift.cost,
        timestamp: Date.now(),
      };
      publish('dm', giftMsg);
      setDmHistory((prev) => {
        const list = prev[target] || [];
        const updated = { ...prev, [target]: [...list, giftMsg] };
        saveDmHistory(updated);
        return updated;
      });
      showToast(`🎁 تم إرسال ${gift.e} ${gift.n} إلى ${target}`);
    }
  };

  // Tic-Tac-Toe Actions
  const handleInvitePlayerTtt = (target: string, stake: number) => {
    if (!currentUser) return;
    if (currentCoins < stake) {
      showToast(`⚠️ رصيدك غير كافٍ لرهان ${stake} عملة!`);
      return;
    }
    modifyUserCoins(currentUser, -stake);
    const gameId = 'g_' + Date.now();
    setTttState({
      gameId,
      active: false,
      waiting: true,
      board: Array(9).fill(''),
      myMark: 'X',
      opp: target,
      myTurn: false,
      stake,
      waitDeadline: Date.now() + 60000,
    });
    publish('game', { type: 'ttt_invite', sender: currentUser, target, gameId, stake });
    showToast(`⏳ أُرسل التحدي إلى ${target} برهان ${stake} عملة`);
  };

  const handleRespondTtt = (inviteId: string, fromUser: string, action: 'accept' | 'decline') => {
    if (!currentUser) return;
    setDmHistory((prev) => {
      const list = prev[fromUser] || [];
      const updated = list.map((m) => (m.id === inviteId ? { ...m, handled: true } : m));
      saveDmHistory({ ...prev, [fromUser]: updated });
      return { ...prev, [fromUser]: updated };
    });

    if (action === 'accept') {
      const msg = (dmHistory[fromUser] || []).find((m) => m.id === inviteId);
      const stake = msg?.stake || 5;
      if (currentCoins < stake) {
        showToast(`⚠️ رصيدك غير كافٍ لقبول رهان ${stake} عملة!`);
        return;
      }
      modifyUserCoins(currentUser, -stake);
      const gameId = msg?.gameId || 'g_' + Date.now();
      publish('game', { type: 'ttt_accept', inviter: fromUser, accepter: currentUser, gameId, stake });
      setTttState({
        gameId,
        active: true,
        waiting: false,
        board: Array(9).fill(''),
        myMark: 'O',
        opp: fromUser,
        myTurn: false,
        stake,
        waitDeadline: 0,
      });
      setActiveTab('dms');
      showToast('✅ قبلت التحدي! بدأت اللعبة');
    } else {
      publish('game', { type: 'ttt_decline', inviter: fromUser, accepter: currentUser });
      showToast('❌ تم رفض التحدي');
    }
  };

  const handlePlayTttCell = (index: number) => {
    if (!tttState.active || !tttState.myTurn || tttState.board[index] || !currentUser) return;
    const nextBoard = [...tttState.board];
    nextBoard[index] = tttState.myMark;
    publish('game', {
      type: 'ttt_move',
      gameId: tttState.gameId,
      from: currentUser,
      mark: tttState.myMark,
      i: index,
    });

    const winMark = checkTttWinner(nextBoard);
    if (winMark === 'draw') {
      finishTtt(null, tttState.stake, tttState.opp, true);
      setTttState((prev) => ({ ...prev, board: nextBoard, active: false }));
    } else if (winMark) {
      finishTtt(currentUser, tttState.stake, tttState.opp, true);
      setTttState((prev) => ({ ...prev, board: nextBoard, active: false }));
    } else {
      setTttState((prev) => ({ ...prev, board: nextBoard, myTurn: false }));
    }
  };

  const handleExitTtt = () => {
    if (tttState.active && tttState.opp && currentUser) {
      publish('game', {
        type: 'ttt_forfeit',
        gameId: tttState.gameId,
        loser: currentUser,
        winner: tttState.opp,
      });
      finishTtt(tttState.opp, tttState.stake, tttState.opp, true);
    }
    setTttState((prev) => ({ ...prev, active: false, waiting: false }));
  };

  // Toggle user follow
  const handleToggleFollow = (targetName: string) => {
    if (!currentUser) return;
    setCloudAccounts((prev) => {
      const myAcc = prev[currentUser];
      if (!myAcc) return prev;
      const following = myAcc.following ? [...myAcc.following] : [];
      const idx = following.indexOf(targetName);
      if (idx > -1) {
        following.splice(idx, 1);
        showToast(`تم إلغاء متابعة ${targetName}`);
      } else {
        following.push(targetName);
        showToast(`أنت تتابع ${targetName} الآن ✨`);
        publish('dm', {
          id: 'follow_' + Date.now(),
          sys: true,
          from: currentUser,
          to: targetName,
          text: `✨ قام ${currentUser} بمتابعتك الآن!`,
        });
      }
      const updated = { ...prev, [currentUser]: { ...myAcc, following } };
      saveCloudAccounts(updated);
      publish('sync_account', { name: currentUser, user: updated[currentUser] });
      return updated;
    });
  };

  // Toggle user mute
  const handleToggleMuteUser = (targetName: string) => {
    if (!currentUser) return;
    setCloudAccounts((prev) => {
      const myAcc = prev[currentUser];
      if (!myAcc) return prev;
      const mutes = myAcc.mutes ? [...myAcc.mutes] : [];
      const idx = mutes.indexOf(targetName);
      if (idx > -1) {
        mutes.splice(idx, 1);
        showToast(`🔊 تم إلغاء كتم ${targetName}`);
      } else {
        mutes.push(targetName);
        showToast(`🔇 تم كتم ${targetName} بنجاح`);
      }
      const updated = { ...prev, [currentUser]: { ...myAcc, mutes } };
      saveCloudAccounts(updated);
      publish('sync_account', { name: currentUser, user: updated[currentUser] });
      return updated;
    });
  };

  // If not logged in, show AuthScreen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <AuthScreen
          cloudAccounts={cloudAccounts}
          onLoginSuccess={(name, acc) => {
            setCurrentUser(name);
            setCurrentCoins(acc.points || 50);
            publish('session_kick', { username: name, sessionId: mySessionId });
            publish('users', { type: 'join', name, points: acc.points || 50 });
            showToast(`أهلاً بك يا ${name} في دردشة النجوم! 🌟`);
          }}
          onRegisterAccount={(name, acc) => {
            setCloudAccounts((prev) => {
              const updated = { ...prev, [name]: acc };
              saveCloudAccounts(updated);
              publish('sync_account', { name, user: acc });
              return updated;
            });
            if (acc.invitedBy) {
              publish('invite', { type: 'joined', inviter: acc.invitedBy, friend: name });
            }
          }}
        />
        <Toast message={toastMessage} />
      </div>
    );
  }

  const currentUserAccount = cloudAccounts[currentUser];
  const totalUnreadCount = Object.values(unreadDm).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col items-center">
      {/* Phone container layout frame */}
      <div className="w-full max-w-lg min-h-screen bg-slate-950 flex flex-col relative shadow-2xl border-x border-purple-900/10">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          account={currentUserAccount}
          coins={currentCoins}
          soundEnabled={soundEnabled}
          audioActive={audioActive}
          isConnected={isConnected}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            localStorage.setItem('sound_on_v25', next ? '1' : '0');
            showToast(next ? '🔊 نغمات الصوت مفعلة' : '🔇 نغمات الصوت صامتة');
          }}
          onEnableAudio={() => {
            getAudioContext();
            setAudioActive(true);
            showToast('🔊 تم تفعيل الصوت في المتصفح بنجاح');
          }}
          onOpenAdmin={() => setShowAdminModal(true)}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'chat' && (
            <OnlineUsersTab
              currentUser={currentUser}
              cloudAccounts={cloudAccounts}
              onlineUsers={onlineUsers}
              onOpenUserModal={(name) => setShowUserProfileModal(name)}
              onOpenDmWith={(name) => {
                setActiveDmPartner(name);
                setActiveTab('dms');
              }}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsTab
              currentUser={currentUser}
              roomHeartbeats={roomHeartbeats}
              roomNames={roomNames}
              onOpenCreateModal={() => setShowCreateRoomModal(true)}
              onJoinRoom={handleJoinRoom}
              onEnterMyRoom={() => {
                handleCreateRoom(myRoomCustomName || `غرفة ${currentUser}`);
              }}
              hasMyRoom={isMyRoomAdmin}
            />
          )}

          {activeTab === 'dms' && (
            <DMsTab
              currentUser={currentUser}
              cloudAccounts={cloudAccounts}
              onlineUsers={onlineUsers}
              dmHistory={dmHistory}
              unreadDm={unreadDm}
              activePartner={activeDmPartner}
              typingPartners={typingPartners}
              onSelectPartner={(partner) => {
                setActiveDmPartner(partner);
                setUnreadDm((prev) => ({ ...prev, [partner]: 0 }));
              }}
              onCloseConversation={() => setActiveDmPartner(null)}
              onSendTextMessage={handleSendDmText}
              onSendVoiceMessage={handleSendDmVoice}
              onSendImageMessage={handleSendDmImage}
              onOpenGiftModal={() => {
                setGiftModalIsRoom(false);
                setShowGiftModal(true);
              }}
              onOpenBuyModal={() => setShowBuyModal(true)}
              onOpenWithdrawModal={() => setShowWithdrawModal(true)}
              onNotifyTyping={() => {
                if (activeDmPartner) {
                  publish('typing', { name: currentUser, to: activeDmPartner });
                }
              }}
              onRespondTtt={handleRespondTtt}
              onViewImage={(url) => setLightboxImage(url)}
            />
          )}

          {activeTab === 'posts' && (
            <PostsTab
              currentUser={currentUser}
              cloudAccounts={cloudAccounts}
              posts={postsFeed}
              onPublishPost={(text, imgData) => {
                const newPost: PostItem = {
                  id: 'post_' + Date.now(),
                  from: currentUser,
                  text,
                  img: imgData,
                  ts: Date.now(),
                };
                const updated = [newPost, ...postsFeed].slice(0, 60);
                savePostsFeed(updated);
                publish('posts', newPost);
                showToast('✨ تم نشر المنشور بنجاح!');
              }}
              onViewImage={(url) => setLightboxImage(url)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              account={currentUserAccount}
              coins={currentCoins}
              onOpenGames={() => {
                // Open games view or switch
                setTttState((prev) => ({ ...prev, active: false }));
                setActiveTab('chat');
                showToast('🎮 اختر خصماً للتحدي من قائمة المتصلين أو ابدأ من ساحة إكس أو');
              }}
              onOpenInvite={() => setShowInviteModal(true)}
              onOpenLevels={() => setShowLevelsModal(true)}
              onOpenEditProfile={() => setShowEditProfileModal(true)}
              onShowToast={showToast}
              onLogout={() => {
                setCurrentUser(null);
                showToast('👋 تم تسجيل الخروج');
              }}
              onChangeAvatar={(file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const avatarData = ev.target?.result as string;
                  setCloudAccounts((prev) => {
                    const u = prev[currentUser];
                    if (!u) return prev;
                    const updated = { ...prev, [currentUser]: { ...u, avatar: avatarData } };
                    saveCloudAccounts(updated);
                    publish('sync_account', { name: currentUser, user: updated[currentUser] });
                    return updated;
                  });
                  showToast('🖼️ تم تحديث صورتك الشخصية!');
                };
                reader.readAsDataURL(file);
              }}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation
          currentTab={activeTab}
          unreadCount={totalUnreadCount}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'dms') setActiveDmPartner(null);
          }}
        />

        {/* Active Voice Room Full-Screen Overlay */}
        {currentRoom !== null && (
          <ActiveRoomView
            currentUser={currentUser}
            roomName={currentRoom}
            roomTitle={roomNames[currentRoom] || `غرفة ${currentRoom}`}
            isOwner={isMyRoomAdmin}
            roomSeats={roomSeats}
            roomMutes={roomMutes}
            roomBg={roomBg}
            cloudAccounts={cloudAccounts}
            roomChatLog={roomChatLog}
            mySeatIdx={myRoomSeatIdx}
            isMicMuted={isRoomMicMuted}
            onLeaveRoom={leaveCurrentRoom}
            onTakeSeat={handleTakeSeat}
            onToggleMic={handleToggleRoomMic}
            onAdminKick={(seatIdx) => {
              const victim = roomSeats[seatIdx];
              if (victim) {
                publish('rooms', { type: 'kick', room: currentUser, name: victim });
                setRoomSeats((prev) => ({ ...prev, [seatIdx]: null }));
                showToast(`👢 تم طرد ${victim} من المقعد`);
              }
            }}
            onAdminMute={(seatIdx) => {
              const victim = roomSeats[seatIdx];
              if (victim) {
                const isCurrentlyMuted = !!roomMutes[victim];
                const nextMutes = { ...roomMutes, [victim]: !isCurrentlyMuted };
                setRoomMutes(nextMutes);
                publish('rooms', {
                  type: 'state',
                  room: currentUser,
                  seats: roomSeats,
                  mutes: nextMutes,
                  bg: roomBg,
                  roomName: myRoomCustomName,
                });
                showToast(!isCurrentlyMuted ? `🔇 تم كتم مايك ${victim}` : `🎙️ تم فك كتم ${victim}`);
              }
            }}
            onOpenBgPicker={() => {
              if (isMyRoomAdmin) setShowRoomBgModal(true);
              else showToast('⚠️ تغيير خلفية الغرفة متاح للمضيف فقط 👑');
            }}
            onOpenGiftModal={() => {
              setGiftModalIsRoom(true);
              setShowGiftModal(true);
            }}
            onSendChatMessage={(text) => {
              const msg: RoomChatMsg = {
                id: 'rc_' + Date.now(),
                room: isMyRoomAdmin ? currentUser : currentRoom,
                from: currentUser,
                text,
                ts: Date.now(),
              };
              publish('room_chat', msg);
              setRoomChatLog((prev) => [...prev.slice(-50), msg]);
              setFloatingTexts((prev) => [...prev.slice(-3), msg]);
              setTimeout(() => {
                setFloatingTexts((prev) => prev.filter((item) => item.id !== msg.id));
              }, 5000);
            }}
            onSendImageMessage={(file) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const msg: RoomChatMsg = {
                  id: 'rcimg_' + Date.now(),
                  room: isMyRoomAdmin ? currentUser : currentRoom,
                  from: currentUser,
                  img: ev.target?.result as string,
                  ts: Date.now(),
                };
                publish('room_chat', msg);
                setRoomChatLog((prev) => [...prev.slice(-50), msg]);
              };
              reader.readAsDataURL(file);
            }}
            floatingGifts={floatingGifts}
            floatingTexts={floatingTexts}
            onOpenXO={() => {
              // Open XO modal / trigger challenge
              setShowUserProfileModal(null);
              showToast('🎮 اختر خصماً من قائمة المتصلين لبدء تحدي إكس أو!');
            }}
          />
        )}
      </div>

      {/* Floating Toast */}
      <Toast message={toastMessage} />

      {/* Modals */}
      {showAdminModal && (
        <AdminModal
          currentUser={currentUser}
          account={currentUserAccount}
          cloudAccounts={cloudAccounts}
          onClose={() => setShowAdminModal(false)}
          onChangePassword={(target, newPass) => {
            setCloudAccounts((prev) => {
              const u = prev[target];
              if (!u) {
                showToast('❌ الحساب غير موجود');
                return prev;
              }
              const updated = { ...prev, [target]: { ...u, pass: newPass } };
              saveCloudAccounts(updated);
              publish('control', { target, pass: newPass });
              showToast(`🔒 تم تغيير كلمة مرور ${target} بنجاح`);
              return updated;
            });
          }}
          onToggleMod={(target) => {
            setCloudAccounts((prev) => {
              const u = prev[target];
              if (!u) {
                showToast('❌ الحساب غير موجود');
                return prev;
              }
              const nextMod = !u.isMod;
              const updated = { ...prev, [target]: { ...u, isMod: nextMod } };
              saveCloudAccounts(updated);
              publish('control', { target, isMod: nextMod });
              showToast(`🛡️ تم تحديث رتبة ${target}: ${nextMod ? 'مشرف مساعد' : 'مستخدم عادي'}`);
              return updated;
            });
          }}
          onGrantPoints={(target, amount) => {
            modifyUserCoins(target, amount);
            showToast(`🪙 تم شحن ${amount} عملة إلى ${target}`);
          }}
          onMuteUser={(target, mins) => {
            const until = mins > 0 ? Date.now() + mins * 60000 : 0;
            setCloudAccounts((prev) => {
              const u = prev[target];
              if (!u) {
                showToast('❌ الحساب غير موجود');
                return prev;
              }
              const updated = { ...prev, [target]: { ...u, mutedUntil: until } };
              saveCloudAccounts(updated);
              publish('control', { target, mutedUntil: until });
              showToast(until ? `🔇 تم كتم ${target} لمدة ${mins} دقيقة` : `🔊 تم فك كتم ${target}`);
              return updated;
            });
          }}
        />
      )}

      {showGiftModal && (
        <GiftModal
          isRoomMode={giftModalIsRoom}
          partnerName={activeDmPartner || ''}
          roomUsers={Object.values(roomSeats).filter((u): u is string => !!u && u !== currentUser)}
          myCoins={currentCoins}
          onClose={() => setShowGiftModal(false)}
          onSendGift={handleSendGift}
        />
      )}

      {showRoomBgModal && (
        <RoomBgModal
          currentBg={roomBg}
          onClose={() => setShowRoomBgModal(false)}
          onSelectBg={(css) => {
            setRoomBg(css);
            if (isMyRoomAdmin && currentUser) {
              publish('rooms', {
                type: 'state',
                room: currentUser,
                seats: roomSeats,
                mutes: roomMutes,
                bg: css,
                roomName: myRoomCustomName,
              });
            }
          }}
          onUploadCustomBg={(file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const css = `url('${ev.target?.result}')`;
              setRoomBg(css);
              if (isMyRoomAdmin && currentUser) {
                publish('rooms', {
                  type: 'state',
                  room: currentUser,
                  seats: roomSeats,
                  mutes: roomMutes,
                  bg: css,
                  roomName: myRoomCustomName,
                });
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      )}

      {showCreateRoomModal && (
        <CreateRoomModal
          onClose={() => setShowCreateRoomModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}

      {showInviteModal && (
        <InviteModal
          idNum={currentUserAccount?.idNum || ''}
          myInvites={myInvites}
          onClose={() => setShowInviteModal(false)}
          onCopySuccess={() => showToast('📋 تم نسخ كود الدعوة بنجاح!')}
        />
      )}

      {showLevelsModal && (
        <LevelsModal
          diamonds={currentUserAccount?.diamonds || 0}
          onClose={() => setShowLevelsModal(false)}
        />
      )}

      {showUserProfileModal && (
        <UserProfileModal
          targetUser={showUserProfileModal}
          account={cloudAccounts[showUserProfileModal]}
          isFollowing={!!currentUserAccount?.following?.includes(showUserProfileModal)}
          isMuted={!!currentUserAccount?.mutes?.includes(showUserProfileModal)}
          onClose={() => setShowUserProfileModal(null)}
          onToggleFollow={() => handleToggleFollow(showUserProfileModal)}
          onToggleMute={() => handleToggleMuteUser(showUserProfileModal)}
          onStartDm={() => {
            setActiveDmPartner(showUserProfileModal);
            setActiveTab('dms');
          }}
        />
      )}

      {showEditProfileModal && (
        <EditProfileModal
          account={currentUserAccount}
          onClose={() => setShowEditProfileModal(false)}
          onSave={(newAge, newBio) => {
            setCloudAccounts((prev) => {
              const u = prev[currentUser];
              if (!u) return prev;
              const updated = { ...prev, [currentUser]: { ...u, age: newAge, bio: newBio } };
              saveCloudAccounts(updated);
              publish('sync_account', { name: currentUser, user: updated[currentUser] });
              showToast('✅ تم حفظ التعديلات بنجاح');
              return updated;
            });
          }}
          onCopyId={() => {
            if (currentUserAccount?.idNum) {
              navigator.clipboard?.writeText(currentUserAccount.idNum);
              showToast(`📋 تم نسخ رقم الـ ID: ${currentUserAccount.idNum}`);
            }
          }}
        />
      )}

      {showBuyModal && (
        <BuyCoinsModal
          onClose={() => setShowBuyModal(false)}
          onRequestBuy={(pts) => {
            publish('dm', {
              id: 'req_' + Date.now(),
              sys: true,
              from: currentUser,
              to: ADMIN_NAME,
              text: `💎 طلب شحن عملات من ${currentUser}: ${pts} عملة ($${(pts / 50).toFixed(2)})`,
            });
            showToast('✅ تم إرسال طلب الشحن للمدير في المحادثة الخاصة');
          }}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          myCoins={currentCoins}
          onClose={() => setShowWithdrawModal(false)}
          onRequestWithdraw={(amt) => {
            publish('dm', {
              id: 'wdr_' + Date.now(),
              sys: true,
              from: currentUser,
              to: ADMIN_NAME,
              text: `💸 طلب سحب أرباح من ${currentUser}: ${amt} عملة`,
            });
            showToast('✅ تم إرسال طلب سحب الأرباح للمدير');
          }}
        />
      )}

      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
