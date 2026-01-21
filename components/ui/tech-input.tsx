'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Terminal } from 'lucide-react';

interface TechInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hasError?: boolean;
}

export function TechInput({ label, hasError, className, ...props }: TechInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group mb-6">
      <label 
        className={cn(
          "flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 transition-colors",
          focused ? "text-primary" : "text-gray-500",
          hasError && "text-error"
        )}
      >
        <span className={cn("opacity-0 transition-opacity", focused && "opacity-100")}>
          <Terminal size={12} />
        </span>
        {label}
      </label>
      
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          "w-full bg-transparent border-b border-gray-800 py-2 text-gray-100 font-mono focus:outline-none transition-all",
          "placeholder:text-gray-700",
          focused && "border-primary shadow-[0_1px_10px_rgba(59,130,246,0.3)]",
          hasError && "border-error animate-glitch-shake",
          className
        )}
      />
      
      {/* Decorative corner markers */}
      {focused && (
        <>
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-primary" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-primary" />
        </>
      )}
    </div>
  );
}