import React from 'react';
import {
  Home,
  MessageSquare,
  Map as MapIcon,
  AlertTriangle,
  Tractor,
  Radio,
  Leaf,
  Sparkles,
  Bot,
} from 'lucide-react';

export type TabType = 'home' | 'chat' | 'map' | 'risk' | 'farmer' | 'disaster' | 'twin' | 'twinview';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickAsk: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAsk,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'risk', label: 'Risk', icon: AlertTriangle },
    { id: 'farmer', label: 'Farmer', icon: Tractor },
    { id: 'disaster', label: 'Disaster', icon: Radio },
    { id: 'twinview', label: 'TwinView', icon: Sparkles },
  ];

  return (
    <>
      {/* Floating Ask WeatherGPT Pill Button (Right side, floats above bottom nav) */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-40">
        <button
          id="floating-ask-weathergpt-btn"
          onClick={onOpenQuickAsk}
          className="group flex items-center gap-2 rounded-full border border-blue-400/40 bg-white/95 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xl shadow-blue-500/15 backdrop-blur-md transition-all hover:scale-105 hover:bg-blue-50 dark:border-blue-500/40 dark:bg-zinc-900/95 dark:text-blue-300 dark:hover:bg-zinc-800"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white group-hover:animate-pulse">
            <Bot className="h-3 w-3" />
          </div>
          <span>ASK WEATHERGPT</span>
        </button>
      </div>

      {/* Floating Bottom Navigation Dock */}
      <nav
        id="bottom-dock-navigation"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl"
      >
        <div className="flex items-center justify-between gap-1 rounded-full border border-zinc-200/90 bg-white/95 px-2.5 py-1.5 shadow-2xl shadow-zinc-900/10 backdrop-blur-lg transition-colors dark:border-zinc-800/90 dark:bg-zinc-900/95">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-1 flex-col items-center justify-center rounded-full py-1 text-center transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 scale-105'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] leading-tight tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
