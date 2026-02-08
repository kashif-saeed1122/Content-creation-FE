'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TechInput } from '@/components/ui/tech-input';
import { useOptimizedMutation, useQuery } from '@/lib/hooks/useOptimizedQuery';
import { apiClient, campaignApi, creditApi } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle2, Target, ArrowRight, RotateCcw, Zap, Repeat } from 'lucide-react';

interface TitleSuggestion {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [generationType, setGenerationType] = useState<'single' | 'campaign'>(
    mode === 'campaign' ? 'campaign' : 'single'
  );
  
  const [description, setDescription] = useState('');
  const [titleCount, setTitleCount] = useState(3);
  const [generatedTitles, setGeneratedTitles] = useState<TitleSuggestion[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<TitleSuggestion | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  
  const [category, setCategory] = useState('technology');
  const [targetLength, setTargetLength] = useState(1500);
  const [sourceCount, setSourceCount] = useState(10);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  
  const [campaignName, setCampaignName] = useState('');
  const [articlesPerDay, setArticlesPerDay] = useState(2);
  const [postingTimes, setPostingTimes] = useState('09:00, 17:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalArticles, setTotalArticles] = useState<number | undefined>();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: async () => {
      const response = await creditApi.getBalance();
      return response.data;
    }
  });

  const generateTitlesMutation = useOptimizedMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/generate/titles', {
        description,
        count: titleCount
      });
      return response.data;
    },
    onSuccess: (data: TitleSuggestion[]) => {
      setGeneratedTitles(data);
      setCurrentStep(2);
    }
  });

  const verifyTitleMutation = useOptimizedMutation({
    mutationFn: async (titleId: string) => {
      const response = await apiClient.patch(`/titles/${titleId}/verify`, {
        title: editedTitle || selectedTitle?.title,
        status: 'approved'
      });
      return response.data;
    },
    onSuccess: () => {
      setCurrentStep(3);
    }
  });

  const createCampaignMutation = useOptimizedMutation({
    mutationFn: async () => {
      const times = postingTimes.split(',').map(t => t.trim());
      const response = await campaignApi.create({
        name: campaignName,
        topic: editedTitle || selectedTitle?.title,
        description: description,
        category: category,
        articles_per_day: articlesPerDay,
        posting_times: times,
        start_date: startDate,
        end_date: endDate || null,
        total_articles: totalArticles || null,
        target_length: targetLength,
        source_count: sourceCount,
      });
      return response.data;
    },
    onSuccess: () => {
      router.push('/dashboard/campaigns');
    }
  });

  const batchGenerateMutation = useOptimizedMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/generate/batch', {
        title_ids: [selectedTitle!.id],
        category,
        target_length: targetLength,
        source_count: sourceCount,
        scheduled_at: scheduledAt || null,
        timezone: 'UTC'
      });
      return response.data;
    },
    onSuccess: () => {
      router.push('/articles');
    }
  });

  const handleGenerateTitles = () => {
    if (!description.trim()) return;
    generateTitlesMutation.mutate();
  };

  const handleSelectTitle = (title: TitleSuggestion) => {
    setSelectedTitle(title);
    setEditedTitle(title.title);
  };

  const handleConfirmTitle = () => {
    if (!selectedTitle) return;
    verifyTitleMutation.mutate(selectedTitle.id);
  };

  const handleFinalGenerate = () => {
    if (generationType === 'campaign') {
      createCampaignMutation.mutate();
    } else {
      batchGenerateMutation.mutate();
    }
  };

  const resetWorkflow = () => {
    setDescription('');
    setGeneratedTitles([]);
    setSelectedTitle(null);
    setEditedTitle('');
    setCurrentStep(1);
  };

  const estimatedCredits = generationType === 'campaign' && startDate && endDate
    ? Math.ceil(
        ((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) * articlesPerDay
      )
    : 1;

  const steps = [
    { num: 1, label: 'GENERATE', icon: Sparkles, color: 'cyan' as const },
    { num: 2, label: 'CONFIRM', icon: CheckCircle2, color: 'magenta' as const },
    { num: 3, label: 'DEPLOY', icon: Target, color: 'amber' as const }
  ];
  
  const getStepColorClasses = (color: 'cyan' | 'magenta' | 'amber') => {
    const colorMap = {
      cyan: 'bg-[#00ff9f]/10 border-[#00ff9f]/40 text-[#00ff9f]',
      magenta: 'bg-[#ff0080]/10 border-[#ff0080]/40 text-[#ff0080]',
      amber: 'bg-[#ffb800]/10 border-[#ffb800]/40 text-[#ffb800]'
    };
    return colorMap[color];
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">
          NEW OPERATION
        </h1>
        <p className="text-gray-500 font-mono text-xs tracking-wider">
          INIT_SEQUENCE // STEP {currentStep}/3 // AI_GENERATION_PROTOCOL
        </p>
      </div>

      <div className="flex items-center gap-6">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-md border transition-all duration-300 relative overflow-hidden",
              currentStep === step.num
                ? getStepColorClasses(step.color)
                : currentStep > step.num
                ? 'bg-[#00ff9f]/5 border-[#00ff9f]/20 text-[#00ff9f]/60'
                : 'bg-black/40 border-white/5 text-gray-600'
            )}>
              <step.icon size={16} strokeWidth={2} />
              <span className="text-xs font-mono tracking-wider">{step.label}</span>
              {currentStep === step.num && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              )}
            </div>
            {idx < 2 && (
              <ArrowRight size={16} className="text-gray-700" />
            )}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <GlassCard className="p-8" glow="cyan" holographic>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-3 tracking-wider">
                TOPIC DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the content topic in detail..."
                className="w-full bg-black/40 border border-[var(--border-primary)] rounded-md px-4 py-4 text-sm text-white resize-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_20px_rgba(0,255,159,0.2)] outline-none font-sans transition-all duration-300"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <TechInput
                type="number"
                value={titleCount}
                onChange={(e) => setTitleCount(Number(e.target.value))}
                min={1}
                max={5}
                label="TITLE COUNT"
              />
            </div>

            <Button
              onClick={handleGenerateTitles}
              disabled={!description.trim() || generateTitlesMutation.isPending}
              isLoading={generateTitlesMutation.isPending}
              variant="primary"
              glow
              className="w-full"
            >
              <Sparkles size={16} />
              GENERATE TITLES
            </Button>
          </div>
        </GlassCard>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <GlassCard className="p-6" glow="magenta">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-mono text-white tracking-wider">SELECT TITLE</h2>
              <button
                onClick={resetWorkflow}
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-[var(--accent-cyan)] transition-colors"
              >
                <RotateCcw size={12} />
                REGENERATE
              </button>
            </div>

            <div className="space-y-3">
              {generatedTitles.map((title) => (
                <button
                  key={title.id}
                  onClick={() => handleSelectTitle(title)}
                  className={cn(
                    "w-full text-left p-5 rounded-md border transition-all duration-300",
                    selectedTitle?.id === title.id
                      ? 'bg-[var(--accent-magenta)]/10 border-[var(--accent-magenta)]/40 shadow-[0_0_20px_rgba(255,0,128,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  <p className="text-sm text-white font-medium">{title.title}</p>
                </button>
              ))}
            </div>
          </GlassCard>

          {selectedTitle && (
            <GlassCard className="p-6" glow="cyan">
              <TechInput
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                label="EDIT TITLE (OPTIONAL)"
                className="mb-6"
              />

              <Button
                onClick={handleConfirmTitle}
                disabled={verifyTitleMutation.isPending}
                isLoading={verifyTitleMutation.isPending}
                variant="primary"
                className="w-full"
              >
                <CheckCircle2 size={16} />
                CONFIRM TITLE
              </Button>
            </GlassCard>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <GlassCard className="p-6" glow="amber">
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-xs font-mono text-gray-400 mb-3 tracking-wider">SELECTED TITLE</h3>
              <p className="text-white font-medium text-lg">{editedTitle || selectedTitle?.title}</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-mono text-gray-400 mb-3 tracking-wider">
                GENERATION MODE
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGenerationType('single')}
                  className={cn(
                    "p-6 rounded-md border transition-all",
                    generationType === 'single'
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(0,255,159,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  )}
                >
                  <Zap size={24} className="mb-2 mx-auto text-cyan-400" />
                  <p className="font-mono text-sm text-white">SINGLE ARTICLE</p>
                  <p className="text-xs text-gray-500 mt-1">Generate once</p>
                </button>
                
                <button
                  onClick={() => setGenerationType('campaign')}
                  className={cn(
                    "p-6 rounded-md border transition-all",
                    generationType === 'campaign'
                      ? 'bg-magenta-500/10 border-magenta-500/40 shadow-[0_0_20px_rgba(255,0,128,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  )}
                >
                  <Repeat size={24} className="mb-2 mx-auto text-magenta-400" />
                  <p className="font-mono text-sm text-white">RECURRING CAMPAIGN</p>
                  <p className="text-xs text-gray-500 mt-1">Auto-generate daily</p>
                </button>
              </div>
            </div>

            {generationType === 'campaign' && (
              <div className="space-y-6 mb-6 p-6 rounded-lg bg-magenta-500/5 border border-magenta-500/20">
                <h3 className="text-sm font-mono text-magenta-400 uppercase tracking-wider">
                  CAMPAIGN CONFIGURATION
                </h3>
                
                <TechInput
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  label="CAMPAIGN NAME"
                  placeholder="e.g., Daily Tech Articles"
                />

                <div className="grid grid-cols-2 gap-4">
                  <TechInput
                    type="number"
                    value={articlesPerDay}
                    onChange={(e) => setArticlesPerDay(Number(e.target.value))}
                    label="ARTICLES PER DAY"
                    min={1}
                    max={10}
                  />
                  
                  <TechInput
                    type="text"
                    value={postingTimes}
                    onChange={(e) => setPostingTimes(e.target.value)}
                    label="POSTING TIMES"
                    placeholder="09:00, 17:00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TechInput
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    label="START DATE"
                  />
                  
                  <TechInput
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    label="END DATE (Optional)"
                  />
                </div>

                <TechInput
                  type="number"
                  value={totalArticles || ''}
                  onChange={(e) => setTotalArticles(e.target.value ? Number(e.target.value) : undefined)}
                  label="TOTAL ARTICLES (Optional)"
                  placeholder="Leave empty for unlimited"
                />

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <p className="text-xs font-mono text-amber-400 mb-2">
                    ESTIMATED CREDITS: {estimatedCredits}
                  </p>
                  <p className="text-xs text-gray-500">
                    Your balance: {balance?.credits || 0} credits
                  </p>
                  {balance && balance.credits < estimatedCredits && (
                    <p className="text-xs text-red-400 mt-2">⚠️ Insufficient credits</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-3 tracking-wider">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-primary)] rounded-md px-4 py-3 text-sm text-white focus:border-[var(--accent-amber)] outline-none transition-all"
                >
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="science">Science</option>
                  <option value="health">Health</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <TechInput
                type="number"
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                label="TARGET LENGTH"
              />

              <TechInput
                type="number"
                value={sourceCount}
                onChange={(e) => setSourceCount(Number(e.target.value))}
                label="SOURCE COUNT"
              />

              {generationType === 'single' && (
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-3 tracking-wider">
                    SCHEDULE (OPTIONAL)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-primary)] rounded-md px-4 py-3 text-sm text-white focus:border-[var(--accent-amber)] outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </GlassCard>

          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentStep(2)}
              variant="secondary"
              className="flex-1"
            >
              BACK
            </Button>
            <Button
              onClick={handleFinalGenerate}
              disabled={
                (generationType === 'campaign' 
                  ? !campaignName || !startDate || createCampaignMutation.isPending || (balance && balance.credits < estimatedCredits)
                  : batchGenerateMutation.isPending
                )
              }
              isLoading={generationType === 'campaign' ? createCampaignMutation.isPending : batchGenerateMutation.isPending}
              variant="primary"
              glow
              className="flex-[2]"
            >
              <Target size={16} />
              {generationType === 'campaign' ? 'LAUNCH CAMPAIGN' : scheduledAt ? 'SCHEDULE' : 'DEPLOY NOW'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
