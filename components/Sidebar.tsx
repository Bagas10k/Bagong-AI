import React, { useState, useEffect, useRef } from 'react';
import type { ChatHistoryItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatHistoryItem[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (chat: ChatHistoryItem) => void;
  onRenameChat: (chat: ChatHistoryItem, newTitle: string) => void;
}

const HistoryItem: React.FC<{
    chat: ChatHistoryItem;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (newTitle: string) => void;
}> = ({ chat, isActive, onSelect, onDelete, onRename }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [title, setTitle] = useState(chat.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(chat.title);
    }, [chat.title]);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRename = () => {
        if (title.trim() && title.trim() !== chat.title) {
            onRename(title.trim());
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setTitle(chat.title);
            setIsRenaming(false);
        }
    };

    return (
        <li className="group flex items-center justify-between text-sm rounded-lg transition-colors duration-200">
            {isRenaming ? (
                 <div className="flex-1 flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                    />
                     <button onClick={handleRename} className="p-2 rounded-md text-[var(--text-secondary)] hover:text-green-400">
                        <CheckIcon />
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={onSelect}
                        className={`flex-1 text-left px-4 py-3 truncate rounded-lg transition-colors ${isActive ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] font-semibold' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                    >
                        {chat.title}
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button
                            onClick={() => setIsRenaming(true)}
                            className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            aria-label="Ubah nama obrolan"
                            title="Ubah nama obrolan"
                        >
                            <PencilIcon />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 rounded-md text-[var(--text-secondary)] hover:text-red-400"
                            aria-label="Hapus obrolan"
                            title="Hapus obrolan"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </>
            )}
        </li>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  history,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}) => {
  return (
    <aside className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-secondary)] flex flex-col border-r border-[var(--border-color)] transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="w-full h-full flex flex-col">
        <div className="p-3 h-16 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <HistoryIcon />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Riwayat</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-transform transform active:scale-90"
            aria-label="Tutup Riwayat"
          >
            <ChevronDoubleLeftIcon />
          </button>
        </div>
        
        <div className="p-3 border-b border-[var(--border-color)]">
            <button 
              onClick={onNewChat}
              className="flex w-full items-center justify-center gap-2 px-3 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] text-sm font-semibold rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--bg-secondary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-color)]"
            >
              <PlusIcon />
              Obrolan Baru
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-2">
          {history.length > 0 ? (
            <ul className="space-y-1">
              {history.map((chat) => (
                 <HistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeSessionId === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                    onDelete={() => onDeleteChat(chat)}
                    onRename={(newTitle) => onRenameChat(chat, newTitle)}
                 />
              ))}
            </ul>
          ) : (
            <div className="text-center text-[var(--text-secondary)] text-sm py-4 px-2">
              <p>Mulai percakapan untuk melihat riwayat Anda di sini.</p>
            </div>
          )}
        </div>
        
        <div className="p-3 mt-auto border-t border-[var(--border-color)]">
            <p className="text-xs text-center text-[var(--text-secondary)]">
                dibuat oleh bagas saputra
            </p>
        </div>

      </div>
    </aside>
  );
};