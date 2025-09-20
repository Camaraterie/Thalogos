// FIX: Corrected the malformed import statement by removing `aistudio`.
import React, { useState, useEffect, useCallback } from 'react';
import { SessionState, Message, Transcript, WindowConfig, Agent } from './types';
import { getGuideResponse, selectActiveAgents } from './services/geminiService';
import { AGENTS } from './constants/agents';
import { GoalInput } from './components/GoalInput';
import { SessionHistoryPanel } from './components/SessionHistoryPanel';
import { AgentCollaborationPanel } from './components/AgentCollaborationPanel';
import { DevConsole } from './components/DevConsole';
import { ErrorProvider, useErrorLogger } from './contexts/ErrorContext';
import { useChatStore } from './store/chatStore';
import { ModularWindow } from './components/ModularWindow';
import { ChatWindow } from './components/ChatWindow';
import { IdeaWindow } from './components/IdeaWindow';
import { EditorWindow, EDITOR_STORAGE_KEY } from './components/EditorWindow';

const AppContent: React.FC = () => {
  const { 
    sessionState, 
    messages,
    activeAgentIds,
    sessionTimestamp,
    startSession, 
    endSession, 
    addMessage,
    setActiveAgentIds,
    toggleAgent,
  } = useChatStore();
  
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState<boolean>(false);
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  
  const { logError } = useErrorLogger();

  const getChatWindowTitle = (timestamp: number | null): string => {
    if (!timestamp) return 'Agent Chat';
    const date = new Date(timestamp);
    return `Agent Chat | Loaded ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  useEffect(() => {
    try {
      const storedTranscripts = localStorage.getItem('unload_transcripts');
      if (storedTranscripts) {
        setTranscripts(JSON.parse(storedTranscripts));
      }
    } catch (error) {
      console.error("Failed to load transcripts from localStorage:", error);
      logError("Failed to load transcripts from localStorage", error);
    }
  }, [logError]);

  useEffect(() => {
    try {
      localStorage.setItem('unload_transcripts', JSON.stringify(transcripts));
    } catch (error) {
      console.error("Failed to save transcripts to localStorage:", error);
      logError("Failed to save transcripts to localStorage", error);
    }
  }, [transcripts, logError]);
  
  const bringToFront = (id: string) => {
    setWindows(currentWindows => {
        const maxZ = Math.max(0, ...currentWindows.map(w => w.zIndex)) + 1;
        return currentWindows.map(w => w.id === id ? { ...w, zIndex: maxZ } : w);
    });
  };

  // FIX: Updated `openWindow` to accept an optional `position` property to allow for specific window placement.
  const openWindow = useCallback((config: Omit<WindowConfig, 'zIndex' | 'position'> & { position?: { x: number; y: number } }) => {
    setWindows(currentWindows => {
        // If window with this ID already exists, just bring it to the front
        if (currentWindows.some(w => w.id === config.id)) {
            bringToFront(config.id);
            return currentWindows;
        }

        // Add a new window
        const maxZ = Math.max(0, ...currentWindows.map(w => w.zIndex)) + 1;
        const newPosition = config.position ?? { 
            x: 100 + (currentWindows.filter(w => w.component === 'IdeaCard').length % 10) * 30, 
            y: 150 + (currentWindows.filter(w => w.component === 'IdeaCard').length % 10) * 30,
        };
        
        const newWindow: WindowConfig = {
            ...config,
            position: newPosition,
            zIndex: maxZ
        };

        return [...currentWindows, newWindow];
    });
  }, []);
  
  // When Zustand state changes to active, and no window exists, open one.
  // This handles session persistence on page reload.
  useEffect(() => {
    if (sessionState === SessionState.AGENT_SESSION_ACTIVE && !windows.find(w => w.id === 'main-chat')) {
        const chatWindowConfig: Omit<WindowConfig, 'zIndex'> = {
            id: 'main-chat',
            title: getChatWindowTitle(sessionTimestamp),
            component: 'ChatWindow',
            position: { x: window.innerWidth / 2 - 350, y: 150 },
            size: { width: 700, height: 600 },
        };
        openWindow(chatWindowConfig);
    }
  }, [sessionState, windows, sessionTimestamp, openWindow]);

  const closeWindow = (id: string) => {
    setWindows(currentWindows => currentWindows.filter(w => w.id !== id));
    if (id === 'main-chat') {
      handleEndSession();
    }
  };

  const updateWindowState = (id: string, updates: Partial<WindowConfig>) => {
      setWindows(currentWindows => currentWindows.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleToggleAgent = (agentId: string) => {
    toggleAgent(agentId);
    logError(`Toggled agent ${agentId}`);
  };


  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userMessage };
    addMessage(userMsg);
    setIsLoading(true);

    try {
      const currentMessages = useChatStore.getState().messages;
      const codeContext = localStorage.getItem(EDITOR_STORAGE_KEY);
      const parsedCodeContext = codeContext ? JSON.parse(codeContext) : null;
      
      const responseText = await getGuideResponse(userMessage, currentMessages, parsedCodeContext, activeAgentIds);
      addMessage({ id: (Date.now() + 1).toString(), sender: 'guide', text: responseText });
    } catch (error) {
      console.error("Error getting response from Gemini:", error);
      logError("Error getting response from Gemini", error);
      addMessage({ id: (Date.now() + 1).toString(), sender: 'guide', text: "I'm having a little trouble connecting right now. Let's try again in a moment." });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, logError, addMessage, activeAgentIds]);
  
  const saveTranscript = useCallback(() => {
    if (messages.length === 0) return;
    const content = messages
      .map(msg => `**${msg.sender === 'user' ? 'You' : 'Guide'}:**\n\n${msg.text}`)
      .join('\n\n---\n\n');
    
    const newTranscript: Transcript = { id: new Date().toISOString(), date: new Date().toLocaleString(), content };
    setTranscripts(prev => [newTranscript, ...prev]);
  }, [messages]);

  const handleEngageAgents = useCallback(async (goal: string) => {
    startSession(); // Set session to active and clear old messages/agents
    const newTimestamp = useChatStore.getState().sessionTimestamp;
    
    openWindow({
        id: 'main-chat',
        title: getChatWindowTitle(newTimestamp),
        component: 'ChatWindow',
        position: { x: window.innerWidth / 2 - 350, y: 150 },
        size: { width: 700, height: 600 },
    });

    const userGoalMessage: Message = { id: Date.now().toString(), sender: 'user', text: goal };
    addMessage(userGoalMessage); // Add the user's goal
    
    // Add a temporary loading message for agent selection
    const thinkingMessageId = (Date.now() + 1).toString();
    addMessage({ id: thinkingMessageId, sender: 'guide', text: "Analyzing your goal and assembling the team..." });
    setIsLoading(true);

    try {
        const selectedAgentIds = await selectActiveAgents(goal, AGENTS);
        setActiveAgentIds(selectedAgentIds);

        const selectedAgents = AGENTS.filter(agent => selectedAgentIds.includes(agent.id));
        const agentNames = selectedAgents.map(a => a.name).join(', ');

        const activationMessageText = selectedAgents.length > 0
            ? `I've activated the following agents for your task: **${agentNames}**. How shall we begin?`
            : "Interesting goal. I'll handle this one myself. How shall we begin?";
        
        // Update the 'thinking' message with the result
        useChatStore.setState(state => ({
            messages: state.messages.map(msg => 
                msg.id === thinkingMessageId 
                ? { ...msg, text: activationMessageText } 
                : msg
            )
        }));
    } catch (error) {
        console.error("Error during agent engagement:", error);
        logError("Error during agent engagement", error);
        // Update the 'thinking' message with an error
        useChatStore.setState(state => ({
            messages: state.messages.map(msg => 
                msg.id === thinkingMessageId 
                ? { ...msg, text: "I'm having a little trouble assembling the team. Let's proceed, and you can manage them from the workspace." } 
                : msg
            )
        }));
    } finally {
        setIsLoading(false);
    }
  }, [logError, startSession, addMessage, openWindow, setActiveAgentIds]);
  
  const handleEndSession = useCallback(() => {
      if (messages.length > 1) { // Only save if there's more than the initial goal
        saveTranscript();
      }
      endSession();
      setWindows(currentWindows => currentWindows.filter(w => w.id !== 'main-chat'));
  }, [saveTranscript, endSession, messages.length]);
  
  const viewTranscript = (transcript: Transcript) => {
    alert(`Session from ${transcript.date}\n\n${transcript.content}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-slate-900 to-slate-900"></div>
       <DevConsole />
       
       <div className="absolute top-5 left-5 z-20 flex gap-2">
            {sessionState === SessionState.AGENT_SESSION_ACTIVE && (
                <button 
                    onClick={() => setIsCollaborationPanelOpen(true)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg backdrop-blur-sm transition-colors"
                >
                    Team Workspace
                </button>
            )}
        </div>
       
       <div className="absolute top-5 right-5 z-20">
            <button 
                onClick={() => setIsHistoryPanelOpen(true)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg backdrop-blur-sm transition-colors"
            >
                History
            </button>
        </div>

      <div className="w-full h-full mx-auto flex flex-col items-center justify-center flex-grow z-10 relative">
        {sessionState === SessionState.AWAITING_GOAL && (
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-slate-100 mb-2">Agent Orchestrator</h1>
                <p className="text-lg text-slate-400">Define your goal. Engage your AI team.</p>
            </div>
        )}
        
        {sessionState === SessionState.AWAITING_GOAL && (
          <GoalInput onEngage={handleEngageAgents} />
        )}
        
        {/* Render all windows */}
        {windows.map(win => (
            <ModularWindow 
                key={win.id} 
                config={win} 
                onClose={() => closeWindow(win.id)}
                onFocus={() => bringToFront(win.id)}
                onStateChange={(updates) => updateWindowState(win.id, updates)}
            >
                {win.component === 'ChatWindow' && (
                    <ChatWindow 
                        messages={messages}
                        isLoading={isLoading}
                        onSendMessage={handleSendMessage}
                    />
                )}
                {win.component === 'IdeaCard' && win.content?.description && (
                    <IdeaWindow description={win.content.description} />
                )}
                {win.component === 'EditorWindow' && (
                    <EditorWindow />
                )}
            </ModularWindow>
        ))}

      </div>
       <SessionHistoryPanel 
            isOpen={isHistoryPanelOpen} 
            onClose={() => setIsHistoryPanelOpen(false)} 
            transcripts={transcripts}
            onView={viewTranscript}
            onClear={() => {
                if(window.confirm("Are you sure you want to clear all session history? This cannot be undone.")) {
                    setTranscripts([]);
                }
            }}
        />
        <AgentCollaborationPanel
            isOpen={isCollaborationPanelOpen}
            onClose={() => setIsCollaborationPanelOpen(false)}
            onOpenWindow={openWindow}
            agents={AGENTS}
            activeAgentIds={activeAgentIds}
            onToggleAgent={handleToggleAgent}
        />
    </div>
  );
};

const App: React.FC = () => (
    <ErrorProvider>
        <AppContent />
    </ErrorProvider>
);

export default App;