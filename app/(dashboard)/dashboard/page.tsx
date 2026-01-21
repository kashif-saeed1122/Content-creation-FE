'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GlassCard } from '@/components/ui/glass-card';
import { Article, DashboardStats } from '@/app/types';
import { 
  Activity, CheckCircle, Clock, FileText, ArrowUpRight, 
  TrendingUp, Zap, Database, Filter
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: async () => (await apiClient.get('/stats')).data,
    refetchInterval: 10000
  });

  // Fetch Recent Articles
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => (await apiClient.get('/articles?limit=50')).data,
    refetchInterval: 5000
  });

  // Filter articles
  const filteredArticles = articles?.filter(article => 
    statusFilter === 'all' ? true : article.status === statusFilter
  );

  const STAT_CARDS = [
    { 
      label: 'PROCESSING', 
      value: stats?.processing || 0, 
      icon: Activity, 
      color: 'text-amber-400', 
      bg: 'bg-amber-400/10', 
      border: 'border-amber-400/30',
      gradient: 'from-amber-500/20 to-orange-500/20'
    },
    { 
      label: 'COMPLETED', 
      value: stats?.completed || 0, 
      icon: CheckCircle, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10', 
      border: 'border-emerald-400/30',
      gradient: 'from-emerald-500/20 to-teal-500/20'
    },
    { 
      label: 'SCHEDULED', 
      value: stats?.scheduled || 0, 
      icon: Clock, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10', 
      border: 'border-blue-400/30',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      label: 'TOTAL', 
      value: stats?.total || 0, 
      icon: Database, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10', 
      border: 'border-purple-400/30',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      processing: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '⚡', label: 'PROCESSING' },
      completed: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '✓', label: 'COMPLETED' },
      scheduled: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: '⏰', label: 'SCHEDULED' },
      failed: { color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: '✗', label: 'FAILED' },
      posted: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: '🚀', label: 'POSTED' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Command Center</h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <p className="text-gray-400 font-mono text-sm">System Online • All Services Operational</p>
          </div>
        </div>
        <Link href="/dashboard/create">
          <button className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center gap-3">
            <Zap size={20} className="group-hover:rotate-12 transition-transform" />
            New Operation
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, idx) => (
          <div 
            key={stat.label} 
            className={`relative overflow-hidden rounded-2xl p-6 border backdrop-blur-sm ${stat.border} ${stat.bg} group hover:scale-105 transition-all duration-300 cursor-pointer`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-mono font-bold tracking-widest text-gray-500 mb-2">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-10 bg-white/10 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
              
              {/* Mini trend indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp size={12} />
                <span className="font-mono">Live updates enabled</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Quick Analytics</h3>
              <p className="text-sm text-gray-400">
                {stats?.completed || 0} articles completed • {stats?.processing || 0} in progress
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'all' 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              ALL
            </button>
            <button 
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'processing' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              PROCESSING
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'completed' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              COMPLETED
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Articles Feed */}
      <GlassCard className="overflow-hidden border-white/10">
        <div className="p-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              Live Operations Feed
            </h2>
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-mono text-blue-400">
              {filteredArticles?.length || 0} operations
            </span>
          </div>
          <Link href="/articles">
            <button className="text-sm font-mono text-blue-400 hover:text-white transition-colors flex items-center gap-2 group">
              View All
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          {articlesLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-mono text-sm">Loading operations data...</p>
            </div>
          ) : filteredArticles && filteredArticles.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-mono text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredArticles.map((article) => {
                  const badge = getStatusBadge(article.status);
                  return (
                    <tr key={article.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${badge.color} ${article.status === 'processing' ? 'animate-pulse' : ''}`}>
                          <span>{badge.icon}</span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-white transition-colors">
                            {article.topic || 'Untitled Operation'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            ID: {article.id.toString().slice(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 font-medium">
                          {article.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-400">
                            {format(new Date(article.created_at), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/article/${article.id}`}>
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400 rounded-lg transition-all opacity-80 group-hover:opacity-100">
                            OPEN
                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-700 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-400 mb-2">No Operations Found</h3>
              <p className="text-gray-600 font-mono text-sm mb-6">
                {statusFilter !== 'all' 
                  ? `No articles with status: ${statusFilter}` 
                  : 'Start by creating your first article operation'}
              </p>
              <Link href="/dashboard/create">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                  Create First Article
                </button>
              </Link>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}