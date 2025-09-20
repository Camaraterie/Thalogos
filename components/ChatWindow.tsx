import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const { recognitionStatus, startListening, error: recognitionError } = useSpeechRecognition({
        onTranscriptReady: onSendMessage,
    });
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <ChatHistory messages={messages} isLoading={isLoading} ref={messagesEndRef} />
            <ChatInput
                onSendMessage={onSendMessage}
                isLoading={isLoading}
                recognitionStatus={recognitionStatus}
                error={recognitionError}
                startRecording={startListening}
                isRecordingActive={recognitionStatus !== 'idle'}
            />
        </div>
    );
};