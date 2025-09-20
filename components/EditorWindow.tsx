import React from 'react';
import useVersionedState from '../hooks/useVersionedState';

export const EDITOR_STORAGE_KEY = 'main-editor-code-v2'; // New key to avoid conflicts
const INITIAL_CODE = `// Welcome to your Agentic Orchestration Platform!
// This editor's content is persistent across reloads.
// The guide AI will see the content of this file when you send a message.
// You can now undo and redo your changes.

function helloAgents() {
  console.log("Hello, World!");
}`;

export const EditorWindow: React.FC = () => {
  const [code, setCode, undo, redo, canUndo, canRedo, previousCode] = useVersionedState<string>(
    EDITOR_STORAGE_KEY,
    INITIAL_CODE
  );

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const handleGetDiff = () => {
    if (!previousCode) {
        alert("No previous version found to create a diff.");
        return;
    }
    console.log("--- DIFF FOR AI CONTEXT ---");
    console.log("OLD CODE:", previousCode);
    console.log("NEW CODE:", code);
    alert("Diff information has been logged to the developer console. You can now copy this and provide it to the AI.");
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      <textarea
        value={code}
        onChange={handleCodeChange}
        className="flex-grow w-full h-full p-4 bg-transparent text-slate-200 font-mono text-sm resize-none focus:outline-none"
        spellCheck="false"
        aria-label="Code Editor"
      />
       <div className="flex-shrink-0 p-2 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-1 bg-slate-600 text-white text-xs rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Undo
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1 bg-slate-600 text-white text-xs rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Redo
            </button>
          </div>
          <button 
            onClick={handleGetDiff}
            className="px-3 py-1 bg-sky-700 text-white text-xs rounded-md hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            disabled={!previousCode}
          >
            Get Code Diff
          </button>
      </div>
    </div>
  );
};
