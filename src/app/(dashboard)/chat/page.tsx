'use client';

import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatNavbar } from '@/components/chat/ChatNavbar';
import { 
  sendMessageToJusticeAgent, 
  checkJusticeAgentHealth,
  createJusticeAgentSession,
  listJusticeAgentSessions,
  getJusticeAgentSessionHistory,
  deleteJusticeAgentSession,
  type SessionResponse
} from '@/lib/api';
import { localChatStorage, type LocalChat } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [userId] = useState('user-demo'); // AIDEV-TODO: get from auth context when available

  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Utility functions for localStorage sync
  const saveChatsToLocal = (chatsToSave: Chat[]) => {
    const localChats: LocalChat[] = chatsToSave.map(chat => ({
      id: chat.id,
      title: chat.title,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      timestamp: chat.timestamp,
      synced: agentStatus === 'connected'
    }));
    localChatStorage.saveChats(localChats);
  };

  const loadChatsFromLocal = (): Chat[] => {
    const localChats = localChatStorage.loadChats();
    return localChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      timestamp: chat.timestamp
    }));
  };

  const createNewChat = async () => {
    let newChat: Chat;

    try {
      if (agentStatus === 'connected') {
        // Try to create session with Justice Agent
        const sessionResponse = await createJusticeAgentSession(userId, 'Novo Chat');
        
        newChat = {
          id: sessionResponse.session_id,
          title: sessionResponse.session_name,
          messages: [],
          timestamp: Date.now()
        };
      } else {
        throw new Error('Agent not connected');
      }
    } catch (error) {
      console.error('Error creating new chat session with Justice Agent:', error);
      
      // Fallback to local session if Justice Agent is not available
      const newChatId = `local-${Date.now()}`;
      newChat = {
        id: newChatId,
        title: 'Novo Chat',
        messages: [],
        timestamp: Date.now()
      };
    }

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
    
    // Save to localStorage
    saveChatsToLocal(updatedChats);
  };

  const selectChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      
      // Try to load session history from Justice Agent
      try {
        const sessionHistory = await getJusticeAgentSessionHistory(chatId);
        
        // Convert Justice Agent messages to our Message format
        const convertedMessages: Message[] = sessionHistory.messages.map((msg, index) => ({
          id: `msg-${Date.now()}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()
        }));
        
        setMessages(convertedMessages);
        
        // Update local chat with loaded messages
        setChats(prev => prev.map(c => 
          c.id === chatId 
            ? { ...c, messages: convertedMessages }
            : c
        ));
      } catch (error) {
        console.error('Error loading session history:', error);
        // Fallback to local messages
        setMessages(chat.messages);
      }
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      // Try to delete session from Justice Agent
      await deleteJusticeAgentSession(chatId);
    } catch (error) {
      console.error('Error deleting session from Justice Agent:', error);
      // Continue with local deletion even if remote deletion fails
    }
    
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const messageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    let activeChatId = currentChatId;

    // If no current chat, create one first
    if (!activeChatId) {
      try {
        // Create session with Justice Agent
        const sessionResponse = await createJusticeAgentSession(userId, 'Novo Chat');
        
        const newChat: Chat = {
          id: sessionResponse.session_id,
          title: sessionResponse.session_name,
          messages: [],
          timestamp: Date.now()
        };
        
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(sessionResponse.session_id);
        activeChatId = sessionResponse.session_id;
      } catch (error) {
        console.error('Error creating new chat session:', error);
        
        // Fallback to local session if Justice Agent is not available
        const newChatId = `chat-${Date.now()}`;
        const newChat: Chat = {
          id: newChatId,
          title: 'Novo Chat',
          messages: [],
          timestamp: Date.now()
        };
        
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
        activeChatId = newChatId;
      }
    }

    // Add user message
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update chat with new message
    const updatedChatsWithUser = chats.map(chat => 
      chat.id === activeChatId 
        ? { 
            ...chat, 
            messages: newMessages,
            title: chat.title === 'Novo Chat' ? content.slice(0, 30) : chat.title
          }
        : chat
    );
    setChats(updatedChatsWithUser);
    saveChatsToLocal(updatedChatsWithUser);

    setIsLoading(true);

    try {
      let responseContent: string;
      
      if (agentStatus === 'connected' && !activeChatId.startsWith('local-')) {
        // Send to Justice Agent if connected and it's a server session
        const response = await sendMessageToJusticeAgent(content.trim(), activeChatId);
        responseContent = response.message;
      } else {
        // Fallback response for local chats or when agent is disconnected
        responseContent = "Desculpe, estou temporariamente indisponível. Sua mensagem foi salva localmente e será processada quando a conexão for restaurada.";
      }
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      const finalUpdatedChats = chats.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      );
      setChats(finalUpdatedChats);
      saveChatsToLocal(finalUpdatedChats);
      
    } catch (error) {
      console.error('Error sending message to Justice Agent:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique se o Justice Agent está em execução.`,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      
      const updatedChatsWithError = chats.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      );
      setChats(updatedChatsWithError);
      saveChatsToLocal(updatedChatsWithError);
    } finally {
      setIsLoading(false);
    }
  };

  // Check Justice Agent health on component mount
  useEffect(() => {
    const checkAgentHealth = async () => {
      try {
        await checkJusticeAgentHealth();
        setAgentStatus('connected');
      } catch (error) {
        console.error('Justice Agent health check failed:', error);
        setAgentStatus('error');
      }
    };
    
    checkAgentHealth();
  }, []);

  // Load existing sessions on component mount
  useEffect(() => {
    const loadExistingSessions = async () => {
      // Always load from localStorage first for immediate UI
      const localChats = loadChatsFromLocal();
      if (localChats.length > 0) {
        setChats(localChats);
        const mostRecentChat = localChats[0];
        setCurrentChatId(mostRecentChat.id);
        setMessages(mostRecentChat.messages);
      }

      // If agent is connected, try to sync with server
      if (agentStatus === 'connected') {
        try {
          const sessionsResponse = await listJusticeAgentSessions(userId);
          
          if (sessionsResponse.sessions.length > 0) {
            // Merge server sessions with local chats
            const serverChats: Chat[] = [];
            
            for (const session of sessionsResponse.sessions) {
              try {
                const sessionHistory = await getJusticeAgentSessionHistory(session.session_id);
                
                const convertedMessages: Message[] = sessionHistory.messages.map((msg, index) => ({
                  id: `msg-${Date.now()}-${index}`,
                  role: msg.role,
                  content: msg.content,
                  timestamp: typeof msg.timestamp === 'number' ? msg.timestamp * 1000 : Date.now()
                }));
                
                serverChats.push({
                  id: session.session_id,
                  title: session.session_name,
                  messages: convertedMessages,
                  timestamp: new Date(session.created_at).getTime()
                });
              } catch (historyError) {
                console.error(`Error loading history for session ${session.session_id}:`, historyError);
                // Add session without messages as fallback
                serverChats.push({
                  id: session.session_id,
                  title: session.session_name,
                  messages: [],
                  timestamp: new Date(session.created_at).getTime()
                });
              }
            }
            
            // Merge with local chats (server takes precedence)
            const mergedChats = [...serverChats];
            
            // Add local-only chats that aren't on server
            localChats.forEach(localChat => {
              if (!serverChats.some(serverChat => serverChat.id === localChat.id)) {
                mergedChats.push(localChat);
              }
            });
            
            // Sort by timestamp
            mergedChats.sort((a, b) => b.timestamp - a.timestamp);
            
            setChats(mergedChats);
            saveChatsToLocal(mergedChats);
            
            // Select the most recent chat if we don't have one selected
            if (!currentChatId && mergedChats.length > 0) {
              const mostRecentChat = mergedChats[0];
              setCurrentChatId(mostRecentChat.id);
              setMessages(mostRecentChat.messages);
            }
          } else if (localChats.length === 0) {
            // No sessions found anywhere, create a new one
            console.log('No existing sessions found, creating new chat');
            await createNewChat();
          }
        } catch (error) {
          console.error('Error loading sessions from server:', error);
          // Use local chats as fallback
          if (localChats.length === 0) {
            try {
              await createNewChat();
            } catch (createError) {
              console.error('Error creating new chat after load failure:', createError);
            }
          }
        }
      } else if (localChats.length === 0) {
        // Agent not connected and no local chats, create new local chat
        await createNewChat();
      }
    };
    
    loadExistingSessions();
  }, [agentStatus, userId]);

  // Create initial chat if none exists (fallback)
  useEffect(() => {
    if (chats.length === 0 && agentStatus === 'error') {
      createNewChat();
    }
  }, [chats.length, agentStatus]);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${
        showSidebar ? 'md:ml-64' : ''
      }`}>
        {/* Top Navigation */}
        <ChatNavbar
          currentChat={currentChat}
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          agentStatus={agentStatus}
          isLocalChat={currentChatId?.startsWith('local-') || false}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
          />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <MessageInput
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}