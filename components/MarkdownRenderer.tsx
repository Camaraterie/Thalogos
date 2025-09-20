import React, { useState } from 'react';

interface MarkdownRendererProps {
  text: string;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  return (
    <div className="bg-slate-900/70 rounded-md my-2 overflow-hidden border border-slate-600/50">
      <div className="flex justify-between items-center px-4 py-1 bg-slate-800/80 text-xs text-slate-400">
        <span>{language || 'code'}</span>
        <button onClick={handleCopy} className="hover:text-white transition-colors text-xs font-semibold">
          {copyText}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
    if (typeof text !== 'string') {
      return null;
    }
    
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];

    if (matches.length === 0) {
        return <p className="whitespace-pre-wrap">{text}</p>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
        const [fullMatch, language, code] = match;
        const matchIndex = match.index!;

        if (matchIndex > lastIndex) {
            const precedingText = text.substring(lastIndex, matchIndex);
            elements.push(<p key={`text-${index}`} className="whitespace-pre-wrap">{precedingText}</p>);
        }

        elements.push(<CodeBlock key={`code-${index}`} language={language} code={code} />);

        lastIndex = matchIndex + fullMatch.length;
    });

    if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        elements.push(<p key="text-last" className="whitespace-pre-wrap">{remainingText}</p>);
    }

    return <div>{elements}</div>;
};