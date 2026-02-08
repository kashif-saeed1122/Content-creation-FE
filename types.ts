import { UUID } from 'crypto';

export interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  plan: string;
}

export interface Article {
  id: string;
  topic: string;
  raw_query: string;
  status: string;
  scheduled_at: string | null;
  timezone: string;
  created_at: string;
  category: string;
  target_length: number;
  source_count: number;
  content: string | null;
  sources: Source[];
  brief: SEOBrief | null;
  campaign_id: string | null;
  is_recurring: boolean;
  tokens_used: number;
  posted_at: string | null;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  source_origin: string;
}

export interface SEOBrief {
  keywords: string[];
  outline: any;
  strategy: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string;
  topic: string;
  category: string;
  articles_per_day: number;
  posting_times: string[];
  start_date: string;
  end_date: string | null;
  total_articles: number | null;
  target_length: number;
  source_count: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  articles_generated: number;
  articles_posted: number;
  credits_used: number;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
  last_run_at: string | null;
  next_run_at: string | null;
}

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface APIKeyWithSecret extends APIKey {
  key: string;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  tokens_consumed: number | null;
  created_at: string;
}

export interface WebhookIntegration {
  id: string;
  name: string;
  webhook_url: string;
  platform_type: string;
  is_active: boolean;
  last_test_at: string | null;
  last_test_status: string | null;
  created_at: string;
}
