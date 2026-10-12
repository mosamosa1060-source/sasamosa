export interface UserAccount {
  pass: string;
  points: number;
  gender: string;
  age: number;
  bio: string;
  idNum: string;
  isAdmin?: boolean;
  isMod?: boolean;
  avatar?: string;
  mutedUntil?: number;
  isBanned?: boolean;
  diamonds?: number;
  following?: string[];
  mutes?: string[];
  invitedBy?: string;
  status?: 'online' | 'busy' | 'away';
}

export interface DirectMessage {
  id: string;
  from: string;
  to: string;
  text?: string;
  type?: 'gift' | 'img' | 'voice' | 'ttt_invite';
  gift?: string;
  giftName?: string;
  amount?: number;
  img?: string;
  audio?: string;
  gameId?: string;
  stake?: number;
  handled?: boolean;
  sys?: boolean;
  timestamp?: number;
}

export interface PostItem {
  id: string;
  from: string;
  text?: string;
  img?: string;
  ts: number;
}

export interface RoomGiftEvent {
  room: string;
  from: string;
  to: string;
  gift: string;
  giftName: string;
  msg: string;
  id?: string;
}

export interface RoomChatMsg {
  id: string;
  room: string;
  from: string;
  text?: string;
  img?: string;
  ts?: number;
}

export interface TicTacToeState {
  gameId: string | null;
  active: boolean;
  waiting: boolean;
  board: string[];
  myMark: 'X' | 'O';
  opp: string | null;
  myTurn: boolean;
  stake: number;
  waitDeadline: number;
}

export interface GiftOption {
  e: string;
  n: string;
  cost: number;
}
