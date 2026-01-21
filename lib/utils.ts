import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simulates the typewriter effect delay
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));