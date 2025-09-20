
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  details?: any;
}

interface ErrorContextType {
  logs: LogEntry[];
  logError: (message: string, details?: any) => void;
  clearLogs: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const logError = useCallback((message: string, details?: any) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      details,
    };
    console.log(`[DEV CONSOLE] ${message}`, details ? details : '');
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);
  
  const clearLogs = useCallback(() => {
      setLogs([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ logs, logError, clearLogs }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorLogger = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorLogger must be used within an ErrorProvider');
  }
  return context;
};