import React, { useState } from 'react';
import { Camera, Sparkles, User, Lock, Calendar, Users, KeyRound, ArrowRight } from 'lucide-react';
import { UserAccount } from '../types';
import { generateUniqueId } from '../utils/helpers';

interface AuthScreenProps {
  cloudAccounts: Record<string, UserAccount>;
  onLoginSuccess: (username: string, account: UserAccount) => void;
  onRegisterAccount: (username: string, account: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  cloudAccounts,
  onLoginSuccess,
  onRegisterAccount,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [gender, setGender] = useState('ذكر 👨');
  const [age, setAge] = useState('22');
  const [inviteCode, setInviteCode] = useState('');
  const [avatarData, setAvatarData] = useState('');
  const [error, setError] = useState('');

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      setError('⚠️ حجم الصورة كبير! يرجى اختيار صورة أقل من 300 كيلوبايت.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanName = name.trim();
    if (!cleanName || !pass) {
      setError('⚠️ يرجى إدخال اسم الحساب وكلمة المرور.');
      return;
    }

    if (tab === 'register') {
      if (pass !== passConfirm) {
        setError('❌ كلمة المرور غير متطابقة!');
        return;
      }
      const numAge = parseInt(age, 10);
      if (!numAge || numAge < 10) {
        setError('⚠️ العمر يجب أن يكون 10 سنوات فما فوق.');
        return;
      }
      if (cloudAccounts[cleanName]) {
        setError('⚠️ هذا الاسم مسجل مسبقاً، اختر اسماً آخر.');
        return;
      }

      const idNum = generateUniqueId();
      const newAcc: UserAccount = {
        pass,
        points: 50,
        gender,
        age: numAge,
        bio: 'مستخدم جديد في دردشة النجوم ✨',
        idNum,
        isAdmin: false,
        isMod: false,
        avatar: avatarData,
        mutedUntil: 0,
        isBanned: false,
        diamonds: 0,
        following: [],
        mutes: [],
        invitedBy: '',
        status: 'online',
      };

      if (inviteCode.trim()) {
        const invTarget = Object.keys(cloudAccounts).find(
          (k) => cloudAccounts[k].idNum === inviteCode.trim()
        );
        if (invTarget) {
          newAcc.invitedBy = invTarget;
        }
      }

      onRegisterAccount(cleanName, newAcc);
      onLoginSuccess(cleanName, newAcc);
    } else {
      const userAcc = cloudAccounts[cleanName];
      if (!userAcc || userAcc.pass !== pass) {
        setError('❌ اسم المستخدم أو كلمة المرور غير صحيحة!');
        return;
      }
      if (userAcc.isBanned) {
        setError('🚷 هذا الحساب محظور من دخول التطبيق.');
        return;
      }
      onLoginSuccess(cleanName, userAcc);
    }
  };

  const handleQuickAdmin = () => {
    setName('sasa');
    setPass('mosa');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/60 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-6 relative">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-0.5 shadow-xl shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center text-3xl">
              🌟
            </div>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
            دردشة النجوم
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">
            صوت مباشر، محادثات خاصة، وتحديات ألعاب تفاعلية 🎙️✨
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-purple-900/30 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 حساب جديد
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="text-center mb-4">
              <label className="relative inline-block cursor-pointer group">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-400/50 group-hover:border-purple-400 flex items-center justify-center overflow-hidden bg-slate-950/70 shadow-inner">
                  {avatarData ? (
                    <img src={avatarData} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-purple-300">
                      <Camera className="w-6 h-6 mb-1 text-purple-400" />
                      <span className="text-[10px]">صورتك</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">انقر لإضافة صورتك الشخصية</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              🏷️ اسم الحساب
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسم الحساب..."
                maxLength={20}
                className="w-full py-2.5 px-4 pr-10 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              🔒 كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="كلمة المرور..."
                maxLength={30}
                className="w-full py-2.5 px-4 pr-10 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
            </div>
          </div>

          {tab === 'register' && (
            <>
              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  🔒 تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passConfirm}
                    onChange={(e) => setPassConfirm(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور..."
                    maxLength={30}
                    className="w-full py-2.5 px-4 pr-10 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    ⚧ النوع
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 text-white text-sm outline-none transition-all"
                  >
                    <option value="ذكر 👨">ذكر 👨</option>
                    <option value="أنثى 👩">أنثى 👩</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    🎂 العمر
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 text-white text-sm outline-none transition-all text-center font-bold"
                  />
                </div>
              </div>

              {/* Invite Code */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  🎁 كود الدعوة (اختياري)
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="ID صديقك الداعي..."
                  maxLength={12}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-purple-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{tab === 'login' ? 'دخول التطبيق 🚀' : 'إنشاء الحساب ومتابعة ✨'}</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>

        {/* Quick Admin test sign-in helper */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickAdmin}
            className="text-xs text-purple-300/80 hover:text-purple-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>تجربة حساب المدير التجريبي (sasa)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
