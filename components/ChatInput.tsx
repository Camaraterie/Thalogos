import React, { useState } from 'react';
import { RecognitionStatus } from '../hooks/useSpeechRecognition';
import { Agent } from '../types';
import { detectIntent } from '../services/geminiService';
import { useChatStore } from '../store/chatStore';
import { AGENTS } from '../constants/agents';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  recognitionStatus: RecognitionStatus;
  error: string | null;
  startRecording: () => void;
  isRecordingActive: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);


export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, recognitionStatus, error, startRecording, isRecordingActive }) => {
    const [text, setText] = useState('');
    const [suggestedAgents, setSuggestedAgents] = useState<Agent[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const { activateAgent, addMessage } = useChatStore();
    
    const handleAgentSelect = (agent: Agent) => {
        activateAgent(agent.id);
        addMessage({
            id: Date.now().toString(),
            sender: 'guide',
            text: `Activated the **${agent.name}** to assist with your request.`
        });
        setSuggestedAgents([]); // Clear suggestions after selection
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading && recognitionStatus !== 'transcribing') {
            const messageToSend = text;
            onSendMessage(messageToSend);
            setText('');
            setSuggestedAgents([]);
            
            setIsDetecting(true);
            try {
                const activeAgentIds = useChatStore.getState().activeAgentIds;
                const agentIds = await detectIntent(messageToSend, AGENTS);
                // Filter out agents that are already active
                const newAgents = AGENTS.filter(a => agentIds.includes(a.id) && !activeAgentIds.includes(a.id));
                setSuggestedAgents(newAgents);
            } catch (error) {
                console.error("Failed to detect intent:", error);
            } finally {
                setIsDetecting(false);
            }
        }
    };
    
    const isBusy = isLoading || recognitionStatus === 'recording' || recognitionStatus === 'transcribing';

    const getPlaceholderText = () => {
        switch (recognitionStatus) {
            case 'recording':
                return "Listening...";
            case 'transcribing':
                return "Thinking...";
            case 'error':
                return "There was an error. Please try again.";
            case 'idle':
            default:
                return "Type your response or press the mic to speak...";
        }
    };

    return (
        <div className="relative mt-auto">
             {(suggestedAgents.length > 0 || isDetecting) && (
                <div className="absolute bottom-full left-0 w-full bg-slate-800/90 shadow-lg p-2 rounded-t-md border-t border-x border-slate-700 backdrop-blur-sm">
                    <p className="text-sm text-slate-400 mb-2 px-2">
                        {isDetecting ? 'Detecting relevant agents...' : 'Suggested agents:'}
                    </p>
                    {isDetecting && (
                        <div className="flex justify-center items-center h-8">
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!isDetecting && (
                        <div className="flex gap-2 flex-wrap px-2 pb-1">
                        {suggestedAgents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleAgentSelect(agent)}
                                className="px-3 py-1 bg-sky-800/70 text-sky-200 text-sm rounded-full hover:bg-sky-700 transition-colors"
                            >
                                Activate {agent.name}
                            </button>
                        ))}
                        </div>
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 ">
                {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
                <div className="flex items-center space-x-2 bg-slate-900/70 rounded-lg p-2">
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if(suggestedAgents.length > 0) setSuggestedAgents([]);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={getPlaceholderText()}
                        className="flex-grow bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none resize-none"
                        rows={2}
                        disabled={isBusy}
                        aria-label="Your message"
                    />
                    <button
                        type="button"
                        onClick={startRecording}
                        disabled={isBusy}
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed ${isRecordingActive ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        aria-label="Start recording"
                    >
                      <MicIcon />
                    </button>
                    <button
                        type="submit"
                        disabled={isBusy || !text.trim()}
                        className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};