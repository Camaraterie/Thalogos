import React from 'react';
import { WindowConfig } from '../types';

interface DrawingBoardProps {
    // FIX: Updated prop type to allow an optional `position` property, matching the updated `openWindow` function signature.
    onOpenWindow: (config: Omit<WindowConfig, 'zIndex' | 'position'> & { position?: { x: number, y: number } }) => void;
}

const initialIdeas = [
    {
        id: 'idea-1',
        title: 'Modular & Draggable UI',
        description: 'Convert the main chat interface and these cards into fully draggable, resizable, and snappable windows. This will create a customizable "cockpit" experience for the user.'
    },
    {
        id: 'idea-2',
        title: 'Interactive Idea Merging',
        description: 'When two idea cards are dragged onto each other, they should "pop" and merge, sending their concepts to an AI to generate a new, combined, more creative idea.'
    },
    {
        id: 'idea-3',
        title: 'Backend Orchestration Layer',
        description: 'Build a backend service (e.g., in Node.js) to handle true multi-model orchestration, securely managing API keys and routing requests to the best model for the job (Gemini, Claude, Codex, etc.).'
    },
    {
        id: 'idea-4',
        title: 'Implement a CLI Tool',
        description: 'Create a command-line interface within a new window type that allows for quick commands and interactions with the agent team.'
    }
];

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ onOpenWindow }) => {

    const handleAddIdeaWindow = (idea: typeof initialIdeas[0]) => {
        onOpenWindow({
            id: idea.id,
            title: idea.title,
            component: 'IdeaCard',
            size: { width: 320, height: 200 },
            content: {
                description: idea.description,
            }
        });
    };

    return (
        <div className="flex-grow p-4 relative overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Available Ideas</h3>
            <p className="text-xs text-slate-500 mb-4">Click an idea to open it as a window on the main canvas.</p>
            <ul className="space-y-2">
                {initialIdeas.map(idea => (
                    <li key={idea.id}>
                        <button 
                            onClick={() => handleAddIdeaWindow(idea)}
                            className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <p className="font-semibold text-slate-200">{idea.title}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};