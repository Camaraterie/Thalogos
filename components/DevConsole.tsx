
import React, { useState } from 'react';
import { useErrorLogger } from '../contexts/ErrorContext';

const formatDetails = (details: any): string => {
  if (details === undefined || details === null) {
    return '';
  }
  if (typeof details === 'string') {
    return details;
  }
  // Attempt to pretty-print objects, handling potential circular references
  try {
    return JSON.stringify(details, (key, value) => {
      if (value instanceof Event) {
          const eventDetails: Record<string, any> = {};
          for (const prop in value) {
              if (typeof value[prop as keyof Event] !== 'function') {
                eventDetails[prop] = value[prop as keyof Event];
              }
          }
          return eventDetails;
      }
      return value;
    }, 2);
  } catch (e) {
    return 'Could not stringify object details.';
  }
};


export const DevConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logs, clearLogs } = useErrorLogger();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 -right-px transform -translate-y-1/2 z-50 bg-slate-700 text-white px-2 py-4 rounded-l-lg shadow-lg hover:bg-slate-600 transition-colors"
        aria-label="Open Developer Console"
      >
        <span className="transform rotate-90 inline-block whitespace-nowrap">Dev Console</span>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900/90 text-white shadow-2xl z-50 backdrop-blur-sm flex flex-col font-mono text-sm">
      <div className="flex justify-between items-center p-2 border-b border-gray-700">
        <h2 className="font-bold">Developer Console</h2>
        <div>
            <button onClick={clearLogs} className="px-2 py-1 mr-2 rounded bg-red-800/80 hover:bg-red-700">Clear</button>
            <button onClick={() => setIsOpen(false)} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600">&times;</button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {logs.length > 0 ? (
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log.id} className="p-2 bg-gray-800 rounded">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{log.timestamp}</span>
                </div>
                <p className="font-semibold text-cyan-300">{log.message}</p>
                {log.details && (
                  <pre className="text-xs text-yellow-200 whitespace-pre-wrap break-all mt-1 bg-black/50 p-1 rounded">
                    {formatDetails(log.details)}
                  </pre>
                )}
              </li>
            )).reverse() /* Show newest logs at the bottom */}
          </ul>
        ) : (
          <p className="text-gray-500 text-center mt-8">No logs yet.</p>
        )}
      </div>
    </div>
  );
};