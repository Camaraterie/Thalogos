
import React from 'react';
import { SessionState } from '../types';
import { RecognitionStatus } from '../hooks/useSpeechRecognition';

interface MeditationButtonProps {
  sessionState: SessionState;
  onClick: () => void;
  recognitionStatus?: RecognitionStatus;
  disabled?: boolean;
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);

const Spinner = () => (
    <div className="w-12 h-12 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
);


export const MeditationButton: React.FC<MeditationButtonProps> = ({ sessionState, onClick, recognitionStatus, disabled }) => {
  const getButtonConfig = () => {
    // FIX: Replaced invalid SessionState members (IDLE, MEDITATING, LISTENING) with valid ones from types.ts and refactored the logic to rely on `recognitionStatus` for sub-states.
    switch (sessionState) {
      case SessionState.AWAITING_GOAL:
        return {
          color: 'bg-green-500/20 hover:bg-green-500/40 text-green-300',
          borderColor: 'border-green-500/40',
          icon: <PlayIcon />,
          pulse: false,
        };
      case SessionState.AGENT_SESSION_ACTIVE:
        switch(recognitionStatus) {
            case 'recording':
                return {
                    color: 'bg-red-500/30 text-red-300',
                    borderColor: 'border-red-500/50',
                    icon: <MicIcon />,
                    pulse: true,
                };
            case 'transcribing':
                return {
                    color: 'bg-yellow-500/30 text-yellow-300',
                    borderColor: 'border-yellow-500/50',
                    icon: <Spinner />,
                    pulse: false,
                };
            case 'error':
                 return {
                    color: 'bg-red-800/50 text-red-200',
                    borderColor: 'border-red-800/60',
                    icon: <MicIcon />,
                    pulse: false,
                };
            case 'idle':
            default:
                return {
                    color: 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300',
                    borderColor: 'border-blue-500/40',
                    icon: <MicIcon />,
                    pulse: false,
                };
        }
    }
  };

  const config = getButtonConfig();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed ${config.color} ${config.borderColor} border-2 backdrop-blur-sm shadow-2xl shadow-slate-900/50 ${config.pulse ? 'animate-pulse' : ''}`}
      aria-label={sessionState === SessionState.AGENT_SESSION_ACTIVE ? 'Start recording' : 'Change session state'}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
      <div className="z-10">{config.icon}</div>
    </button>
  );
};
