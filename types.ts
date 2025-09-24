// types.ts

export interface FileData {
    name: string;
    type: string;
    data: string; // base64 encoded
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  file?: {
    name: string;
    type: string;
  };
  systemMessageType?: 'memory_update_universal' | 'memory_update_session';
}

export interface MemoryItem {
  id: string;
  short: string; // Ringkasan singkat, maksimal 3 kata
  long: string;  // Fakta lengkap dan mendetail
}

export interface AIMemory {
  universal: MemoryItem[];
  session: MemoryItem[];
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: number;
}
