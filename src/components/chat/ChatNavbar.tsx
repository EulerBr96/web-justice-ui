'use client';

import { Bars3Icon, EllipsisVerticalIcon, ShareIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

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

interface ChatNavbarProps {
  currentChat: Chat | undefined;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  agentStatus?: 'connecting' | 'connected' | 'error';
  isLocalChat?: boolean;
}

export function ChatNavbar({ currentChat, showSidebar, onToggleSidebar, agentStatus, isLocalChat }: ChatNavbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-4">
        {!showSidebar && (
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}
        
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentChat?.title || 'Chat'}
          </h1>
          <div className="flex items-center space-x-2">
            {currentChat && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentChat.messages.length} mensagens
              </p>
            )}
            {agentStatus && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    agentStatus === 'connected' ? 'bg-green-500' : 
                    agentStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                    'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {agentStatus === 'connected' ? (isLocalChat ? 'Local + Cloud' : 'Justice Agent') : 
                     agentStatus === 'connecting' ? 'Conectando...' : 
                     (isLocalChat ? 'Apenas Local' : 'Desconectado')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentChat && currentChat.messages.length > 0 && (
          <>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Compartilhar conversa"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Copiar conversa"
            >
              <DocumentDuplicateIcon className="w-5 h-5" />
            </button>
          </>
        )}
        
        <button
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Mais opções"
        >
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}