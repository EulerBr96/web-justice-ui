'use client';

import { useState } from 'react';
import { PencilIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

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

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ 
  chats, 
  currentChatId, 
  showSidebar, 
  onToggleSidebar, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat 
}: ChatSidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Group chats by time periods
  const groupChatsByTime = (chats: Chat[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: Chat[] } = {
      'Hoje': [],
      'Ontem': [],
      'Últimos 7 dias': [],
      'Mais antigos': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      
      if (chatDate >= today) {
        groups['Hoje'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Ontem'].push(chat);
      } else if (chatDate >= weekAgo) {
        groups['Últimos 7 dias'].push(chat);
      } else {
        groups['Mais antigos'].push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByTime(chats);

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={`group relative flex items-center px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
        currentChatId === chat.id
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelectChat(chat.id)}
      onMouseEnter={() => setHoveredChatId(chat.id)}
      onMouseLeave={() => setHoveredChatId(null)}
    >
      <ChatBubbleLeftIcon className="w-4 h-4 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {chat.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(chat.timestamp)}
        </div>
      </div>
      
      {(hoveredChatId === chat.id || menuOpenId === chat.id) && (
        <div className="flex items-center space-x-1">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
            }}
          >
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {menuOpenId === chat.id && (
        <div className="absolute right-2 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[120px]">
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(chat.id);
              setMenuOpenId(null);
            }}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );

  if (!showSidebar) {
    return (
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={onToggleSidebar}
      >
        <Bars3Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onToggleSidebar}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-6 h-6"
            />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              WebJustice Chat
            </h1>
          </div>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            onClick={onNewChat}
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Novo Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {Object.entries(groupedChats).map(([timeGroup, groupChats]) => {
            if (groupChats.length === 0) return null;
            
            return (
              <div key={timeGroup} className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {timeGroup}
                </div>
                <div className="space-y-1">
                  {groupChats.map(renderChatItem)}
                </div>
              </div>
            );
          })}

          {chats.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
              Nenhum chat ainda
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Usuário
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Online
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}