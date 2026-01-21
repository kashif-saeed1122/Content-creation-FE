import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function ScanlineButton({ children, className, isLoading, ...props }: Props) {
  return (
    <button
      className={cn(
        "relative w-full overflow-hidden bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {/* Scanline Animation Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/20 to-transparent h-full w-full -translate-y-full animate-scanline" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <span className="font-mono animate-pulse">PROCESSING_REQ...</span>
        ) : (
          children
        )}
      </span>
    </button>
  );
}