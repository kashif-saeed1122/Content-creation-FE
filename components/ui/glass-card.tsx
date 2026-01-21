import { cn } from "@/lib/utils";

export function GlassCard({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn(
      "bg-[rgba(10,10,11,0.6)] backdrop-blur-xl border border-white/5 p-6 shadow-2xl",
      className
    )}>
      {children}
    </div>
  );
}