import React from 'react';
import { Users, Radio, MessageSquare, Send, User } from 'lucide-react';

export type TabType = 'chat' | 'rooms' | 'dms' | 'posts' | 'profile';

interface BottomNavigationProps {
  currentTab: TabType;
  unreadCount: number;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  unreadCount,
  onTabChange,
}) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'المتصلون', icon: Users },
    { id: 'rooms' as TabType, label: 'الغرف', icon: Radio },
    { id: 'dms' as TabType, label: 'الرسائل', icon: MessageSquare, badge: unreadCount },
    { id: 'posts' as TabType, label: 'النشر', icon: Send },
    { id: 'profile' as TabType, label: 'ملفي', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-purple-900/20 max-w-lg mx-auto shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-600/40 -translate-y-0.5'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[11px] font-bold ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Notification badge */}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 left-3 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
