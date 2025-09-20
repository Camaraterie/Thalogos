import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, SessionState } from '../types';

// Define the structure of our store's state
interface ChatState {
  messages: Message[];
  sessionState: SessionState;
  activeAgentIds: string[];
  sessionTimestamp: number | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  startSession: () => void;
  endSession: () => void;
  setActiveAgentIds: (agentIds: string[]) => void;
  toggleAgent: (agentId: string) => void;
  activateAgent: (agentId: string) => void;
}

// Create the store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      sessionState: SessionState.AWAITING_GOAL,
      activeAgentIds: [],
      sessionTimestamp: null,
      
      // Action to add a new message
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
        
      // Action to completely replace messages
      setMessages: (messages) => 
        set({ messages: messages }),

      // Action to start a new session
      startSession: () => 
        set({ 
            sessionState: SessionState.AGENT_SESSION_ACTIVE, 
            messages: [], // Clear messages on new session
            activeAgentIds: [],
            sessionTimestamp: Date.now(),
        }),

      // Action to end the current session
      endSession: () => 
        set({ 
            sessionState: SessionState.AWAITING_GOAL, 
            messages: [],
            activeAgentIds: [],
            sessionTimestamp: null,
        }),

      // Agent actions
      setActiveAgentIds: (agentIds) => set({ activeAgentIds: agentIds }),
      
      toggleAgent: (agentId) => set((state) => ({
          activeAgentIds: state.activeAgentIds.includes(agentId)
              ? state.activeAgentIds.filter(id => id !== agentId)
              : [...state.activeAgentIds, agentId]
      })),

      activateAgent: (agentId) => set((state) => ({
          activeAgentIds: state.activeAgentIds.includes(agentId)
              ? state.activeAgentIds
              : [...state.activeAgentIds, agentId]
      })),
    }),
    {
      name: 'thalamus_chat_session', // Key for localStorage
      storage: createJSONStorage(() => localStorage), // Specify localStorage
      // Persist messages, active agents, and timestamp
      partialize: (state) => ({ 
        messages: state.messages,
        activeAgentIds: state.activeAgentIds,
        sessionTimestamp: state.sessionTimestamp,
      }),
      // Custom merge logic to determine session state on rehydration
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as Partial<ChatState>) };
        // If there are persisted messages, assume the session is active.
        if (merged.messages && merged.messages.length > 0) {
          merged.sessionState = SessionState.AGENT_SESSION_ACTIVE;
          // If no timestamp was persisted (from an older version), set it now.
          if (!merged.sessionTimestamp) {
              merged.sessionTimestamp = Date.now();
          }
        } else {
          merged.sessionState = SessionState.AWAITING_GOAL;
          merged.sessionTimestamp = null;
        }
        return merged;
      },
    }
  )
);