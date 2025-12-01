import React from 'react';
import { Home, MessageSquareText, FilePlus2, Activity, Settings } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const menuItems = [
    { id: AppMode.DASHBOARD, icon: Home, label: 'Início' },
    { id: AppMode.CHATBOT, icon: MessageSquareText, label: 'Assistente (MTC)' },
    { id: AppMode.FORM_BUILDER, icon: FilePlus2, label: 'Construtor de Fichas' },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 flex-shrink-0 z-20 shadow-xl">
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg shadow-blue-900/50">
          <Activity size={24} />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-white font-bold text-lg leading-tight">e-SUS APS</h1>
          <p className="text-xs text-slate-500 font-medium">AI Suite v1.0</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
        <p className="hidden lg:block text-xs font-semibold text-slate-500 uppercase px-4 mb-2 tracking-wider">Navegação</p>
        {menuItems.map((item) => {
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModeChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className={`hidden lg:block font-medium ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full hidden lg:block" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Settings size={22} />
          <span className="hidden lg:block font-medium">Configurações</span>
        </button>
        <div className="hidden lg:flex items-center gap-3 mt-4 px-3 pt-2 border-t border-slate-800/30">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white ring-2 ring-slate-600">
            DR
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-white truncate font-medium">Dr. Silva</p>
            <p className="text-xs text-slate-500 truncate">UBS Central</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;