import type { Metadata } from "next";
import { Sora, Fira_Code } from "next/font/google"; // Import fonts
import "./globals.css";
import Providers from "./providers";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const fira = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });

export const metadata: Metadata = {
  title: "Pro Content Engine",
  description: "AI-Powered SEO Research Grid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${fira.variable}`}>
      <body className="bg-[#0A0A0B] text-gray-100 antialiased selection:bg-primary/30">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}