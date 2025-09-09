'use client';

import { useEffect, useRef } from 'react';
import { UserIcon, CpuChipIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto px-4">
          <CpuChipIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Bem-vindo ao WebJustice Chat
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Inicie uma conversa digitando sua mensagem abaixo. 
            Estou aqui para ajudar com questões jurídicas e análise de processos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`group flex space-x-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          
          <div
            className={`max-w-3xl rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words m-0">
                {message.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-current">
              <span className={`text-xs opacity-70`}>
                {formatTimestamp(message.timestamp)}
              </span>
              
              {message.role === 'assistant' && (
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  onClick={() => copyToClipboard(message.content)}
                  title="Copiar mensagem"
                >
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}