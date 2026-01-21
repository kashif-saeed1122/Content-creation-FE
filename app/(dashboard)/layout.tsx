'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Hexagon, LayoutDashboard, PlusCircle, Layers, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const NAV_ITEMS = [
  { label: 'COMMAND_CENTER', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'ALL_ARTICLES', icon: Layers, href: '/articles' },
  { label: 'NEW_OPERATION', icon: PlusCircle, href: '/dashboard/create' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Simple client-side protection
    if (!isAuthenticated) {
       router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; 

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0A0A0B] flex flex-col z-20">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
          <Hexagon className="text-blue-500" size={24} strokeWidth={1.5} />
          <span className="font-mono text-sm font-bold tracking-tight text-white">
            PRO_ENGINE<span className="text-blue-500">.v2</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono tracking-wider transition-all ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full px-4 py-2 hover:bg-red-500/10 rounded"
          >
            <LogOut size={14} />
            TERMINATE_SESSION
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        <div className="relative z-10 p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}