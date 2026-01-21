'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { GlassCard } from '@/components/ui/glass-card';
import { TechInput } from '@/components/ui/tech-input';
import { ScanlineButton } from '@/components/ui/scanline-button';
import { ChevronRight, Settings, FileText, Calendar, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'QUERY_INPUT', icon: FileText },
  { id: 2, label: 'PARAMETERS', icon: Settings },
  { id: 3, label: 'SCHEDULING', icon: Calendar },
];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Tech'); // Default
  const [targetLength, setTargetLength] = useState(1500);
  const [sourceCount, setSourceCount] = useState(5);
  
  // Mutation to call the Backend API
  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      // Mapping to your Backend Schema (ArticleCreateRequest)
      const payload = {
        username: user?.username || "anonymous_agent", // Required by your backend schema
        query_explanation: topic,
        category: category,
        target_length: Number(targetLength),
        source_count: Number(sourceCount),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      return await apiClient.post('/generate', payload);
    },
    onSuccess: () => {
      // Redirect to Command Center on success
      router.push('/dashboard');
    }
  });

  return (
    <div className="max-w-3xl mx-auto py-10 animate-fade-in-up pb-20">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500
              ${currentStep >= step.id 
                ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'border-gray-800 text-gray-600'}
            `}>
              <step.icon size={18} />
            </div>
            <span className={`text-xs font-mono tracking-widest ${currentStep >= step.id ? 'text-white' : 'text-gray-700'}`}>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className="w-12 h-[1px] bg-gray-800 mx-4" />
            )}
          </div>
        ))}
      </div>

      <GlassCard className="min-h-[500px] flex flex-col relative overflow-hidden">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm font-mono">{(error as any)?.response?.data?.detail || "INITIATION_FAILED"}</span>
          </div>
        )}

        {/* Step 1: Input */}
        {currentStep === 1 && (
          <div className="flex-1 space-y-6 animate-fade-in-up">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-xl text-white font-bold">Research Objective</h2>
              <p className="text-sm text-gray-500">Define the core topic for the AI agent.</p>
            </div>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-48 bg-[#050505] border border-gray-800 p-4 text-gray-300 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none rounded-lg"
              placeholder="// Enter your detailed topic or raw content request here..."
              autoFocus
            />
            <div className="text-xs text-gray-500 font-mono text-right">
              CHARS: {topic.length}
            </div>
          </div>
        )}

        {/* Step 2: Settings */}
        {currentStep === 2 && (
          <div className="flex-1 space-y-8 animate-fade-in-up">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-xl text-white font-bold">Configuration Matrix</h2>
              <p className="text-sm text-gray-500">Adjust the output parameters.</p>
            </div>
            
            <div className="space-y-8 px-2">
               {/* Length Slider */}
               <div>
                 <div className="flex justify-between mb-4">
                    <label className="text-xs font-mono text-blue-400">TARGET_WORD_COUNT</label>
                    <span className="text-xs font-mono text-white bg-blue-500/20 px-2 py-0.5 rounded">{targetLength}</span>
                 </div>
                 <input 
                    type="range" 
                    min="500" 
                    max="3000" 
                    step="100"
                    value={targetLength}
                    onChange={(e) => setTargetLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                 />
                 <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
                    <span>500 (Brief)</span>
                    <span>3000 (Deep Dive)</span>
                 </div>
               </div>

               {/* Inputs Grid */}
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="text-xs font-mono text-gray-500 block mb-2">CATEGORY</label>
                   <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#050505] border border-gray-800 p-3 text-sm text-white font-mono focus:border-blue-500 rounded outline-none"
                   >
                     <option value="Tech">Tech & Engineering</option>
                     <option value="Health">Health & Wellness</option>
                     <option value="Business">Business & Finance</option>
                     <option value="Lifestyle">Lifestyle</option>
                     <option value="Science">Science</option>
                   </select>
                 </div>
                 
                 <div>
                    <label className="text-xs font-mono text-gray-500 block mb-2">SOURCE_DEPTH</label>
                    <select 
                      value={sourceCount}
                      onChange={(e) => setSourceCount(Number(e.target.value))}
                      className="w-full bg-[#050505] border border-gray-800 p-3 text-sm text-white font-mono focus:border-blue-500 rounded outline-none"
                   >
                     <option value="3">3 Sources (Fast)</option>
                     <option value="5">5 Sources (Balanced)</option>
                     <option value="10">10 Sources (Deep)</option>
                   </select>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule (Visual Only for now) */}
        {currentStep === 3 && (
          <div className="flex-1 space-y-6 animate-fade-in-up">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-xl text-white font-bold">Deployment Vector</h2>
              <p className="text-sm text-gray-500">Confirm execution parameters.</p>
            </div>
            
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded flex items-center gap-4">
               <input type="checkbox" checked readOnly className="w-5 h-5 accent-blue-500 bg-transparent border-gray-600 rounded" />
               <div>
                 <p className="text-white text-sm font-bold">Execute Immediately</p>
                 <p className="text-xs text-blue-400/70 font-mono">WORKER_ID: AUTO_ASSIGN</p>
               </div>
            </div>

            <div className="mt-8 space-y-2 font-mono text-xs text-gray-500">
               <p>SUMMARY:</p>
               <div className="p-4 bg-black/40 rounded border border-white/5 space-y-1">
                 <div className="flex justify-between"><span>TOPIC:</span> <span className="text-white">{topic.slice(0, 30)}...</span></div>
                 <div className="flex justify-between"><span>LENGTH:</span> <span className="text-white">{targetLength}</span></div>
                 <div className="flex justify-between"><span>SOURCES:</span> <span className="text-white">{sourceCount}</span></div>
               </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between pt-6 border-t border-gray-800/50">
          <button 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isPending}
            className="px-6 py-2 text-xs font-mono text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            [ BACK ]
          </button>

          <div className="w-48">
            {currentStep < 3 ? (
               <ScanlineButton 
                 onClick={() => {
                   if (currentStep === 1 && !topic) return; // Block empty topic
                   setCurrentStep(currentStep + 1);
                 }}
                 disabled={currentStep === 1 && !topic}
               >
                  NEXT_PHASE <ChevronRight size={14} />
               </ScanlineButton>
            ) : (
               <ScanlineButton 
                  onClick={() => mutate()}
                  isLoading={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
               >
                  INITIATE_AGENT
               </ScanlineButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}