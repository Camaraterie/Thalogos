
export enum SessionState {
  AWAITING_GOAL = 'AWAITING_GOAL',
  AGENT_SESSION_ACTIVE = 'AGENT_SESSION_ACTIVE',
}

export interface Message {
  id: string; // Added for unique key mapping
  sender: 'user' | 'guide';
  text: string;
}

export interface Transcript {
  id: string;
  date: string;
  content: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  keywords?: string[];
  avatar: string;
  color: string; // For styling messages
}

export interface AgentMessage {
  id:string;
  agentId: string;
  text: string;
  timestamp: string;
}

export interface WindowConfig {
  id: string;
  title: string;
  component: 'ChatWindow' | 'IdeaCard' | 'EditorWindow'; // Identifier for which component to render
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  zIndex: number;
  content?: {
    description?: string;
  };
}


// DRAWING BOARD TODO:
// Define the structure for the modular "idea" windows on the drawing board.
// This will be used to manage their state, including position, size, and content.
/*
export interface Idea {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}
*/