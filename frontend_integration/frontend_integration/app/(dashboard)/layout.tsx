'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Zap, LayoutGrid, FileText, PlusSquare, LogOut, Target, Settings, CreditCard, Key, Webhook } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tantml/react-query';
import { DataStream } from '@/components/ui/data-stream';
import { creditApi } from '@/lib/api-client';

const NAV_ITEMS = [
  { label: 'COMMAND', icon: LayoutGrid, href: '/dashboard' },
  { label: 'ARCHIVE', icon: FileText, href: '/articles' },
  { label: 'CAMPAIGNS', icon: Target, href: '/dashboard/campaigns' },
  { label: 'GENERATE', icon: PlusSquare, href: '/dashboard/create' },
];

const SETTINGS_ITEMS = [
  { label: 'CREDITS', icon: CreditCard, href: '/settings/credits' },
  { label: 'API KEYS', icon: Key, href: '/settings/api-keys' },
  { label: 'WEBHOOKS', icon: Webhook, href: '/settings/integrations' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();

  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: async () => {
      const response = await creditApi.getBalance();
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!isAuthenticated) {
       router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; 

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] relative">
      <DataStream />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      <aside className="w-72 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl flex flex-col z-20 relative scanline">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50" />
        
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[var(--border-primary)]">
          <Zap className="text-[var(--accent-cyan)]" size={28} strokeWidth={2} />
          <div>
            <h1 className="font-mono text-lg font-bold tracking-tight text-white">
              NEURAL<span className="text-[var(--accent-cyan)]">GEN</span>
            </h1>
            <p className="font-mono text-[10px] text-gray-500 tracking-wider">
              v2.5.1 // PROD
            </p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-md font-mono text-xs tracking-[0.15em] transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 shadow-[0_0_20px_rgba(0,255,159,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <item.icon size={18} strokeWidth={2} />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent-cyan)]" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
                  </>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[var(--border-primary)]">
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-3 px-2">
              SETTINGS
            </p>
            {SETTINGS_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 rounded-md font-mono text-xs tracking-[0.15em] transition-all duration-300",
                    isActive 
                      ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  <item.icon size={16} strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-6 border-t border-[var(--border-primary)] space-y-3">
          <div className="bg-[var(--bg-tertiary)] rounded-md p-4 border border-[var(--border-secondary)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">CREDITS</span>
              <CreditCard size={14} className="text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-mono text-[var(--accent-cyan)] font-bold">
                {balance?.credits || 0}
              </p>
              <span className="text-xs text-gray-500">available</span>
            </div>
            <Link href="/settings/credits">
              <button className="w-full mt-3 text-xs font-mono text-cyan-400 hover:text-white transition-colors py-2 px-3 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30">
                MANAGE
              </button>
            </Link>
          </div>

          <div className="bg-[var(--bg-tertiary)] rounded-md p-4 border border-[var(--border-secondary)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">SYSTEM STATUS</span>
              <div className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
            </div>
            <p className="text-xs font-mono text-[var(--accent-cyan)]">OPERATIONAL</p>
          </div>
          
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 text-[10px] text-[var(--accent-magenta)] hover:text-white transition-colors w-full px-4 py-3 hover:bg-[var(--accent-magenta)]/10 rounded-md border border-transparent hover:border-[var(--accent-magenta)]/30 font-mono tracking-wider"
          >
            <LogOut size={14} />
            DISCONNECT
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50" />
      </aside>

      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,159,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
