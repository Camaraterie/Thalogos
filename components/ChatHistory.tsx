import React, { forwardRef } from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatHistory = forwardRef<HTMLDivElement, ChatHistoryProps>(({ messages, isLoading }, ref) => {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-[100px]">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-2 ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.sender === 'guide' && (
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-1">G</div>
          )}
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}
          >
             {message.sender === 'guide' ? (
              <MarkdownRenderer text={message.text} />
            ) : (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-1">G</div>
            <div className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 rounded-bl-none">
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
      )}
      <div ref={ref} />
    </div>
  );
});