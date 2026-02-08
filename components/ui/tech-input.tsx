'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TechInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TechInput({ label, error, className, ...props }: TechInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group">
      <label 
        className={cn(
          "block text-[10px] font-mono uppercase tracking-[0.2em] mb-3 transition-all duration-300",
          focused ? "text-[var(--accent-cyan)] text-glow-cyan" : "text-gray-500",
          error && "text-[var(--accent-magenta)]"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span className={cn(
            "w-1 h-1 rounded-full transition-all duration-300",
            focused ? "bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]" : "bg-gray-600"
          )} />
          {label}
        </span>
      </label>
      
      <div className="relative">
        <input
          {...props}
          onFocus={(e) => { 
            setFocused(true); 
            props.onFocus?.(e); 
          }}
          onBlur={(e) => { 
            setFocused(false); 
            props.onBlur?.(e); 
          }}
          className={cn(
            "w-full bg-[#0a0a0a]/60 backdrop-blur-sm border-b-2 py-3 px-1",
            "text-white font-mono text-sm placeholder:text-gray-700",
            "focus:outline-none transition-all duration-300",
            "border-gray-800",
            focused && "border-[var(--accent-cyan)] shadow-[0_4px_12px_rgba(0,255,159,0.2)]",
            error && "border-[var(--accent-magenta)] animate-glitch",
            className
          )}
        />
        
        {focused && (
          <>
            <div className="absolute -bottom-0.5 left-0 w-2 h-0.5 bg-[var(--accent-cyan)]" />
            <div className="absolute -bottom-0.5 right-0 w-2 h-0.5 bg-[var(--accent-cyan)]" />
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-[var(--accent-magenta)] font-mono animate-fade-in-up">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}