'use client';

import { useEffect, useState } from 'react';

interface DataLine {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export function DataStream() {
  const [lines, setLines] = useState<DataLine[]>([]);

  useEffect(() => {
    const newLines: DataLine[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setLines(newLines);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      {lines.map((line) => (
        <div
          key={line.id}
          className="absolute w-px bg-gradient-to-b from-transparent via-[var(--accent-cyan)] to-transparent"
          style={{
            left: `${line.left}%`,
            height: '20vh',
            animation: `data-stream ${line.duration}s linear infinite`,
            animationDelay: `${line.delay}s`,
          }}
        />
      ))}
    </div>
  );
}