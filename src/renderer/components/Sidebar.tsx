/**
 * Sidebar navigation component
 */

import React from 'react';
import { 
  Home, 
  Flag, 
  Zap, 
  Settings,
  type LucideIcon
} from 'lucide-react';

type Page = 'dashboard' | 'fastflags' | 'performance' | 'settings';

interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'fastflags', label: 'Fast Flags', icon: Flag },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <aside className="w-60 bg-[#141414] border-r border-[#2d2d2d] flex flex-col">
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[#00d26a]/10 text-[#00d26a] border border-[#00d26a]/30' 
                      : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white border border-transparent'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-[#00d26a]' : ''}></Icon>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-[#2d2d2d]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-[#00d26a]"></div>
          <span>Ready to launch</span>
        </div>
      </div>
    </aside>
  );
};
