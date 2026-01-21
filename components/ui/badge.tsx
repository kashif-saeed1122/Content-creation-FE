import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-600/50 text-gray-300 border-gray-500/50",
      primary: "bg-blue-600/50 text-blue-300 border-blue-500/50",
      secondary: "bg-purple-600/50 text-purple-300 border-purple-500/50",
      success: "bg-green-600/50 text-green-300 border-green-500/50",
      warning: "bg-yellow-600/50 text-yellow-300 border-yellow-500/50",
      danger: "bg-red-600/50 text-red-300 border-red-500/50"
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs rounded",
      md: "px-3 py-1 text-sm rounded-md"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
