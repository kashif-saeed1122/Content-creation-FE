import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  className?: string;
  children: ReactNode;
  glow?: 'cyan' | 'magenta' | 'amber' | 'none';
  holographic?: boolean;
}

export function GlassCard({ 
  className, 
  children, 
  glow = 'none',
  holographic = false 
}: GlassCardProps) {
  const glowClasses = {
    cyan: 'glow-border-cyan',
    magenta: 'glow-border-magenta',
    amber: 'shadow-[0_0_0_1px_rgba(255,184,0,0.2),0_0_10px_rgba(255,184,0,0.1)]',
    none: ''
  };

  return (
    <div className={cn(
      "relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden",
      "bg-noise",
      holographic && "holographic",
      glowClasses[glow],
      className
    )}>
      {children}
    </div>
  );
}