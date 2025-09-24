import React, { useState } from 'react';
import type { AIMemory, MemoryItem } from '../types';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SwitchIcon } from './icons/SwitchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDoubleRightIcon } from './icons/ChevronDoubleRightIcon';

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiMemory: AIMemory;
  onMoveMemory: (fact: MemoryItem, from: 'universal' | 'session') => void;
  onDeleteMemory: (fact: MemoryItem, memoryType: 'universal' | 'session') => void;
  onAddMemory: (newFact: { short: string; long: string }, memoryType: 'universal' | 'session') => void;
  onEditMemory: (updatedFact: MemoryItem, memoryType: 'universal' | 'session') => void;
}

const AddMemoryForm: React.FC<{
    memoryType: 'universal' | 'session';
    onAdd: MemoryPanelProps['onAddMemory'];
    onCancel: () => void;
}> = ({ memoryType, onAdd, onCancel }) => {
    const [short, setShort] = useState('');
    const [long, setLong] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (short.trim() && long.trim()) {
            onAdd({ short, long }, memoryType);
            onCancel(); // Close form on successful add
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-2 my-2 space-y-2 border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-lg">
            <input
                type="text"
                value={short}
                onChange={(e) => setShort(e.target.value)}
                placeholder="Ringkasan singkat"
                className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                required
            />
            <textarea
                value={long}
                onChange={(e) => setLong(e.target.value)}
                placeholder="Fakta lengkap"
                className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                rows={2}
                required
            />
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-sm rounded-md hover:bg-[var(--bg-hover)]">Batal</button>
                <button type="submit" className="px-3 py-1 text-sm rounded-md bg-[var(--accent-color)] text-[var(--bg-primary)] font-semibold hover:bg-[var(--accent-hover)]">Simpan</button>
            </div>
        </form>
    );
};

const MemoryListItem: React.FC<{
    fact: MemoryItem;
    memoryType: 'universal' | 'session';
    onMove: MemoryPanelProps['onMoveMemory'];
    onDelete: MemoryPanelProps['onDeleteMemory'];
    onEdit: MemoryPanelProps['onEditMemory'];
}> = ({ fact, memoryType, onMove, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editShort, setEditShort] = useState(fact.short);
    const [editLong, setEditLong] = useState(fact.long);
    const fromType = memoryType;
    const toType = fromType === 'universal' ? 'sesi' : 'universal';

    const handleSave = () => {
        if (editShort.trim() && editLong.trim()) {
            onEdit({ ...fact, short: editShort.trim(), long: editLong.trim() }, memoryType);
            setIsEditing(false);
        }
    };
    
    const handleCancel = () => {
        setEditShort(fact.short);
        setEditLong(fact.long);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
             <li className="p-2 my-1 space-y-2 border border-[var(--accent-color)] bg-[var(--bg-primary)] rounded-lg">
                <input
                    type="text"
                    value={editShort}
                    onChange={(e) => setEditShort(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                />
                <textarea
                    value={editLong}
                    onChange={(e) => setEditLong(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                    rows={2}
                />
                <div className="flex justify-end gap-1">
                    <button onClick={handleCancel} className="p-2 rounded-md text-[var(--text-secondary)] hover:text-red-400" title="Batal"> <XIcon /> </button>
                    <button onClick={handleSave} className="p-2 rounded-md text-[var(--text-secondary)] hover:text-green-400" title="Simpan"> <CheckIcon /> </button>
                </div>
            </li>
        );
    }
    
    return (
        <li className="group flex items-center justify-between text-sm text-[var(--text-secondary)] px-2 py-1.5 rounded-md break-words transition-colors duration-200 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]" title={fact.long}>
            <span className="flex-1 pr-2 truncate">{fact.short}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => setIsEditing(true)} className="p-1 rounded-md hover:bg-[var(--bg-secondary)]" aria-label="Ubah" title="Ubah">
                    <PencilIcon />
                </button>
                <button onClick={() => onMove(fact, fromType)} className="p-1 rounded-md hover:bg-[var(--bg-secondary)]" aria-label={`Pindahkan ke ${toType}`} title={`Pindahkan ke ${toType}`}>
                    <SwitchIcon />
                </button>
                <button onClick={() => onDelete(fact, fromType)} className="p-1 rounded-md hover:text-red-400 hover:bg-[var(--bg-secondary)]" aria-label="Hapus" title="Hapus">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAddClick: () => void;
  itemCount: number;
}> = ({ title, icon, children, onAddClick, itemCount }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          {icon}
          <h2 className="text-xs font-semibold uppercase tracking-wider">{title}</h2>
          <span className="text-xs bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-full font-medium">{itemCount}</span>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => { onAddClick(); if(!isExpanded) setIsExpanded(true); }} 
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]" 
            title="Tambah Fakta Baru"
            aria-label="Tambah Fakta Baru"
          >
            <PlusIcon />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]" 
            title={isExpanded ? "Ciutkan" : "Bentangkan"}
            aria-label={isExpanded ? "Ciutkan" : "Bentangkan"}
          >
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
      </div>
      {isExpanded && <div className="px-1">{children}</div>}
    </div>
  );
};


export const MemoryPanel: React.FC<MemoryPanelProps> = ({ isOpen, onClose, aiMemory, onMoveMemory, onDeleteMemory, onAddMemory, onEditMemory }) => {
    const [addingTo, setAddingTo] = useState<'universal' | 'session' | null>(null);
    
    return (
    <aside className={`fixed top-0 right-0 h-full w-[90vw] max-w-xs bg-[var(--bg-secondary)] flex flex-col border-l border-[var(--border-color)] transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
       <div className="w-full h-full flex flex-col">
        <div className="p-3 h-16 flex items-center justify-between border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold text-[var(--accent-color)]">Otak AI</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-transform transform active:scale-90"
            aria-label="Sembunyikan Otak AI"
          >
            <ChevronDoubleRightIcon />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto px-2">
            <CollapsibleSection 
              title="Memori Universal" 
              icon={<GlobeIcon />} 
              onAddClick={() => setAddingTo('universal')}
              itemCount={aiMemory.universal.length}
            >
              <div className="max-h-96 overflow-y-auto">
                {addingTo === 'universal' && <AddMemoryForm memoryType='universal' onAdd={onAddMemory} onCancel={() => setAddingTo(null)} />}
                {aiMemory.universal.length > 0 ? (
                  <ul className="space-y-0.5">
                    {aiMemory.universal.map((fact) => (
                        <MemoryListItem key={fact.id} fact={fact} memoryType='universal' onMove={onMoveMemory} onDelete={onDeleteMemory} onEdit={onEditMemory} />
                    ))}
                  </ul>
                ) : (
                    addingTo !== 'universal' && <p className="text-center text-[var(--text-secondary)] text-xs py-4 px-2">Fakta penting dari semua obrolan akan disimpan di sini.</p>
                )}
              </div>
            </CollapsibleSection>

            <div className="h-[1px] bg-[var(--border-color)] mx-3 my-2"></div>

            <CollapsibleSection 
              title="Memori Sesi" 
              icon={<ChatBubbleIcon />} 
              onAddClick={() => setAddingTo('session')}
              itemCount={aiMemory.session.length}
            >
              <div className="max-h-96 overflow-y-auto">
                {addingTo === 'session' && <AddMemoryForm memoryType='session' onAdd={onAddMemory} onCancel={() => setAddingTo(null)} />}
                {aiMemory.session.length > 0 ? (
                  <ul className="space-y-0.5">
                    {aiMemory.session.map((fact) => (
                      <MemoryListItem key={fact.id} fact={fact} memoryType='session' onMove={onMoveMemory} onDelete={onDeleteMemory} onEdit={onEditMemory} />
                    ))}
                  </ul>
                ) : (
                    addingTo !== 'session' && <p className="text-center text-[var(--text-secondary)] text-xs py-4 px-2">Fakta relevan dengan obrolan ini akan disimpan di sini.</p>
                )}
              </div>
            </CollapsibleSection>
        </div>
      </div>
    </aside>
  );
};