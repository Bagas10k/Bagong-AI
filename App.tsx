// App.tsx

// FIX: Correctly import React hooks by wrapping them in curly braces.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import { MemoryPanel } from './components/MemoryPanel';
import { Header } from './components/Header';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { SettingsModal } from './components/SettingsModal';
import { useTheme } from './hooks/useTheme';
import { useFontSize } from './hooks/useFontSize';
import * as geminiService from './services/geminiService';
import type { AIMemory, ChatHistoryItem, ChatMessage, FileData, MemoryItem } from './types';
import { Content } from '@google/genai';

// Local storage keys
const MEMORY_KEY = 'ai-chat-memory';
const HISTORY_KEY = 'ai-chat-history';
const SESSIONS_KEY = 'ai-chat-sessions';
const API_KEY_KEY = 'gemini-api-key';


// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};


// Helper to convert File to base64
const fileToGenerativePart = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const data = (reader.result as string).split(',')[1];
            resolve({ name: file.name, type: file.type, data });
        };
        reader.onerror = error => reject(error);
    });
};

const App: React.FC = () => {
    const [theme, toggleTheme] = useTheme();
    const [fontSize, setFontSize] = useFontSize();

    // App state
    const [apiKey, setApiKey] = useState<string>(() => loadFromStorage<string>(API_KEY_KEY, ''));
    const [aiMemory, setAiMemory] = useState<AIMemory>(() => loadFromStorage<AIMemory>(MEMORY_KEY, { universal: [], session: [] }));
    const [history, setHistory] = useState<ChatHistoryItem[]>(() => loadFromStorage<ChatHistoryItem[]>(HISTORY_KEY, []));
    const [sessions, setSessions] = useState<Record<string, ChatMessage[]>>(() => loadFromStorage<Record<string, ChatMessage[]>>(SESSIONS_KEY, {}));
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth > 768);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(window.innerWidth > 1024);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Confirmation dialog state
    const [dialogState, setDialogState] = useState<{ isOpen: boolean; item: any; type: 'deleteChat' | 'deleteMemory' | null }>({ isOpen: false, item: null, type: null });

    const activeMessages = useMemo(() => (activeSessionId ? sessions[activeSessionId] || [] : []), [activeSessionId, sessions]);
    
    // FIX: Derive API configuration status directly from the apiKey state.
    // This ensures the UI updates immediately when the key is set, fixing the synchronization bug.
    const isApiConfigured = useMemo(() => !!apiKey, [apiKey]);

    // --- EFFECTS ---

    // Save state to local storage when it changes
    useEffect(() => saveToStorage(API_KEY_KEY, apiKey), [apiKey]);
    useEffect(() => saveToStorage(MEMORY_KEY, aiMemory), [aiMemory]);
    useEffect(() => saveToStorage(HISTORY_KEY, history), [history]);
    useEffect(() => saveToStorage(SESSIONS_KEY, sessions), [sessions]);

    // Initialize Gemini service when API key changes
    useEffect(() => {
        geminiService.initialize(apiKey);
    }, [apiKey]);
    
    // Prompt for API key if not set on first load
    useEffect(() => {
        if (!apiKey) {
            setIsSettingsModalOpen(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load last active session or start a new one
    useEffect(() => {
        if (history.length > 0) {
            setActiveSessionId(history[0].id);
        } else {
            handleNewChat();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- HANDLERS ---
    const handleSaveApiKey = (newKey: string) => {
        setApiKey(newKey);
        setIsSettingsModalOpen(false);
    };
    
    const handleNewChat = useCallback(() => {
        geminiService.clearChatSession(activeSessionId || '');
        const newId = `session_${Date.now()}`;
        const newChatItem: ChatHistoryItem = { id: newId, title: "Obrolan Baru", timestamp: Date.now() };
        setHistory(prev => [newChatItem, ...prev]);
        setSessions(prev => ({ ...prev, [newId]: [] }));
        setActiveSessionId(newId);
        setAiMemory(prev => ({ ...prev, session: [] })); // Clear session memory for new chat
    }, [activeSessionId]);

    const handleSelectChat = useCallback((sessionId: string) => {
        setActiveSessionId(sessionId);
    }, []);

    const openConfirmationDialog = (item: any, type: 'deleteChat' | 'deleteMemory') => {
        setDialogState({ isOpen: true, item, type });
    };
    
    const closeConfirmationDialog = () => {
        setDialogState({ isOpen: false, item: null, type: null });
    };

    const handleConfirmAction = () => {
        const { item, type } = dialogState;
        if (!item || !type) return;

        if (type === 'deleteChat') {
            const chatToDelete = item as ChatHistoryItem;
            setHistory(prev => prev.filter(c => c.id !== chatToDelete.id));
            setSessions(prev => {
                const newSessions = { ...prev };
                delete newSessions[chatToDelete.id];
                return newSessions;
            });
            geminiService.clearChatSession(chatToDelete.id);

            if (activeSessionId === chatToDelete.id) {
                const newHistory = history.filter(c => c.id !== chatToDelete.id);
                if (newHistory.length > 0) {
                    setActiveSessionId(newHistory[0].id);
                } else {
                    handleNewChat();
                }
            }
        } else if (type === 'deleteMemory') {
            const { fact, memoryType } = item;
            setAiMemory(prev => ({
                ...prev,
                [memoryType]: prev[memoryType].filter((m: MemoryItem) => m.id !== fact.id)
            }));
        }
        
        closeConfirmationDialog();
    };

    const handleRenameChat = useCallback((chat: ChatHistoryItem, newTitle: string) => {
        setHistory(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c));
    }, []);

    const parseAndApplyMemoryCommands = (response: string) => {
      const memoryRegex = /\[(memory_add(?:_universal)?)] "([^"]+)" "([^"]+)"/g;
      let match;
      let cleanedResponse = response;
      let memoryUpdated = false;

      while ((match = memoryRegex.exec(response)) !== null) {
          const command = match[1];
          const short = match[2];
          const long = match[3];
          const memoryType = command === 'memory_add_universal' ? 'universal' : 'session';
          
          const newMemoryItem: MemoryItem = { id: `mem_${Date.now()}_${Math.random()}`, short, long };
          setAiMemory(prev => ({
              ...prev,
              [memoryType]: [...prev[memoryType], newMemoryItem]
          }));

          const systemMessage: ChatMessage = {
            role: 'system',
            content: `Memori ${memoryType === 'universal' ? 'Universal' : 'Sesi'} ditambahkan: ${short}`,
            systemMessageType: memoryType === 'universal' ? 'memory_update_universal' : 'memory_update_session'
          };
          
          setSessions(prev => {
              if (activeSessionId && prev[activeSessionId]) {
                return { ...prev, [activeSessionId]: [...prev[activeSessionId], systemMessage] };
              }
              return prev;
          });

          cleanedResponse = cleanedResponse.replace(match[0], '').trim();
          memoryUpdated = true;
      }
      return { cleanedResponse, memoryUpdated };
    };


    const buildSystemInstruction = (): string => {
        const universalFacts = aiMemory.universal.map(m => `- ${m.long}`).join('\n');
        const sessionFacts = aiMemory.session.map(m => `- ${m.long}`).join('\n');
        
        return `You are Bagong AI, a helpful and knowledgeable assistant.
Your personality is inspired by Bagong, a character from Indonesian wayang stories, known for being honest, straightforward, and sometimes humorous.
Always maintain this persona in your responses.
You have a memory system. Use the facts below to inform your answers.

Facts from all conversations (Universal Memory):
${universalFacts.length > 0 ? universalFacts : "No universal facts stored yet."}

Facts from this specific conversation (Session Memory):
${sessionFacts.length > 0 ? sessionFacts : "No session facts stored yet."}

When you learn a new, important, and distinct fact from the user's message, you MUST save it to your memory by using one of two special commands in your response, on a new line:
1. \`[memory_add] "Short summary (3 words max)" "The full detailed fact."\` to save to session memory.
2. \`[memory_add_universal] "Short summary (3 words max)" "The full detailed fact."\` to save to universal memory.
Do not use these commands for trivial information. Only save core facts that are likely to be useful later. Do not explain that you have added a memory, just use the command.`.trim();
    };
    
    const handleSendMessage = async (message: string, file?: File) => {
        if (!isApiConfigured || !activeSessionId) {
            setError("Kunci API belum diatur. Silakan atur di menu pengaturan.");
            return;
        }
        if (!message.trim() && !file) return;

        setError(null);
        setIsLoading(true);

        let fileData: FileData | undefined;
        if (file) {
            try {
                fileData = await fileToGenerativePart(file);
            } catch (e) {
                setError("Gagal memproses file.");
                setIsLoading(false);
                return;
            }
        }

        const userMessage: ChatMessage = { role: 'user', content: message, file: file ? { name: file.name, type: file.type } : undefined };
        const currentMessages = sessions[activeSessionId] || [];
        const newMessages: ChatMessage[] = [...currentMessages, userMessage];
        
        setSessions(prev => ({ ...prev, [activeSessionId]: newMessages }));

        // Add an empty model message to render the typing indicator
        setSessions(prev => ({ ...prev, [activeSessionId]: [...newMessages, { role: 'model', content: '' }] }));

        try {
            const systemInstruction = buildSystemInstruction();
            
            // Convert ChatMessage[] to Gemini's Content[] format for history
            const geminiHistory: Content[] = currentMessages
                .filter(msg => msg.role === 'user' || msg.role === 'model') // Only user/model roles for history
                .map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }));


            let fullResponse = "";
            const stream = geminiService.getChatResponseStream(
                activeSessionId, 
                message, 
                geminiHistory,
                systemInstruction, 
                fileData
            );

            for await (const chunk of stream) {
                fullResponse += chunk;
                setSessions(prev => {
                    const currentSessionMessages = [...prev[activeSessionId]];
                    currentSessionMessages[currentSessionMessages.length - 1] = { role: 'model', content: fullResponse };
                    return { ...prev, [activeSessionId]: currentSessionMessages };
                });
            }
            
            const { cleanedResponse } = parseAndApplyMemoryCommands(fullResponse);

            // Update the final message without the memory commands
            setSessions(prev => {
                const currentSessionMessages = [...prev[activeSessionId]];
                const lastMessageIndex = currentSessionMessages.findIndex(msg => msg.role === 'model' && msg.content === fullResponse);
                 if (lastMessageIndex !== -1) {
                    currentSessionMessages[lastMessageIndex].content = cleanedResponse;
                    return { ...prev, [activeSessionId]: currentSessionMessages };
                }
                return prev;
            });


            // Summarize title for new chats
            if (currentMessages.length === 0) {
                const conversationText = `User: ${message}\nAI: ${cleanedResponse}`;
                const newTitle = await geminiService.summarizeTitle(conversationText);
                handleRenameChat({ id: activeSessionId, title: '', timestamp: 0 }, newTitle);
            }

        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || "Terjadi kesalahan saat berkomunikasi dengan AI.";
            setError(errorMessage);
             setSessions(prev => {
                const currentSessionMessages = [...prev[activeSessionId]];
                const finalMessages = currentSessionMessages.slice(0, -1); // Remove the temp model message
                finalMessages[finalMessages.length] = { role: 'model', content: `Error: ${errorMessage}` };
                return { ...prev, [activeSessionId]: finalMessages };
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMemory = (newFact: { short: string; long: string }, memoryType: 'universal' | 'session') => {
        const newMemoryItem: MemoryItem = { ...newFact, id: `mem_${Date.now()}` };
        setAiMemory(prev => ({
            ...prev,
            [memoryType]: [...prev[memoryType], newMemoryItem]
        }));
    };

    const handleEditMemory = (updatedFact: MemoryItem, memoryType: 'universal' | 'session') => {
        setAiMemory(prev => ({
            ...prev,
            [memoryType]: prev[memoryType].map(item => item.id === updatedFact.id ? updatedFact : item)
        }));
    };

    const handleMoveMemory = (fact: MemoryItem, from: 'universal' | 'session') => {
        const to = from === 'universal' ? 'session' : 'universal';
        setAiMemory(prev => ({
            ...prev,
            [from]: prev[from].filter(m => m.id !== fact.id),
            [to]: [...prev[to], fact]
        }));
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
            <Sidebar
                isOpen={isLeftSidebarOpen}
                onClose={() => setIsLeftSidebarOpen(false)}
                history={history}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={(chat) => openConfirmationDialog(chat, 'deleteChat')}
                onRenameChat={handleRenameChat}
            />
            <main className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isLeftSidebarOpen ? 'ml-0 md:ml-72' : 'ml-0'} ${isRightSidebarOpen ? 'mr-0 md:mr-80' : 'mr-0'}`}>
                <Header 
                    onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    onToggleSettings={() => setIsSettingsModalOpen(true)}
                />
                <div className="flex-1 p-4 overflow-hidden">
                    <ChatPanel
                        messages={activeMessages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        error={error}
                        isApiConfigured={isApiConfigured}
                        onOpenSettings={() => setIsSettingsModalOpen(true)}
                    />
                </div>
            </main>
            <MemoryPanel
                isOpen={isRightSidebarOpen}
                onClose={() => setIsRightSidebarOpen(false)}
                aiMemory={aiMemory}
                onMoveMemory={handleMoveMemory}
                onDeleteMemory={(fact, memoryType) => openConfirmationDialog({ fact, memoryType }, 'deleteMemory')}
                onAddMemory={handleAddMemory}
                onEditMemory={handleEditMemory}
            />
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeConfirmationDialog}
                onConfirm={handleConfirmAction}
                title={dialogState.type === 'deleteChat' ? 'Hapus Obrolan?' : 'Hapus Memori?'}
                message={dialogState.type === 'deleteChat' ? 'Tindakan ini tidak dapat diurungkan. Semua pesan dalam percakapan ini akan dihapus secara permanen.' : 'Apakah Anda yakin ingin menghapus fakta ini dari memori AI?'}
                item={dialogState.type === 'deleteChat' ? dialogState.item?.title : dialogState.item?.fact?.short}
                confirmText="Hapus"
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                theme={theme}
                toggleTheme={toggleTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
                currentApiKey={apiKey}
                onSaveApiKey={handleSaveApiKey}
            />
        </div>
    );
};

export default App;