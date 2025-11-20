import React, { useEffect, useRef } from 'react';

interface BattleLogTickerProps {
  logs: { id: number; message: string }[];
}

const BattleLog: React.FC<BattleLogTickerProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto h-48 bg-black/60 p-3 rounded-lg border-2 border-amber-800 backdrop-blur-sm">
      <div ref={logContainerRef} className="h-full overflow-y-auto pr-2 space-y-1 text-2xl text-gray-200">
        {logs.map(log => (
          <p key={log.id} className="leading-tight">
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BattleLog;