'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GlassCard } from '@/components/ui/glass-card';
import { Article } from '@/app/types';
import { FileText, ArrowUpRight, Search, Filter, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ArticlesListPage() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['all-articles'],
    queryFn: async () => {
      console.log('🔍 Fetching articles from API...');
      const response = await apiClient.get('/articles?limit=100');
      console.log('✅ Articles received:', response.data);
      console.log('📊 Total articles:', response.data.length);
      
      // Debug: Log each article ID
      response.data.forEach((article: Article, idx: number) => {
        console.log(`Article ${idx + 1}:`, {
          id: article.id,
          id_type: typeof article.id,
          id_length: article.id?.toString().length,
          topic: article.topic,
          status: article.status
        });
      });
      
      return response.data;
    },
    refetchInterval: 10000 
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      processing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      failed: 'bg-red-500/10 text-red-400 border-red-500/30',
      posted: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-white mb-1">Content Archive</h1>
          <p className="text-gray-400 font-mono text-xs">DATABASE_ACCESS // FULL_READ_PERMISSION</p>
        </div>
        
        {/* Simple Filters Toolbar (Visual only for now) */}
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="SEARCH_DB..." 
              className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white focus:border-blue-500 outline-none w-48"
            />
          </div>
          <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white">
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <GlassCard className="p-6 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <h3 className="text-white font-bold mb-1">Error Loading Articles</h3>
              <p className="text-red-400 text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-0 overflow-hidden border-white/10 min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">ID / Date</th>
                <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest w-1/3">Topic</th>
                <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500 font-mono text-sm">SYNCING_DATABASE...</p>
                    </div>
                  </td>
                </tr>
              ) : articles && articles.length > 0 ? (
                articles.map((article) => {
                  // Ensure ID is a string and properly formatted
                  const articleId = article.id?.toString() || '';
                  const articleUrl = `/article/${articleId}`;
                  
                  // Debug log for each rendered article
                  console.log('🔗 Rendering article link:', {
                    topic: article.topic,
                    id: articleId,
                    url: articleUrl,
                    id_valid: articleId.length > 0
                  });

                  return (
                    <tr key={articleId} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs font-mono text-gray-500 mb-1" title={articleId}>
                            {articleId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(article.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {article.topic || 'Untitled Operation'}
                        </p>
                        <p className="text-xs text-gray-600 font-mono mt-1">
                          Full ID: {articleId}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 border border-white/10 uppercase tracking-wider">
                          {article.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${getStatusBadge(article.status)}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={articleUrl}
                          onClick={(e) => {
                            console.log('🖱️ Click event:', {
                              article_id: articleId,
                              url: articleUrl,
                              timestamp: new Date().toISOString()
                            });
                          }}
                        >
                          <button className="text-[10px] font-bold font-mono text-blue-500 hover:text-white transition-colors flex items-center gap-1 ml-auto border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded">
                            OPEN_FILE <ArrowUpRight size={10} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-mono">
                    DATABASE_EMPTY // INIT_NEW_OPERATION
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && articles && articles.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-black/40">
            <details className="text-xs">
              <summary className="text-gray-500 font-mono cursor-pointer hover:text-gray-400">
                🐛 Debug Info (click to expand)
              </summary>
              <div className="mt-3 p-3 bg-black/60 rounded font-mono text-gray-400 max-h-60 overflow-auto">
                <pre>{JSON.stringify(articles, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </GlassCard>
    </div>
  );
}