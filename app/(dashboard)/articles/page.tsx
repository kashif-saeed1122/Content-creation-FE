'use client';

import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { usePollingQuery } from '@/lib/hooks/useOptimizedQuery';
import { apiClient } from '@/lib/api-client';
import { Article } from '@/app/types';
import { 
  FileText, ArrowUpRight, Search, Hash, Link as LinkIcon, 
  Target, Database, Filter 
} from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, parseISO } from 'date-fns';
import { CountdownTimer } from '@/components/ui/countdown-timer';

export default function ArticlesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: articles, isLoading } = usePollingQuery<Article[]>({
    queryKey: ['all-articles'],
    queryFn: async () => {
      const response = await apiClient.get('/articles?limit=100');
      return response.data;
    }
  }, 10000);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    
    let filtered = articles;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.topic?.toLowerCase().includes(query) ||
        a.raw_query?.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query) ||
        a.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [articles, statusFilter, searchQuery]);

  const getStatusBadge = (status: string, scheduledAt?: string | null) => {
    if (scheduledAt && isFuture(parseISO(scheduledAt))) {
      return 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30';
    }
    
    const badges: Record<string, string> = {
      processing: 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/30',
      completed: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30',
      scheduled: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30',
      failed: 'bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] border-[var(--accent-magenta)]/30',
      posted: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    };
    return badges[status] || badges.completed;
  };

  const getMetric = (article: Article, type: 'keywords' | 'outline' | 'sources' | 'words') => {
    switch (type) {
      case 'keywords':
        return Array.isArray(article.brief?.keywords) ? article.brief.keywords.length : 0;
      case 'outline':
        return Array.isArray(article.brief?.outline) ? article.brief.outline.length : 0;
      case 'sources':
        return article.sources?.length || 0;
      case 'words':
        return article.content ? article.content.split(/\s+/).length : 0;
    }
  };

  const filters = ['all', 'processing', 'completed', 'scheduled', 'posted'];

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            CONTENT ARCHIVE
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            DATABASE_READ // {filteredArticles.length} RECORDS // LIVE_SYNC
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="SEARCH DATABASE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/60 border border-[var(--border-primary)] rounded-md pl-11 pr-4 py-3 text-xs font-mono text-white focus:border-[var(--accent-cyan)] focus:shadow-[0_0_20px_rgba(0,255,159,0.2)] outline-none w-64 transition-all"
            />
          </div>
          
          <div className="flex gap-2 bg-black/60 border border-[var(--border-primary)] rounded-md p-1.5">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded text-[10px] font-mono uppercase tracking-wider transition-all",
                  statusFilter === filter 
                    ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30' 
                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden" glow="cyan">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-black/60">
                {['ID / CREATED', 'TOPIC', 'CATEGORY', 'METRICS', 'SCHEDULE', 'STATUS', 'ACCESS'].map((header) => (
                  <th key={header} className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-secondary)]">
              {filteredArticles && filteredArticles.length > 0 ? (
                filteredArticles.map((article, idx) => {
                  const isScheduled = article.scheduled_at && isFuture(parseISO(article.scheduled_at));
                  const metrics = {
                    keywords: getMetric(article, 'keywords'),
                    outline: getMetric(article, 'outline'),
                    sources: getMetric(article, 'sources'),
                    words: getMetric(article, 'words')
                  };
                  
                  return (
                    <tr 
                      key={article.id} 
                      className={cn(
                        "group hover:bg-[var(--accent-cyan)]/5 transition-all duration-300",
                        isScheduled ? 'bg-[var(--accent-blue)]/5' : undefined
                      )}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-xs font-mono text-gray-500 mb-1">
                            {article.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(article.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-[var(--accent-cyan)] transition-colors mb-1">
                            {article.topic || 'Untitled Operation'}
                          </p>
                          {article.raw_query && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {article.raw_query}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/10 uppercase tracking-wider font-mono">
                          {article.category || 'General'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex gap-3">
                          {metrics.sources > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[var(--accent-cyan)]">
                              <LinkIcon size={10} />
                              <span className="font-mono">{metrics.sources}</span>
                            </div>
                          )}
                          {metrics.keywords > 0 && (
                            <div className="flex items-center gap-1 text-xs text-purple-400">
                              <Hash size={10} />
                              <span className="font-mono">{metrics.keywords}</span>
                            </div>
                          )}
                          {metrics.outline > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[var(--accent-cyan)]">
                              <FileText size={10} />
                              <span className="font-mono">{metrics.outline}</span>
                            </div>
                          )}
                          {metrics.words > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[var(--accent-amber)]">
                              <Target size={10} />
                              <span className="font-mono">{metrics.words}w</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        {isScheduled && article.scheduled_at ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-[var(--accent-blue)] font-mono">
                              {format(new Date(article.scheduled_at), 'MMM dd HH:mm')}
                            </div>
                            <CountdownTimer targetDate={article.scheduled_at} compact />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 font-mono">—</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold font-mono uppercase border",
                          getStatusBadge(article.status, article.scheduled_at)
                        )}>
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                          {isScheduled ? 'SCHEDULED' : article.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-5 text-right">
                        <Link href={`/article/${article.id}`}>
                          <button className="flex items-center gap-2 text-[10px] font-bold font-mono text-[var(--accent-cyan)] hover:text-white transition-all ml-auto border border-[var(--accent-cyan)]/30 hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 px-4 py-2 rounded-md group">
                            OPEN 
                            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Database size={56} className="text-gray-700" />
                      <p className="text-gray-600 font-mono text-sm tracking-wider">
                        {isLoading 
                          ? "SYNCING DATABASE..." 
                          : searchQuery 
                            ? `NO RESULTS FOR "${searchQuery}"`
                            : "DATABASE EMPTY // INITIALIZE NEW OPERATION"
                        }
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-[var(--accent-cyan)] hover:text-white font-mono transition-colors"
                        >
                          CLEAR SEARCH
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {filteredArticles.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 font-mono px-2">
          <span className="tracking-wider">
            SHOWING {filteredArticles.length} OF {articles?.length || 0} RECORDS
          </span>
          <span className="tracking-wider">
            LAST SYNC: {format(new Date(), 'HH:mm:ss')}
          </span>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}