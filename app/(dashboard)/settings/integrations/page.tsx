'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TechInput } from '@/components/ui/tech-input';
import { integrationApi } from '@/lib/api-client';
import { Webhook, Plus, Trash2, Zap, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { WebhookIntegration } from '@/types';

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhook_url: '',
    webhook_secret: '',
    platform_type: 'custom'
  });
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await integrationApi.list();
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await integrationApi.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setShowCreateForm(false);
      setFormData({ name: '', webhook_url: '', webhook_secret: '', platform_type: 'custom' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await integrationApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  const testMutation = useMutation({
    mutationFn: async ({ url, secret }: { url: string; secret?: string }) => {
      const response = await integrationApi.test(url, secret);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setTimeout(() => setTestingId(null), 3000);
    }
  });

  const handleTest = (integration: WebhookIntegration) => {
    setTestingId(integration.id);
    testMutation.mutate({ 
      url: integration.webhook_url,
      secret: undefined
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            WEBHOOK INTEGRATIONS
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            AUTO_POST // DEPLOYMENT_TARGETS // REAL_TIME_SYNC
          </p>
        </div>
        <Button 
          variant="primary" 
          glow 
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={16} />
          ADD INTEGRATION
        </Button>
      </div>

      {showCreateForm && (
        <GlassCard className="p-8" glow="cyan">
          <h2 className="text-xl font-bold text-white mb-6 font-mono">
            SETUP WEBHOOK INTEGRATION
          </h2>
          
          <div className="space-y-6">
            <TechInput
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              label="INTEGRATION NAME"
              placeholder="e.g., Production Website"
            />

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-3 tracking-wider">
                PLATFORM TYPE
              </label>
              <select
                value={formData.platform_type}
                onChange={(e) => setFormData({ ...formData, platform_type: e.target.value })}
                className="w-full bg-black/40 border border-[var(--border-primary)] rounded-md px-4 py-3 text-sm text-white focus:border-[var(--accent-cyan)] outline-none transition-all"
              >
                <option value="custom">Custom Webhook</option>
                <option value="wordpress">WordPress</option>
                <option value="nextjs">Next.js</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <TechInput
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              label="WEBHOOK URL"
              placeholder="https://your-site.com/api/articles/receive"
            />

            <TechInput
              type="text"
              value={formData.webhook_secret}
              onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
              label="WEBHOOK SECRET (Optional)"
              placeholder="For HMAC signature verification"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={!formData.name || !formData.webhook_url || createMutation.isPending}
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              <Webhook size={16} />
              CREATE
            </Button>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-mono text-white tracking-wider mb-2">
            ACTIVE INTEGRATIONS
          </h2>
          <p className="text-xs text-gray-500">
            Configured webhook endpoints for article delivery
          </p>
        </div>

        <div className="space-y-3">
          {integrations && integrations.length > 0 ? (
            integrations.map((integration: WebhookIntegration) => (
              <div
                key={integration.id}
                className="p-5 rounded-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Webhook size={16} className="text-cyan-400" />
                      <h3 className="text-white font-medium">
                        {integration.name}
                      </h3>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-mono uppercase",
                        integration.is_active
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                      )}>
                        {integration.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">URL:</span>
                        <code className="text-xs text-cyan-400 font-mono break-all">
                          {integration.webhook_url}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Platform:</span>
                        <span className="text-xs text-gray-400 uppercase">
                          {integration.platform_type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Created: {format(new Date(integration.created_at), 'MMM dd, yyyy')}
                        </span>
                        {integration.last_test_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              Last tested: {format(new Date(integration.last_test_at), 'MMM dd, HH:mm')}
                              {integration.last_test_status === 'success' ? (
                                <CheckCircle2 size={12} className="text-green-400" />
                              ) : integration.last_test_status === 'failure' ? (
                                <XCircle size={12} className="text-red-400" />
                              ) : null}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTest(integration)}
                      disabled={testMutation.isPending && testingId === integration.id}
                      className="p-2 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                      title="Test connection"
                    >
                      {testMutation.isPending && testingId === integration.id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Zap size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this integration?')) {
                          deleteMutation.mutate(integration.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg text-gray-500 hover:text-magenta-400 hover:bg-magenta-500/10 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {testMutation.isSuccess && testingId === integration.id && testMutation.data && (
                  <div className={cn(
                    "mt-3 p-3 rounded-lg border text-sm font-mono",
                    testMutation.data.success
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  )}>
                    {testMutation.data.message}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Webhook size={48} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-600 font-mono text-sm">NO INTEGRATIONS YET</p>
              <p className="text-gray-500 text-xs mt-2">
                Add a webhook to start auto-posting articles
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-3">
            📡 WEBHOOK FORMAT
          </h3>
          <div className="bg-black/40 rounded p-3 overflow-x-auto">
            <pre className="text-xs text-gray-400">
{`POST /api/articles/receive
Content-Type: application/json
X-API-Key: your-api-key
X-Webhook-Signature: hmac-sha256

{
  "article_id": "...",
  "title": "Article Title",
  "content": "Full content...",
  "category": "Technology",
  "seo_keywords": [...]
}`}
            </pre>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-magenta-500/5 to-transparent">
          <h3 className="text-sm font-mono text-magenta-400 uppercase tracking-wider mb-3">
            🔐 SECURITY
          </h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Verify API keys in your endpoint</p>
            <p>• Use webhook secrets for HMAC verification</p>
            <p>• Validate request signatures</p>
            <p>• Use HTTPS in production</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}