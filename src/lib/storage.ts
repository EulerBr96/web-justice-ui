// Local storage utilities for chat persistence
export interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LocalChat {
  id: string;
  title: string;
  messages: LocalMessage[];
  timestamp: number;
  synced: boolean; // indicates if synced with server
}

const STORAGE_KEY = 'justice_agent_chats';
const USER_KEY = 'justice_agent_current_user';

export class LocalChatStorage {
  private static instance: LocalChatStorage;
  
  static getInstance(): LocalChatStorage {
    if (!LocalChatStorage.instance) {
      LocalChatStorage.instance = new LocalChatStorage();
    }
    return LocalChatStorage.instance;
  }

  // Save chats to localStorage
  saveChats(chats: LocalChat[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats to localStorage:', error);
    }
  }

  // Load chats from localStorage
  loadChats(): LocalChat[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading chats from localStorage:', error);
      return [];
    }
  }

  // Save current user
  saveCurrentUser(userId: string): void {
    try {
      localStorage.setItem(USER_KEY, userId);
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  // Load current user
  loadCurrentUser(): string | null {
    try {
      return localStorage.getItem(USER_KEY);
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  }

  // Add or update a chat
  upsertChat(chat: LocalChat): void {
    const chats = this.loadChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.unshift(chat); // Add to beginning (most recent first)
    }
    
    this.saveChats(chats);
  }

  // Delete a chat
  deleteChat(chatId: string): void {
    const chats = this.loadChats();
    const filtered = chats.filter(c => c.id !== chatId);
    this.saveChats(filtered);
  }

  // Get a specific chat
  getChat(chatId: string): LocalChat | null {
    const chats = this.loadChats();
    return chats.find(c => c.id === chatId) || null;
  }

  // Mark chat as synced
  markChatSynced(chatId: string): void {
    const chats = this.loadChats();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.synced = true;
      this.saveChats(chats);
    }
  }

  // Get unsynced chats
  getUnsyncedChats(): LocalChat[] {
    const chats = this.loadChats();
    return chats.filter(c => !c.synced);
  }

  // Clear all data (for logout or reset)
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const localChatStorage = LocalChatStorage.getInstance();