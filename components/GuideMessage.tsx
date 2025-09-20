
import React from 'react';

interface GuideMessageProps {
  message: string;
}

export const GuideMessage: React.FC<GuideMessageProps> = ({ message }) => {
  return (
    <p className="text-xl text-slate-300 max-w-md text-center animate-fade-in">
      {message}
    </p>
  );
};