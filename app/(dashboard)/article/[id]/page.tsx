'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Article } from '@/app/types';
import { GlassCard } from '@/components/ui/glass-card';
import { 
  ChevronLeft, Globe, Copy, Edit3, Save, X, ExternalLink, 
  FileText, Tag, Layers, Check, AlertOctagon 
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

// Next.js 15: params is now a Promise
type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default function ArticlePage({ params }: ArticlePageProps) {
  // Use React.use() to unwrap the Promise
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  
  const isIdPresent = Boolean(articleId && articleId !== 'undefined');

  console.log('🔍 Article Page Debug:', {
    params: resolvedParams,
    articleId,
    isIdPresent,
    idType: typeof articleId
  });

  // Fetch article with all related data
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      if (!articleId || articleId === 'undefined') throw new Error("Invalid ID");
      console.log('📡 Fetching article:', articleId);
      const response = await apiClient.get(`/articles/${articleId}`);
      console.log('✅ Article data received:', response.data);
      return response.data;
    },
    enabled: isIdPresent,
    retry: 1,
    refetchInterval: (query) => {
      return query.state.data?.status === 'processing' ? 3000 : false;
    }
  });

  // Save edited content mutation
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiClient.patch(`/articles/${articleId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      setIsEditing(false);
    }
  });

  const handleEdit = () => {
    setEditedContent(article?.content || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    saveMutation.mutate(editedContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleCopy = () => {
    if (article?.content) {
      navigator.clipboard.writeText(article.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && article) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${article.topic || 'Article'}</title>
            <style>
              body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
              h1 { color: #1a1a1a; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
              h2 { color: #2563eb; margin-top: 30px; }
              h3 { color: #334155; }
              p { margin: 15px 0; color: #1e293b; }
              code { background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
              pre { background: #f1f5f9; padding: 15px; border-radius: 8px; overflow-x: auto; }
              blockquote { border-left: 4px solid #2563eb; padding-left: 20px; margin: 20px 0; color: #475569; font-style: italic; }
              ul, ol { padding-left: 30px; }
              li { margin: 8px 0; }
              .meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="meta">
              <strong>Category:</strong> ${article.category || 'General'} | 
              <strong>Date:</strong> ${format(new Date(article.created_at), 'MMMM dd, yyyy')} | 
              <strong>Status:</strong> ${article.status}
            </div>
            ${article.content ? `<div>${article.content.replace(/\n/g, '<br>')}</div>` : '<p>No content available</p>'}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Loading State
  if (isLoading) return (
    <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="font-mono text-sm text-blue-400 animate-pulse">Loading Article...</p>
          <p className="font-mono text-xs text-gray-600 mt-2">ID: {articleId?.slice(0, 8)}</p>
        </div>
      </div>
    </div>
  );

  // Error State
  if (error || (!article && !isLoading)) return (
    <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
      <GlassCard className="max-w-md p-8 text-center">
        <AlertOctagon className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Article Not Found</h2>
        <p className="text-red-400 font-mono text-sm mb-4">
          {(error as any)?.response?.status === 404 ? 'This article does not exist or has been deleted.' : 'Unable to load article data.'}
        </p>
        <div className="bg-black/50 p-3 rounded text-xs font-mono text-gray-500 mb-6 break-all">
          Article ID: {articleId || 'UNDEFINED'}
        </div>
        <Link href="/dashboard">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            Return to Dashboard
          </button>
        </Link>
      </GlassCard>
    </div>
  );

  const getStatusColor = (status: string) => {
    const colors = {
      processing: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      scheduled: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      failed: 'text-red-400 bg-red-500/10 border-red-500/30',
      posted: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    };
    return colors[status as keyof typeof colors] || colors.completed;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 -mx-8 -mt-8 mb-8">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{article?.topic || 'Untitled Article'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(article?.status || 'processing')}`}>
                    {article?.status?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {article?.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">
                    {format(new Date(article?.created_at || new Date()), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEdit}
                    disabled={!article?.content}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    disabled={!article?.content}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:text-white transition-all text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    <FileText size={16} />
                    Export PDF
                  </button>
                  <button 
                    onClick={handleCopy}
                    disabled={!article?.content}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all text-sm font-medium rounded-lg ${
                      copied 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30'
                    } disabled:opacity-50`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium rounded-lg"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50 text-white transition-all text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar - Metadata & Sources */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Article Metadata */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag size={16} className="text-blue-400" />
              Metadata
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block text-xs mb-1">Target Length</span>
                <span className="text-white font-mono">{article?.target_length || 1500} words</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-1">Sources Used</span>
                <span className="text-white font-mono">{article?.sources?.length || 0} sources</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-1">Article ID</span>
                <span className="text-gray-400 font-mono text-xs break-all">{article?.id}</span>
              </div>
            </div>
          </GlassCard>

          {/* Keywords */}
          {article?.brief?.keywords && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag size={16} className="text-emerald-400" />
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(article.brief.keywords) 
                  ? article.brief.keywords 
                  : []
                ).slice(0, 10).map((kw: any, i: number) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                    {typeof kw === 'string' ? kw : kw.keyword || kw.text}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Sources */}
          {article?.sources && article.sources.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe size={16} className="text-blue-400" />
                Research Sources ({article.sources.length})
              </h3>
              <div className="space-y-3">
                {article.sources.map((source: any, idx: number) => (
                  <a 
                    key={source.id || idx} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {idx + 1}
                        </span>
                        <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-300 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                        {source.title || source.url}
                      </p>
                      {source.source_origin && (
                        <span className="text-xs text-gray-500 mt-2 block">{source.source_origin}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6">
          <GlassCard className="p-8 min-h-[600px]">
            {article?.status === 'processing' ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="text-lg font-bold text-white mb-2">Generating Content...</h3>
                <p className="text-sm text-gray-400 font-mono">
                  AI is researching and writing your article. This may take a few minutes.
                </p>
              </div>
            ) : !article?.content ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <AlertOctagon className="text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-bold text-white mb-2">No Content Available</h3>
                <p className="text-sm text-gray-400">This article hasn't been generated yet.</p>
              </div>
            ) : isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[600px] bg-black/40 border border-white/20 rounded-lg p-6 text-gray-300 font-mono text-sm focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Write your article content here (Markdown supported)..."
                />
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300 font-mono">
                    💡 Tip: You can use Markdown formatting (# headers, **bold**, *italic*, etc.)
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-white/10" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-8 mb-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-200 mt-6 mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4" {...props} />,
                    code: ({node, inline, ...props}: any) => inline 
                      ? <code className="bg-white/10 text-blue-300 px-2 py-0.5 rounded font-mono text-sm" {...props} />
                      : <code className="block bg-black/40 text-emerald-300 p-4 rounded-lg font-mono text-sm overflow-x-auto" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Sidebar - Outline */}
        <div className="lg:col-span-3">
          {article?.brief?.outline && (
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Content Outline
              </h3>
              <div className="space-y-3">
                {(Array.isArray(article.brief.outline) 
                  ? article.brief.outline 
                  : []
                ).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400/50 group-hover:bg-purple-400 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors leading-snug">
                      {typeof item === 'string' ? item : item.text || item.title || JSON.stringify(item)}
                    </p>
                  </div>
                ))}
              </div>
              
              {article?.brief?.strategy && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">SEO Strategy</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{article.brief.strategy}</p>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}