'use client';

import { usePollingQuery } from '@/lib/hooks/useOptimizedQuery';
import { apiClient } from '@/lib/api-client';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Article } from '@/app/types';
import { 
  TrendingUp, FileText, Clock, Zap, ArrowRight,
  Activity, Target, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { data: articles } = usePollingQuery<Article[]>({
    queryKey: ['dashboard-articles'],
    queryFn: async () => {
      const response = await apiClient.get('/articles?limit=50');
      return response.data;
    }
  }, 15000);

  const stats = useMemo(() => {
    if (!articles) return { total: 0, processing: 0, completed: 0, scheduled: 0 };
    
    return {
      total: articles.length,
      processing: articles.filter(a => a.status === 'processing').length,
      completed: articles.filter(a => a.status === 'completed').length,
      scheduled: articles.filter(a => a.status === 'scheduled').length
    };
  }, [articles]);

  const recentArticles = useMemo(() => {
    if (!articles) return [];
    return articles.slice(0, 5);
  }, [articles]);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color,
    trend 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    color: 'cyan' | 'magenta' | 'amber' | 'blue';
    trend?: string;
  }) => {
    const colorClasses = {
      cyan: 'bg-[#00ff9f]/10 border-[#00ff9f]/20 text-[#00ff9f]',
      magenta: 'bg-[#ff0080]/10 border-[#ff0080]/20 text-[#ff0080]',
      amber: 'bg-[#ffb800]/10 border-[#ffb800]/20 text-[#ffb800]',
      blue: 'bg-[#00d4ff]/10 border-[#00d4ff]/20 text-[#00d4ff]'
    };
    
    return (
      <GlassCard className="p-6" holographic>
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
            <Icon size={24} strokeWidth={2} />
          </div>
          {trend && (
            <span className="text-xs font-mono text-gray-500 tracking-wider">{trend}</span>
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1 font-mono">{value}</p>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">{label}</p>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            COMMAND CENTER
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            SYSTEM_DASHBOARD // REAL_TIME_METRICS // STATUS_OPERATIONAL
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="primary" glow>
            <Zap size={16} />
            NEW OPERATION
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          label="TOTAL ARTICLES" 
          value={stats.total} 
          color="cyan"
          trend="+12%"
        />
        <StatCard 
          icon={Activity} 
          label="PROCESSING" 
          value={stats.processing} 
          color="amber"
          trend="LIVE"
        />
        <StatCard 
          icon={Target} 
          label="COMPLETED" 
          value={stats.completed} 
          color="cyan"
          trend="+8%"
        />
        <StatCard 
          icon={Clock} 
          label="SCHEDULED" 
          value={stats.scheduled} 
          color="blue"
          trend="QUEUE"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6" glow="cyan">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-mono text-white tracking-wider flex items-center gap-2">
                <TrendingUp size={20} className="text-[var(--accent-cyan)]" />
                RECENT OPERATIONS
              </h2>
              <Link href="/articles">
                <button className="text-xs font-mono text-[var(--accent-cyan)] hover:text-white transition-colors flex items-center gap-1">
                  VIEW ALL
                  <ArrowRight size={12} />
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentArticles.length > 0 ? (
                recentArticles.map((article, idx) => (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <div 
                      className="p-4 rounded-md border border-[var(--border-secondary)] hover:border-[var(--accent-cyan)]/30 hover:bg-white/5 transition-all duration-300 group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1 group-hover:text-[var(--accent-cyan)] transition-colors">
                            {article.topic || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-mono">{article.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span className="uppercase">{article.category || 'general'}</span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-mono uppercase border",
                          article.status === 'completed' 
                            ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30'
                            : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/30'
                        )}>
                          {article.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-700 mb-3" />
                  <p className="text-gray-600 font-mono text-sm">NO OPERATIONS YET</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6" glow="magenta">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--accent-magenta)]/10 border border-[var(--accent-magenta)]/20">
                <BarChart3 size={20} className="text-[var(--accent-magenta)]" />
              </div>
              <h2 className="text-sm font-mono text-white tracking-wider uppercase">
                PERFORMANCE
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">GENERATION SPEED</span>
                  <span className="text-xs font-mono text-[var(--accent-cyan)]">OPTIMAL</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">QUALITY SCORE</span>
                  <span className="text-xs font-mono text-[var(--accent-cyan)]">HIGH</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--accent-magenta)] to-[var(--accent-amber)] w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">RESOURCE USAGE</span>
                  <span className="text-xs font-mono text-[var(--accent-amber)]">MODERATE</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--accent-amber)] to-[var(--accent-cyan)] w-[65%]" />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-transparent">
            <div className="mb-4">
              <h3 className="text-sm font-mono text-white uppercase tracking-wider mb-2">
                QUICK START
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Initialize a new content generation operation from the command panel.
              </p>
            </div>
            <Link href="/dashboard/create">
              <Button variant="primary" className="w-full" glow>
                <Zap size={14} />
                LAUNCH
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}