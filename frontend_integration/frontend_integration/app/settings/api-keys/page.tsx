'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TechInput } from '@/components/ui/tech-input';
import { apiKeyApi } from '@/lib/api-client';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { APIKey, APIKeyWithSecret } from '@/types';

export default function APIKeysPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<APIKeyWithSecret | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await apiKeyApi.list();
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiKeyApi.create(keyName);
      return response.data;
    },
    onSuccess: (data) => {
      setNewKey(data);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setKeyName('');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiKeyApi.revoke(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setNewKey(null);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
            API KEYS
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-wider">
            AUTHENTICATION // WEBHOOK_ACCESS // SECURE_TOKENS
          </p>
        </div>
        <Button 
          variant="primary" 
          glow 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          GENERATE KEY
        </Button>
      </div>

      {showCreateModal && !newKey && (
        <GlassCard className="p-8" glow="cyan">
          <h2 className="text-xl font-bold text-white mb-6 font-mono">
            GENERATE NEW API KEY
          </h2>
          
          <TechInput
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            label="KEY NAME"
            placeholder="e.g., Production Website"
            className="mb-6"
          />

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={!keyName.trim() || createMutation.isPending}
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              <Key size={16} />
              GENERATE
            </Button>
          </div>
        </GlassCard>
      )}

      {newKey && (
        <GlassCard className="p-8 border-2 border-amber-500/30" glow="amber">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="text-amber-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                API KEY GENERATED
              </h3>
              <p className="text-sm text-gray-400">
                Copy this key now. You won't be able to see it again.
              </p>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <code className="flex-1 text-sm text-cyan-400 font-mono break-all">
                {newKey.key}
              </code>
              <button
                onClick={handleCopyKey}
                className="p-2 rounded hover:bg-white/10 transition-colors"
              >
                {copiedKey ? (
                  <Check className="text-green-400" size={20} />
                ) : (
                  <Copy className="text-gray-400" size={20} />
                )}
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleCloseModal}
            className="w-full"
          >
            CLOSE
          </Button>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-mono text-white tracking-wider mb-2">
            YOUR API KEYS
          </h2>
          <p className="text-xs text-gray-500">
            Use these keys to authenticate webhook requests
          </p>
        </div>

        <div className="space-y-3">
          {apiKeys && apiKeys.length > 0 ? (
            apiKeys.map((key: APIKey) => (
              <div
                key={key.id}
                className="p-5 rounded-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key size={16} className="text-cyan-400" />
                      <h3 className="text-white font-medium">
                        {key.name || 'Unnamed Key'}
                      </h3>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Prefix:</span>
                        <code className="text-xs text-cyan-400 font-mono bg-black/40 px-2 py-1 rounded">
                          {key.prefix}...
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Created: {format(new Date(key.created_at), 'MMM dd, yyyy')}
                        </span>
                        {key.last_used_at && (
                          <>
                            <span>•</span>
                            <span>
                              Last used: {format(new Date(key.last_used_at), 'MMM dd, HH:mm')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Revoke this API key? This cannot be undone.')) {
                        revokeMutation.mutate(key.id);
                      }
                    }}
                    disabled={revokeMutation.isPending}
                    className="p-2 rounded-lg text-gray-500 hover:text-magenta-400 hover:bg-magenta-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Key size={48} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-600 font-mono text-sm">NO API KEYS YET</p>
              <p className="text-gray-500 text-xs mt-2">
                Generate a key to start using webhooks
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6 bg-gradient-to-br from-cyan-500/5 to-transparent">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-3">
          💡 HOW TO USE API KEYS
        </h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• Use API keys to authenticate webhook requests from NeuralGen</p>
          <p>• Include the key in the X-API-Key header of your webhook endpoint</p>
          <p>• Keep your keys secure and never commit them to version control</p>
          <p>• Revoke compromised keys immediately and generate new ones</p>
        </div>
      </GlassCard>
    </div>
  );
}
