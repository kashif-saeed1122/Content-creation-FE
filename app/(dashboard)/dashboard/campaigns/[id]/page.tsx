'use client';

import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { campaignApi } from '@/lib/api-client';
import { ArrowLeft, FileText, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Campaign, Article } from '@/types';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaign } = useQuery<Campaign>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await campaignApi.get(campaignId);
      return response.data;
    }
  });

  const { data: articles } = useQuery<Article[]>({
    queryKey: ['campaign-articles', campaignId],
    queryFn: async () => {
      const response = await campaignApi.getArticles(campaignId);
      return response.data;
    }
  });

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-cyan-400">Loading...</div>
      </div>
    );
  }

  const statusCounts = {
    queued: articles?.filter(a => a.status === 'queued').length || 0,
    processing: articles?.filter(a => a.status === 'processing').length || 0,
    completed: articles?.filter(a => a.status === 'completed').length || 0,
    posted: articles?.filter(a => a.status === 'posted').length || 0,
    failed: articles?.filter(a => a.status === 'failed').length || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="secondary" size="sm">
            <ArrowLeft size={16} />
            BACK
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            {campaign.name}
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            CAMPAIGN_DETAIL // ID: {campaignId.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6" glow="cyan">
          <h2 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
            CAMPAIGN INFO
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Topic</p>
              <p className="text-white">{campaign.topic}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="text-cyan-400">{campaign.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Articles/Day</p>
                <p className="text-white font-mono">{campaign.articles_per_day}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Posting Times</p>
                <p className="text-cyan-400 font-mono text-sm">
                  {campaign.posting_times.join(', ')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="text-white text-sm">
                  {format(new Date(campaign.start_date), 'MMM dd, yyyy')}
                </p>
              </div>
              {campaign.end_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">End Date</p>
                  <p className="text-white text-sm">
                    {format(new Date(campaign.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glow="magenta">
          <h2 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
            STATISTICS
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Generated</p>
              <p className="text-2xl font-bold text-white font-mono">
                {campaign.articles_generated}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Posted</p>
              <p className="text-2xl font-bold text-green-400 font-mono">
                {campaign.articles_posted}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Credits Used</p>
              <p className="text-2xl font-bold text-amber-400 font-mono">
                {campaign.credits_used}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className={cn(
                "text-xl font-bold font-mono uppercase",
                campaign.status === 'active' ? 'text-cyan-400' : 'text-amber-400'
              )}>
                {campaign.status}
              </p>
            </div>
          </div>

          {campaign.last_run_at && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">Last Run</p>
              <p className="text-sm text-white">
                {format(new Date(campaign.last_run_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <GlassCard key={status} className="p-4" holographic>
            <p className="text-xs font-mono text-gray-400 uppercase mb-2">
              {status}
            </p>
            <p className="text-2xl font-bold text-white font-mono">{count}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-mono text-white tracking-wider">
              GENERATED ARTICLES
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {articles?.length || 0} articles total
            </p>
          </div>
          <FileText size={20} className="text-cyan-400" />
        </div>

        <div className="space-y-3">
          {articles && articles.length > 0 ? (
            articles.map((article, idx) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <div 
                  className="p-4 rounded-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all group"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium mb-2 group-hover:text-cyan-400 transition-colors">
                        {article.topic || article.raw_query}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-mono">{article.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>{format(new Date(article.created_at), 'MMM dd, HH:mm')}</span>
                        {article.scheduled_at && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              <span>Scheduled: {format(new Date(article.scheduled_at), 'HH:mm')}</span>
                            </div>
                          </>
                        )}
                        {article.tokens_used > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400">{article.tokens_used} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-mono uppercase border",
                        article.status === 'completed' || article.status === 'posted'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : article.status === 'failed'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      )}>
                        {article.status}
                      </span>
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 text-center">
              <FileText size={48} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-600 font-mono text-sm">NO ARTICLES YET</p>
              <p className="text-gray-500 text-xs mt-2">
                Articles will appear here as they're generated
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
