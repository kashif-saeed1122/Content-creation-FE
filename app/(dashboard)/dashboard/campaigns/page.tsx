'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { campaignApi } from '@/lib/api-client';
import { 
  Plus, Play, Pause, ExternalLink, TrendingUp, 
  Calendar, Target, Zap, BarChart3 
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { Campaign } from '@/types';

export default function CampaignsPage() {
  const queryClient = useQueryClient();

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignApi.list();
      return response.data;
    }
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      await campaignApi.pause(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: async (id: string) => {
      await campaignApi.resume(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  const activeCampaigns = campaigns?.filter((c: Campaign) => c.status === 'active') || [];
  const pausedCampaigns = campaigns?.filter((c: Campaign) => c.status === 'paused') || [];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            CAMPAIGNS
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            RECURRING_GENERATION // AUTO_POST // SCHEDULED_OPERATIONS
          </p>
        </div>
        <Link href="/dashboard/create?mode=campaign">
          <Button variant="primary" glow>
            <Plus size={16} />
            NEW CAMPAIGN
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6" holographic>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Zap size={20} className="text-cyan-400" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              ACTIVE
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{activeCampaigns.length}</p>
        </GlassCard>

        <GlassCard className="p-6" holographic>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              GENERATED TODAY
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {campaigns?.reduce((sum: number, c: Campaign) => 
              sum + (c.last_run_at && new Date(c.last_run_at).toDateString() === new Date().toDateString() 
                ? c.articles_per_day 
                : 0), 0) || 0}
          </p>
        </GlassCard>

        <GlassCard className="p-6" holographic>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-magenta-500/10 border border-magenta-500/20">
              <BarChart3 size={20} className="text-magenta-400" />
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              TOTAL ARTICLES
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {campaigns?.reduce((sum: number, c: Campaign) => sum + c.articles_generated, 0) || 0}
          </p>
        </GlassCard>
      </div>

      {activeCampaigns.length > 0 && (
        <div>
          <h2 className="text-lg font-mono text-white mb-4 tracking-wider">
            ACTIVE CAMPAIGNS
          </h2>
          <div className="grid gap-6">
            {activeCampaigns.map((campaign: Campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPause={() => pauseMutation.mutate(campaign.id)}
                onResume={() => resumeMutation.mutate(campaign.id)}
                isPending={pauseMutation.isPending || resumeMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {pausedCampaigns.length > 0 && (
        <div>
          <h2 className="text-lg font-mono text-gray-500 mb-4 tracking-wider">
            PAUSED CAMPAIGNS
          </h2>
          <div className="grid gap-6">
            {pausedCampaigns.map((campaign: Campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPause={() => pauseMutation.mutate(campaign.id)}
                onResume={() => resumeMutation.mutate(campaign.id)}
                isPending={pauseMutation.isPending || resumeMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {(!campaigns || campaigns.length === 0) && (
        <GlassCard className="p-12 text-center">
          <Target size={64} className="mx-auto text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            NO CAMPAIGNS YET
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first campaign to start auto-generating articles
          </p>
          <Link href="/dashboard/create?mode=campaign">
            <Button variant="primary" glow>
              <Plus size={16} />
              CREATE CAMPAIGN
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}

function CampaignCard({ 
  campaign, 
  onPause, 
  onResume, 
  isPending 
}: { 
  campaign: Campaign;
  onPause: () => void;
  onResume: () => void;
  isPending: boolean;
}) {
  const daysRemaining = campaign.end_date 
    ? differenceInDays(new Date(campaign.end_date), new Date())
    : null;

  const progress = campaign.total_articles 
    ? (campaign.articles_generated / campaign.total_articles) * 100
    : 0;

  return (
    <GlassCard className="p-6" glow="cyan">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">
              {campaign.name}
            </h3>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-mono uppercase border",
              campaign.status === 'active'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            )}>
              {campaign.status}
            </span>
          </div>
          {campaign.description && (
            <p className="text-sm text-gray-400 mb-3">{campaign.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Topic: <span className="text-cyan-400">{campaign.topic}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {campaign.status === 'active' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPause}
              disabled={isPending}
            >
              <Pause size={14} />
              PAUSE
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onResume}
              disabled={isPending}
            >
              <Play size={14} />
              RESUME
            </Button>
          )}
          
          <Link href={`/dashboard/campaigns/${campaign.id}`}>
            <Button variant="secondary" size="sm">
              <ExternalLink size={14} />
              VIEW
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1">FREQUENCY</p>
          <p className="text-white font-mono text-sm">
            {campaign.articles_per_day}/day
          </p>
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1">TIMES</p>
          <p className="text-cyan-400 font-mono text-sm">
            {campaign.posting_times.join(', ')}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1">GENERATED</p>
          <p className="text-white font-mono text-sm">
            {campaign.articles_generated}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1">POSTED</p>
          <p className="text-green-400 font-mono text-sm">
            {campaign.articles_posted}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1">CREDITS USED</p>
          <p className="text-amber-400 font-mono text-sm">
            {campaign.credits_used}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>Started: {format(new Date(campaign.start_date), 'MMM dd, yyyy')}</span>
        </div>
        {campaign.end_date && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Ends: {format(new Date(campaign.end_date), 'MMM dd, yyyy')}</span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="text-amber-400">({daysRemaining}d left)</span>
              )}
            </div>
          </>
        )}
      </div>

      {campaign.total_articles && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>PROGRESS</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
