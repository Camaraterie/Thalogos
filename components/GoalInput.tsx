
import React, { useState } from 'react';

interface GoalInputProps {
  onEngage: (goal: string) => void;
}

export const GoalInput: React.FC<GoalInputProps> = ({ onEngage }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onEngage(goal);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col items-center gap-6 p-4 rounded-lg bg-slate-800/30 backdrop-blur-sm animate-fade-in">
      <textarea
        id="userInput"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="What is your goal? How can the agents assist you today?"
        className="w-full h-40 p-4 bg-slate-900/50 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none text-lg"
        aria-label="User goal input"
      />
      <button
        id="initiateAgentOrchestration"
        type="submit"
        disabled={!goal.trim()}
        className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
      >
        Engage Agents
      </button>
    </form>
  );
};
