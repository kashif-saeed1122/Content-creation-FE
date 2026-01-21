import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
      primary: "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 shadow-lg shadow-blue-500/25",
      secondary: "bg-gray-600 hover:bg-gray-500 text-white border border-gray-500/50",
      outline: "bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white/50",
      ghost: "bg-transparent hover:bg-white/5 text-white border-none",
      danger: "bg-red-600 hover:bg-red-500 text-white border border-red-500/50 shadow-lg shadow-red-500/25"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-base rounded-lg",
      lg: "px-6 py-3 text-lg rounded-xl"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          isLoading && "cursor-wait",
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
