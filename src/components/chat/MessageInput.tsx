'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleFileUpload = () => {
    // Placeholder for file upload functionality
    console.log('File upload clicked');
  };

  const toggleRecording = () => {
    // Placeholder for voice recording functionality
    setIsRecording(!isRecording);
    console.log('Voice recording toggled');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
          
          {/* File Upload Button */}
          <button
            type="button"
            className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={handleFileUpload}
            title="Anexar arquivo"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            className="flex-1 resize-none border-0 bg-transparent py-3 px-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 p-2">
            {/* Voice Recording Button */}
            <button
              type="button"
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={toggleRecording}
              title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
            >
              <MicrophoneIcon className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2 rounded-lg transition-colors ${
                message.trim() && !disabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title="Enviar mensagem"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Pressione Enter para enviar, Shift+Enter para quebra de linha
        </div>
      </form>
    </div>
  );
}