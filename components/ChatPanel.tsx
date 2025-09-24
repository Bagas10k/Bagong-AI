// components/ChatPanel.tsx

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';
import { UserIcon } from './icons/UserIcon';
import { ModelIcon } from './icons/ModelIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CodeBlock } from './CodeBlock';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CogIcon } from './icons/CogIcon';


interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  error: string | null;
  isApiConfigured: boolean;
  onOpenSettings: () => void;
}

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)]">
    <div className="bg-[var(--bg-primary)] p-8 rounded-xl max-w-md animate-fade-in-slide-up">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Bagong AI</h2>
      <p>Mulai percakapan atau lampirkan file. Bagong AI akan belajar dan mengingat interaksi Anda, dan memorinya akan muncul di panel "Otak AI".</p>
    </div>
  </div>
);

const ApiKeyMessage: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)]">
    <div className="bg-[var(--bg-primary)] p-8 rounded-xl max-w-md animate-fade-in-slide-up border border-[var(--border-color)]">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Konfigurasi Diperlukan</h2>
      <p className="mb-4">Silakan masukkan Kunci API Google Gemini Anda di menu pengaturan untuk memulai.</p>
      <button
        onClick={onOpenSettings}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-[var(--bg-primary)] text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-color)]"
      >
        <CogIcon />
        Buka Pengaturan
      </button>
    </div>
  </div>
);


const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
    </div>
);


export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, error, isApiConfigured, onOpenSettings }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (isHistoryVisible) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isHistoryVisible]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    // Automatically focus the input when the AI is done responding.
    if (!isLoading && isApiConfigured && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [isLoading, isApiConfigured]);
  
  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => {
        console.error('Gagal menyalin teks:', err);
    });
  };

  const handleSend = () => {
    if ((input.trim() || selectedFile) && !isLoading) {
      onSendMessage(input, selectedFile ?? undefined);
      setInput('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const removeFile = () => {
      setSelectedFile(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  }

  const renderContent = () => {
    if (!isApiConfigured) {
        return <ApiKeyMessage onOpenSettings={onOpenSettings} />;
    }
    if (messages.length === 0) {
        return <WelcomeMessage />;
    }
    return (
        <div>
            <div className="text-center mb-6">
            <button
                onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2 px-4 rounded-lg hover:bg-[var(--bg-primary)]"
                aria-expanded={isHistoryVisible}
            >
                {isHistoryVisible ? (
                <>
                    <ChevronUpIcon />
                    <span>Sembunyikan Riwayat</span>
                </>
                ) : (
                <>
                    <ChevronDownIcon />
                    <span>Tampilkan Riwayat</span>
                </>
                )}
            </button>
            </div>
        {isHistoryVisible ? (
            <div className="space-y-4">
            {messages.map((msg, index) => {
                if (msg.role === 'system') {
                    return (
                        <div key={index} className="flex justify-center items-center my-2 animate-fade-in-slide-up">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2.5 py-1 rounded-full">
                                {msg.systemMessageType === 'memory_update_universal' && <GlobeIcon />}
                                {msg.systemMessageType === 'memory_update_session' && <ChatBubbleIcon />}
                                <span>{msg.content}</span>
                            </div>
                        </div>
                    );
                }
                
                const isUser = msg.role === 'user';
                return (
                    <div 
                    key={index} 
                    className={`relative group flex items-start gap-4 w-full p-4 rounded-lg animate-fade-in-slide-up ${ isUser ? 'bg-[var(--bg-primary)]' : 'bg-transparent' }`}
                    >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleCopyMessage(msg.content, index)}
                            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                            aria-label="Salin teks"
                            title="Salin teks"
                        >
                            {copiedMessageIndex === index ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center self-start">
                        {isUser ? <UserIcon /> : <ModelIcon />}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-bold text-sm mb-1 text-[var(--text-primary)]">
                            {isUser ? 'Anda' : 'Bagong AI'}
                        </p>
                        
                        <div className={isUser ? 'whitespace-pre-wrap text-[var(--text-primary)] user-message-content' : 'markdown-content'}>
                            {isUser ? (
                                msg.content
                            ) : (
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{ pre: (props) => <CodeBlock {...props} /> }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            )}
                            
                            {msg.role === 'model' && isLoading && index === messages.length - 1 && msg.content.length === 0 && <TypingIndicator />}
                            {msg.role === 'model' && isLoading && index === messages.length - 1 && msg.content.length > 0 && (
                                <span className="inline-block align-bottom w-2 h-5 bg-current animate-pulse ml-1" />
                            )}
                        </div>

                        {msg.file && (
                            <div className="mt-2 text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md p-2 w-fit">
                                <span className="font-medium">File terlampir:</span>
                                <span className="text-[var(--text-secondary)] ml-2">{msg.file.name}</span>
                            </div>
                        )}
                    </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
            </div>
            ) : (
                <div className="text-center text-[var(--text-secondary)] py-16">
                    <p>Riwayat obrolan disembunyikan.</p>
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
      <div className="flex-grow p-6 overflow-y-auto">
        {renderContent()}
      </div>

      <div className="p-4 w-full">
        <div className="mx-auto max-w-4xl">
            {error && <div className="text-[var(--error-color)] text-sm mb-2 text-center">{error}</div>}
            
            <div className={`floating-input-shadow bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus-within:ring-2 focus-within:ring-[var(--accent-color)] ${!isApiConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {selectedFile && (
                    <div className="flex items-center justify-between text-sm bg-[var(--bg-tertiary)] p-2 rounded-md mx-2 mt-2">
                        <span className="text-[var(--text-secondary)] truncate">
                            File: <span className="text-[var(--text-primary)] font-medium">{selectedFile.name}</span>
                        </span>
                        <button onClick={removeFile} className="text-red-400 hover:text-red-500 font-bold ml-2">&times;</button>
                    </div>
                )}
                <div className="flex items-end space-x-2 sm:space-x-4 p-2">
                    <button
                        onClick={triggerFileSelect}
                        disabled={isLoading || !isApiConfigured}
                        className="text-[var(--text-secondary)] p-2 rounded-full hover:bg-[var(--bg-hover)] disabled:opacity-50 transition-all transform active:scale-90"
                        aria-label="Attach file"
                    >
                        <PaperclipIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.json,.csv,.html,.js,.py,.css,image/png,image/jpeg,image/webp" />
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isApiConfigured ? "Ketik pesan Anda atau lampirkan file..." : "Atur Kunci API di Pengaturan untuk memulai..."}
                        rows={1}
                        className="flex-grow bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none resize-none px-2 py-1 max-h-40"
                        disabled={isLoading || !isApiConfigured}
                        aria-label="Chat input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && !selectedFile) || !isApiConfigured}
                        className="bg-[var(--accent-color)] text-white p-3 rounded-full hover:bg-[var(--accent-hover)] disabled:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed transition-all duration-200 self-end transform active:scale-90"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};