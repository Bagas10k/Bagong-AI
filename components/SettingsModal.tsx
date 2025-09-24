import React, { useState, useEffect, useRef } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { FontSizeControl } from './FontSizeControl';
import { XIcon } from './icons/XIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import * as geminiService from '../services/geminiService';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  fontSize,
  setFontSize,
  currentApiKey,
  onSaveApiKey,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiKey(currentApiKey);
  }, [currentApiKey]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
      setTestStatus('idle'); // Reset test status when modal opens
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const handleFocusTrap = (event: React.KeyboardEvent) => {
      if(event.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if(event.shiftKey) { // Shift + Tab
          if(document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
          }
      } else { // Tab
          if(document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
          }
      }
  }

  const handleSave = async () => {
    if (!apiKey) {
      setTestStatus('error');
      return;
    }
    setTestStatus('testing');
    const isValid = await geminiService.testApiKey(apiKey);
    if (isValid) {
      onSaveApiKey(apiKey);
    } else {
      setTestStatus('error');
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setTestStatus('idle'); // Reset test status on change
  };
  
  const handleTestApiKey = async () => {
    setTestStatus('testing');
    const isValid = await geminiService.testApiKey(apiKey);
    setTestStatus(isValid ? 'success' : 'error');
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      aria-labelledby="settings-dialog-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-md m-4 border border-[var(--border-color)] animate-fade-in-slide-up"
        tabIndex={-1}
        onKeyDown={handleFocusTrap}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 id="settings-dialog-title" className="text-lg font-semibold text-[var(--text-primary)]">Pengaturan</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" aria-label="Tutup pengaturan">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* API Key Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--text-primary)]">Kunci API Gemini</h3>
            <p className="text-sm text-[var(--text-secondary)]">
                Masukkan Kunci API Google Gemini Anda. Kunci Anda disimpan dengan aman di browser Anda.
            </p>
            <div className="relative">
                <input 
                    type={isKeyVisible ? 'text' : 'password'}
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Masukkan kunci API Anda..."
                    className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] pr-10"
                />
                <button
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label={isKeyVisible ? 'Sembunyikan kunci API' : 'Tampilkan kunci API'}
                >
                    {isKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            <div className="h-5 mt-2">
              {testStatus === 'success' && <p className="text-sm text-green-500">Koneksi berhasil!</p>}
              {testStatus === 'error' && <p className="text-sm text-red-500">Gagal terhubung. Periksa kunci API Anda.</p>}
            </div>
          </div>
          
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Tampilan</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Tema</span>
              <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Ukuran Font</span>
              <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-2 p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] rounded-b-lg">
            <button
                onClick={handleTestApiKey}
                disabled={!apiKey || testStatus === 'testing'}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {testStatus === 'testing' ? <><SpinnerIcon /> Menguji...</> : 'Uji Koneksi'}
            </button>
            <button
                onClick={handleSave}
                disabled={!apiKey || testStatus === 'testing'}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent-color)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {testStatus === 'testing' ? <><SpinnerIcon /> Menyimpan...</> : 'Simpan & Tutup'}
            </button>
        </div>
      </div>
    </div>
  );
};