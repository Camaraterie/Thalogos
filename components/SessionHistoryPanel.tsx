
import React from 'react';
import { Transcript } from '../types';

interface SessionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transcripts: Transcript[];
  onView: (transcript: Transcript) => void;
  onClear: () => void;
}

export const SessionHistoryPanel: React.FC<SessionHistoryPanelProps> = ({ isOpen, onClose, transcripts, onView, onClear }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-800 shadow-2xl z-40 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">Session History</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto h-[calc(100vh-120px)]">
          {transcripts.length > 0 ? (
            <ul className="space-y-2">
              {transcripts.map(t => (
                <li 
                  key={t.id}
                  className="bg-slate-700/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => onView(t)}
                >
                  <p className="font-semibold text-slate-200">Session from</p>
                  <p className="text-sm text-slate-400">{t.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-center mt-8">No saved sessions yet.</p>
          )}
        </div>
        <div className="p-4 border-t border-slate-700">
            {transcripts.length > 0 && (
                <button 
                    onClick={onClear} 
                    className="w-full py-2 bg-red-800/70 hover:bg-red-700/90 text-white rounded-lg transition-colors"
                >
                    Clear History
                </button>
            )}
        </div>
      </div>
    </>
  );
};