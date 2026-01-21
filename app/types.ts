export type ArticleStatus = 'processing' | 'scheduled' | 'completed' | 'failed' | 'posted';

export interface Source {
  id: string;
  url: string;
  title: string;
  full_content?: string;
  source_origin: string;
}

export interface Keyword {
  keyword?: string;
  text?: string;
  relevance?: number;
}

export interface OutlineItem {
  id?: string;
  text?: string;
  title?: string;
  level?: number;
}

export interface SEOBrief {
  id: string;
  article_id: string;
  keywords: Keyword[] | string[] | Record<string, any>;
  outline: OutlineItem[] | string[] | Record<string, any>;
  strategy: string;
  analysis_meta: any;
}

export interface Article {
  id: string;
  user_id: string;
  topic: string;
  category: string;
  status: ArticleStatus;
  scheduled_at: string | null;
  created_at: string;
  
  // Extended fields from detail view
  raw_query?: string;
  target_length?: number;
  source_count?: number;
  timezone?: string;
  content?: string;
  
  // Related data (populated in detail endpoint)
  sources?: Source[];
  brief?: SEOBrief;
}

export interface DashboardStats {
  total: number;
  processing: number;
  scheduled: number;
  completed: number;
  posted: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}