import React, { ReactNode, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { WindowConfig } from '../types';

interface ModularWindowProps {
  config: WindowConfig;
  onClose: () => void;
  onFocus: () => void;
  onStateChange: (updates: Partial<WindowConfig>) => void;
  children: ReactNode;
}

export const ModularWindow: React.FC<ModularWindowProps> = ({
  config,
  onClose,
  onFocus,
  onStateChange,
  children
}) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={config.position}
      onStop={(e, data) => onStateChange({ position: { x: data.x, y: data.y } })}
      onStart={onFocus}
      bounds="parent"
      grid={[24, 24]} // Add snapping to a 24x24 grid
    >
      <Resizable
        width={Number(config.size.width)}
        height={Number(config.size.height)}
        onResize={(e, { size }) => onStateChange({ size: { width: size.width, height: size.height } })}
        minConstraints={[350, 250]}
      >
        <div
          ref={nodeRef}
          className="absolute bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl border border-slate-600/50 flex flex-col"
          style={{ 
            width: `${config.size.width}px`, 
            height: `${config.size.height}px`,
            zIndex: config.zIndex 
          }}
          onClick={onFocus}
        >
          <div className="handle h-8 px-4 flex justify-between items-center bg-slate-900/70 rounded-t-lg cursor-move">
            <h3 className="font-bold text-sm text-slate-300">{config.title}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700" aria-label="Close window">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex-grow overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </Resizable>
    </Draggable>
  );
};