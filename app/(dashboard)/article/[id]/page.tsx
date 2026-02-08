'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { GlassCard } from '@/components/ui/glass-card';
import { Article, OutlineItem, Keyword } from '@/app/types';
import { 
  ArrowLeft, FileText, Hash, Link as LinkIcon, Target, 
  Clock, Calendar, MapPin, Zap, Copy, Check, ExternalLink,
  Edit, Save, X, Download
} from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const articleId = params.id as string;
  const [copiedContent, setCopiedContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await apiClient.get(`/articles/${articleId}`);
      return response.data;
    },
    enabled: !!articleId,
  });

  // Mutation for updating article content
  const updateMutation = useMutation({
    mutationFn: async (newContent: string) => {
      await apiClient.patch(`/articles/${articleId}`, { content: newContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      setIsEditing(false);
    }
  });

  // Safe parsers
  const parseKeywords = (keywords: any): Keyword[] => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) {
      return keywords.map(k => {
        if (typeof k === 'string') return { text: k, keyword: k };
        if (typeof k === 'object') return k;
        return { text: String(k), keyword: String(k) };
      });
    }
    return [];
  };

  const parseOutline = (outline: any): OutlineItem[] => {
    if (!outline) return [];
    if (Array.isArray(outline)) {
      return outline.flatMap((item, idx) => {
        // Handle nested structure with subsections
        const items: OutlineItem[] = [];
        
        if (typeof item === 'string') {
          items.push({ id: String(idx), text: item, title: item, level: 1 });
        } else if (typeof item === 'object') {
          const mainItem: OutlineItem = {
            id: item.id || String(idx),
            text: item.text || item.heading || item.title || '',
            title: item.heading || item.title || item.text || '',
            level: item.level || 1
          };
          items.push(mainItem);
          
          // Handle subsections
          if (item.subsections && Array.isArray(item.subsections)) {
            item.subsections.forEach((sub: any, subIdx: number) => {
              items.push({
                id: sub.id || `${idx}-${subIdx}`,
                text: sub.text || sub.heading || sub.title || '',
                title: sub.heading || sub.title || sub.text || '',
                level: sub.level || 2
              });
            });
          }
        }
        
        return items;
      });
    }
    return [];
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!article?.content) return;
    const blob = new Blob([article.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.topic || 'article'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setEditedContent(article?.content || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editedContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 font-mono">Article not found</p>
      </div>
    );
  }

  const keywords = parseKeywords(article.brief?.keywords);
  const outline = parseOutline(article.brief?.outline);
  const isScheduled = article.scheduled_at && isFuture(parseISO(article.scheduled_at));
  const scheduledTime = article.scheduled_at ? (() => {
    try {
      const date = parseISO(article.scheduled_at);
      const zonedDate = toZonedTime(date, article.timezone || 'UTC');
      return {
        date: format(zonedDate, 'MMMM dd, yyyy'),
        time: format(zonedDate, 'HH:mm:ss'),
        timezone: article.timezone || 'UTC'
      };
    } catch (e) {
      return null;
    }
  })() : null;

  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const targetProgress = article.target_length ? (wordCount / article.target_length) * 100 : 0;

  const getStatusColor = (status: string) => {
    const colors = {
      processing: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      failed: 'text-red-400 bg-red-400/10 border-red-400/30',
      posted: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
    };
    return colors[status as keyof typeof colors] || colors.completed;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {article.topic || 'Untitled Article'}
          </h1>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono border ${getStatusColor(article.status)}`}>
              {article.status.toUpperCase()}
            </span>
            
            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20">
              {article.category}
            </span>
            
            <span className="text-xs text-gray-500 font-mono">
              ID: {article.id.slice(0, 13)}...
            </span>
            
            <span className="text-xs text-gray-500">
              Created {format(new Date(article.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>

        {article.content && (
          <div className="flex gap-2">
            <button 
              onClick={downloadMarkdown}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-all"
            >
              <Download size={16} />
              Download
            </button>
            
            <button 
              onClick={() => copyToClipboard(article.content!)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all"
            >
              {copiedContent ? <Check size={16} /> : <Copy size={16} />}
              {copiedContent ? 'Copied!' : 'Copy'}
            </button>
            
            {!isEditing && (
              <button 
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:border-emerald-400 transition-all"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <FileText className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono mb-0.5">WORD COUNT</p>
              <p className="text-xl font-bold text-white">
                {wordCount} / {article.target_length || 1500}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${Math.min(100, targetProgress)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {Math.round(targetProgress)}%
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <LinkIcon className="text-cyan-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono mb-0.5">SOURCES</p>
              <p className="text-xl font-bold text-white">
                {article.sources?.length || 0} / {article.source_count || 5}
              </p>
              <p className="text-xs text-gray-500 mt-1">Research links</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Hash className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono mb-0.5">KEYWORDS</p>
              <p className="text-xl font-bold text-white">{keywords.length}</p>
              <p className="text-xs text-gray-500 mt-1">SEO targets</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Target className="text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono mb-0.5">SECTIONS</p>
              <p className="text-xl font-bold text-white">{outline.length}</p>
              <p className="text-xs text-gray-500 mt-1">Content blocks</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Schedule Info */}
      {isScheduled && scheduledTime && (
        <GlassCard className="p-6 border-blue-500/30 bg-blue-500/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="text-blue-400" size={20} />
                <h3 className="text-lg font-bold text-white">Scheduled Publication</h3>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-blue-400">
                  <Calendar size={16} />
                  <span className="font-mono">{scheduledTime.date}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-300">
                  <Clock size={16} />
                  <span className="font-mono">{scheduledTime.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span className="font-mono">{scheduledTime.timezone}</span>
                </div>
              </div>
            </div>
            <CountdownTimer targetDate={article.scheduled_at!} />
          </div>
        </GlassCard>
      )}

      {/* Original Query */}
      {article.raw_query && (
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-purple-400" size={20} />
            <h3 className="text-lg font-bold text-white">Original Query</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{article.raw_query}</p>
        </GlassCard>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - SEO Brief */}
        <div className="lg:col-span-1 space-y-6">
          {/* Keywords */}
          {keywords.length > 0 && (
            <GlassCard className="p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="text-purple-400" size={20} />
                <h3 className="text-lg font-bold text-white">Target Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 20).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono"
                  >
                    {keyword.text || keyword.keyword}
                  </span>
                ))}
                {keywords.length > 20 && (
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700 font-mono">
                    +{keywords.length - 20} more
                  </span>
                )}
              </div>
            </GlassCard>
          )}

          {/* OUTLINE - This replaces Strategy */}
          {outline.length > 0 && (
            <GlassCard className="p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-emerald-400" size={20} />
                <h3 className="text-lg font-bold text-white">Content Outline</h3>
              </div>
              <div className="space-y-2">
                {outline.map((item, idx) => {
                  const level = item.level || 1;
                  const indent = (level - 1) * 16;
                  
                  return (
                    <div 
                      key={item.id || idx}
                      style={{ paddingLeft: `${indent}px` }}
                      className={`flex items-start gap-2 py-2 border-l-2 pl-3 ${
                        level === 1 ? 'border-emerald-500/50' : 
                        level === 2 ? 'border-blue-500/50' : 
                        'border-purple-500/50'
                      }`}
                    >
                      <span className={`text-xs font-mono mt-0.5 ${
                        level === 1 ? 'text-emerald-400' :
                        level === 2 ? 'text-blue-400' :
                        'text-purple-400'
                      }`}>
                        {level === 1 ? 'H1' : level === 2 ? 'H2' : level === 3 ? 'H3' : 'H4'}
                      </span>
                      <p className={`text-sm text-gray-300 ${level === 1 ? 'font-semibold' : ''}`}>
                        {item.title || item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <GlassCard className="p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-white">Research Sources</h3>
              </div>
              <div className="space-y-3">
                {article.sources.map((source, idx) => (
                  <div 
                    key={source.id}
                    className="p-3 bg-black/20 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors flex-1">
                        {source.title || 'Untitled Source'}
                      </p>
                      <span className="text-xs text-gray-600 font-mono shrink-0">
                        #{idx + 1}
                      </span>
                    </div>
                    <a 
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono truncate flex items-center gap-1 group"
                    >
                      <span className="truncate">{source.url}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                    {source.source_origin && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                        {source.source_origin}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="text-white" size={20} />
                <h3 className="text-lg font-bold text-white">
                  {isEditing ? 'Edit Content' : 'Generated Content'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-all disabled:opacity-50"
                    >
                      <Save size={14} />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
                <span className="text-xs text-gray-500 font-mono">
                  {isEditing ? editedContent.split(/\s+/).length : wordCount} words
                </span>
              </div>
            </div>
            
            {article.content ? (
              isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[800px] bg-black/40 border border-white/10 rounded-lg p-4 text-gray-300 font-mono text-sm focus:border-emerald-500 outline-none resize-none"
                  placeholder="Edit your markdown content here..."
                />
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-200 mb-2 mt-4" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-300 mb-2 mt-3" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="text-blue-300" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400 text-sm" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4" {...props} />,
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500 font-mono text-sm">
                  {article.status === 'processing' ? 'Generating content...' : 'No content available'}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}