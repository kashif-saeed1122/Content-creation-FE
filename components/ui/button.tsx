import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    isLoading, 
    glow = false,
    children, 
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-[var(--accent-cyan)] hover:bg-[#00ffaa] text-black border-none shadow-[0_0_20px_rgba(0,255,159,0.4)] hover:shadow-[0_0_30px_rgba(0,255,159,0.6)] font-bold",
      secondary: "bg-transparent hover:bg-white/5 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 hover:border-[var(--accent-cyan)]/60",
      ghost: "bg-transparent hover:bg-white/5 text-white border-none",
      danger: "bg-[var(--accent-magenta)] hover:bg-[#ff1a8c] text-white border-none shadow-[0_0_20px_rgba(255,0,128,0.4)]"
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "font-mono uppercase tracking-wider transition-all duration-300 rounded-md",
          "disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden",
          variants[variant],
          sizes[size],
          glow && "animate-pulse-glow",
          isLoading && "cursor-wait",
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              PROCESSING...
            </>
          ) : (
            children
          )}
        </span>
        {!isLoading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";