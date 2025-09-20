import React from 'react';

interface IdeaWindowProps {
  description: string;
}

export const IdeaWindow: React.FC<IdeaWindowProps> = ({ description }) => {
  return (
    <div className="p-4 text-slate-300 text-sm h-full overflow-y-auto">
      {description}
    </div>
  );
};
