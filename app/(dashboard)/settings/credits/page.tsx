'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { creditApi } from '@/lib/api-client';
import { CreditCard, TrendingUp, TrendingDown, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { CreditTransaction } from '@/types';

export default function CreditsPage() {
  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: async () => {
      const response = await creditApi.getBalance();
      return response.data;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['credit-transactions'],
    queryFn: async () => {
      const response = await creditApi.getTransactions(100);
      return response.data;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
          CREDIT BALANCE
        </h1>
        <p className="text-gray-500 font-mono text-xs tracking-wider">
          WALLET_SYSTEM // TOKEN_BASED // 2000_TOKENS_PER_CREDIT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-8" glow="cyan" holographic>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-mono text-gray-400 mb-2 tracking-wider">
                  AVAILABLE CREDITS
                </p>
                <div className="flex items-baseline gap-4 mb-6">
                  <p className="text-6xl font-bold text-white font-mono">
                    {balance?.credits || 0}
                  </p>
                  <span className="text-2xl text-gray-500 font-mono">credits</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "px-3 py-1 rounded-full font-mono uppercase border",
                    balance?.plan === 'pro' 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                  )}>
                    {balance?.plan || 'FREE'} PLAN
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">1 credit ≈ 2000 tokens</span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <CreditCard className="text-cyan-400" size={32} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <Button variant="primary" glow className="w-full">
                <Package size={16} />
                PURCHASE CREDITS
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3 font-mono">
                Stripe integration coming soon
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xs font-mono text-gray-400 mb-4 tracking-wider">
              QUICK STATS
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Articles Generated</span>
                <span className="text-lg font-bold text-white font-mono">
                  {transactions?.filter((t: CreditTransaction) => t.type === 'usage').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Tokens Used</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {transactions?.reduce((sum: number, t: CreditTransaction) => 
                    sum + (t.tokens_consumed || 0), 0).toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Credits Spent</span>
                <span className="text-lg font-bold text-magenta-400 font-mono">
                  {Math.abs(transactions?.filter((t: CreditTransaction) => t.amount < 0)
                    .reduce((sum: number, t: CreditTransaction) => sum + t.amount, 0) || 0)}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <div className="mb-4">
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                💡 HOW IT WORKS
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Credits are deducted based on actual token usage. 
                Each 2000 tokens costs 1 credit.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-6" glow="magenta">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-mono text-white tracking-wider">
              TRANSACTION HISTORY
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Complete audit trail of all credit movements
            </p>
          </div>
          <Clock size={20} className="text-magenta-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-xs font-mono text-gray-500 tracking-wider">
                  DATE
                </th>
                <th className="text-left py-3 text-xs font-mono text-gray-500 tracking-wider">
                  TYPE
                </th>
                <th className="text-left py-3 text-xs font-mono text-gray-500 tracking-wider">
                  DESCRIPTION
                </th>
                <th className="text-right py-3 text-xs font-mono text-gray-500 tracking-wider">
                  TOKENS
                </th>
                <th className="text-right py-3 text-xs font-mono text-gray-500 tracking-wider">
                  AMOUNT
                </th>
                <th className="text-right py-3 text-xs font-mono text-gray-500 tracking-wider">
                  BALANCE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions && transactions.length > 0 ? (
                transactions.map((txn: CreditTransaction) => (
                  <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm text-gray-400">
                      {format(new Date(txn.created_at), 'MMM dd, HH:mm')}
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border",
                        txn.type === 'usage' 
                          ? 'bg-magenta-500/10 text-magenta-400 border-magenta-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      )}>
                        {txn.amount < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-300 max-w-md truncate">
                      {txn.description || '—'}
                    </td>
                    <td className="py-4 text-right">
                      {txn.tokens_consumed ? (
                        <span className="text-sm text-amber-400 font-mono">
                          {txn.tokens_consumed.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "text-sm font-mono font-bold",
                        txn.amount > 0 ? "text-cyan-400" : "text-magenta-400"
                      )}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                      </span>
                    </td>
                    <td className="py-4 text-right text-white font-mono font-bold">
                      {txn.balance_after}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Clock size={48} className="mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-600 font-mono text-sm">NO TRANSACTIONS YET</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
