import React, { useState } from 'react';
import { Agent, AgentMessage, WindowConfig } from '../types';
import { DrawingBoard } from './DrawingBoard';
import { ReadmeView } from './ReadmeView'; // Import the new ReadmeView component

interface AgentCollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow: (config: Omit<WindowConfig, 'zIndex' | 'position'> & { position?: { x: number, y: number } }) => void;
  agents: Agent[];
  activeAgentIds: string[];
  onToggleAgent: (agentId: string) => void;
}

type ActiveTab = 'workspace' | 'drawingBoard' | 'readme';


// These mock messages are for demonstration in the collaboration feed.
const mockMessages: (AgentMessage | { type: 'user'; text: string, id: string })[] = [
    { id: 'msg1', agentId: 'product', text: 'Okay team, the goal is to build a new agent orchestration UI. UI/UX, what are your initial thoughts?', timestamp: '10:01 AM' },
    { id: 'msg2', agentId: 'ui-ux', text: 'I\'m thinking a clean, dark-themed interface. A central chat for the user, with side panels for agent management and history. Very cockpit-like.', timestamp: '10:02 AM' },
    { id: 'msg3', agentId: 'backend', text: 'Sounds good. I\'ll start scaffolding the API endpoints for session management and message history. We\'ll need a robust way to handle state.', timestamp: '10:03 AM' },
    { id: 'msg4', agentId: 'qa', text: 'I\'ll prepare test cases for the core user flow: starting a session, sending messages, and ending a session. We need to ensure state transitions are solid.', timestamp: '10:04 AM' },
];


interface WorkspaceViewProps {
    agents: Agent[];
    activeAgentIds: string[];
    onToggleAgent: (agentId: string) => void;
    onOpenWindow: (config: Omit<WindowConfig, 'zIndex' | 'position'> & { position?: { x: number, y: number } }) => void;
}

interface TeamFeedLegendProps {
    agents: Agent[];
    activeAgentIds: string[];
}

const TeamFeedLegend: React.FC<TeamFeedLegendProps> = ({ agents, activeAgentIds }) => {
    const activeAgents = agents.filter(agent => activeAgentIds.includes(agent.id));

    if (activeAgents.length === 0) return null;

    return (
        <div className="mb-3 p-2 bg-slate-900/50 rounded-md border border-slate-700/50 flex-shrink-0">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {activeAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${agent.color}`}></div>
                        <span className="text-xs text-slate-300">{agent.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const WorkspaceView: React.FC<WorkspaceViewProps> = ({ agents, activeAgentIds, onToggleAgent, onOpenWindow }) => {
    // This state is just for the mock feed, not application logic.
    const [messages, setMessages] = useState(mockMessages);

    return (
        <div className="flex-grow overflow-y-auto">
            {/* Project Tools */}
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Project Tools</h3>
                <button
                    onClick={() => onOpenWindow({
                        id: 'main-editor',
                        title: 'Project Editor',
                        component: 'EditorWindow',
                        position: { x: window.innerWidth - 850, y: 150 },
                        size: { width: 800, height: 600 },
                    })}
                    className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <p className="font-semibold text-slate-200">Open Editor</p>
                    <p className="text-xs text-slate-400">View and edit the main project file.</p>
                </button>
            </div>
            
            {/* Agent Roster */}
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Team Roster</h3>
                <p className="text-xs text-slate-500 mb-4">Agents are automatically selected based on your goal. You can manually activate or deactivate them here.</p>
                <div className="space-y-3">
                    {agents.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className={`w-8 h-8 rounded-full ${agent.color} flex items-center justify-center font-bold text-black/80 mr-3 text-sm flex-shrink-0`}>{agent.avatar}</div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-100 truncate">{agent.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{agent.description}</p>
                                </div>
                            </div>
                            <label htmlFor={`toggle-${agent.id}`} className="relative inline-flex items-center cursor-pointer ml-2">
                                <input 
                                    type="checkbox" 
                                    id={`toggle-${agent.id}`} 
                                    className="sr-only peer" 
                                    checked={activeAgentIds.includes(agent.id)} 
                                    onChange={() => onToggleAgent(agent.id)} 
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collaboration Feed */}
            <div className="flex-grow overflow-hidden p-4 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 flex-shrink-0">Team Feed (Demo)</h3>
                <TeamFeedLegend agents={agents} activeAgentIds={activeAgentIds} />
                <div className="flex-grow overflow-y-auto space-y-4 mt-2 pr-1">
                    {messages.map(msg => {
                        if ('agentId' in msg) {
                            const agent = agents.find(a => a.id === msg.agentId);
                            if (!agent || !activeAgentIds.includes(agent.id)) return null; // Only show messages from active agents
                            return (
                                <div key={msg.id} className="flex items-start gap-2">
                                     <div className={`w-7 h-7 rounded-full ${agent?.color || 'bg-slate-500'} flex items-center justify-center font-bold text-black/80 flex-shrink-0 text-xs`}>{agent?.avatar || '?'}</div>
                                    <div className="bg-slate-700 rounded-lg rounded-bl-none px-3 py-2 max-w-xs">
                                       <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            );
                        } else {
                            // User message in feed, not used in this mock
                            return null; 
                        }
                    })}
                </div>
            </div>
        </div>
    );
};


export const AgentCollaborationPanel: React.FC<AgentCollaborationPanelProps> = ({ isOpen, onClose, onOpenWindow, agents, activeAgentIds, onToggleAgent }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');

    return (
        <>
          <div 
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div 
            className={`fixed top-0 left-0 h-full w-full max-w-md bg-slate-800/80 backdrop-blur-md shadow-2xl z-40 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collaboration-panel-title"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
              <h2 id="collaboration-panel-title" className="text-xl font-bold">Team Workspace</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700" aria-label="Close workspace">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="border-b border-slate-700 flex-shrink-0">
                <nav className="flex space-x-2 px-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('workspace')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'workspace' ? 'border-b-2 border-indigo-400 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>
                        Workspace
                    </button>
                    <button onClick={() => setActiveTab('drawingBoard')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'drawingBoard' ? 'border-b-2 border-indigo-400 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>
                        Drawing Board
                    </button>
                     <button onClick={() => setActiveTab('readme')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'readme' ? 'border-b-2 border-indigo-400 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>
                        Readme
                    </button>
                </nav>
            </div>

            {activeTab === 'workspace' && <WorkspaceView agents={agents} activeAgentIds={activeAgentIds} onToggleAgent={onToggleAgent} onOpenWindow={onOpenWindow} />}
            {activeTab === 'drawingBoard' && <DrawingBoard onOpenWindow={onOpenWindow} />}
            {activeTab === 'readme' && <ReadmeView />}
            
          </div>
        </>
    );
};