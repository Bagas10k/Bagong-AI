import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BrainIcon } from './icons/BrainIcon';
import { CogIcon } from './icons/CogIcon';
import { BagongAiTextLogo } from './icons/BagongAiTextLogo';

interface HeaderProps {
    onToggleLeftSidebar: () => void;
    onToggleRightSidebar: () => void;
    onToggleSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleLeftSidebar, onToggleRightSidebar, onToggleSettings }) => {
    return (
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onToggleLeftSidebar} 
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-transform transform active:scale-90"
                    aria-label="Toggle History Sidebar"
                >
                    <MenuIcon />
                </button>
                 <div className="flex items-center">
                    <BagongAiTextLogo />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={onToggleSettings}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-transform transform active:scale-90"
                    aria-label="Buka Pengaturan"
                >
                    <CogIcon />
                </button>
                <button 
                    onClick={onToggleRightSidebar} 
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-transform transform active:scale-90"
                    aria-label="Toggle AI Brain Sidebar"
                >
                    <BrainIcon />
                </button>
            </div>
        </header>
    );
};