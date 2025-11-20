
import React, { useEffect, useRef } from 'react';
import { LogEntry, LogType } from '../types';

interface RaidLogProps {
  logs: LogEntry[];
}

const getLogColor = (type: LogType): string => {
  switch (type) {
    case 'player':
      return 'text-cyan-300';
    case 'boss':
      return 'text-red-400';
    case 'counter':
      return 'text-orange-400 font-bold';
    case 'heal':
      return 'text-green-400';
    case 'special':
      return 'text-yellow-300';
    case 'system':
    default:
      return 'text-gray-400 italic';
  }
};

const RaidLog: React.FC<RaidLogProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl mx-auto h-48 bg-black/60 p-3 rounded-lg border-2 border-amber-800 backdrop-blur-sm pointer-events-none">
      <div ref={logContainerRef} className="h-full overflow-y-auto pr-2 space-y-1 text-2xl text-gray-200 pointer-events-auto">
        {logs.map(log => (
          <p key={log.id} className={`leading-tight transition-opacity duration-300 animate-fadeIn ${getLogColor(log.type)}`}>
            {log.player && <span className="font-semibold mr-2">[{log.player}]</span>}
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default RaidLog;