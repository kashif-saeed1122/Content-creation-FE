import { useEffect, useState } from 'react';

export function ContentGeneratorAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number, x: number, y: number, icon: string, delay: number}>>([]);

  const steps = [
    {
      icon: '🎭',
      text: 'Analyzing topic...',
      duration: 2000,
      color: 'from-orange-400 to-red-500',
      emoji: '🎭'
    },
    {
      icon: '🔮',
      text: 'Researching sources...',
      duration: 2500,
      color: 'from-purple-400 to-pink-500',
      emoji: '🔮'
    },
    {
      icon: '✨',
      text: 'Writing content...',
      duration: 3000,
      color: 'from-blue-400 to-cyan-500',
      emoji: '✨'
    },
    {
      icon: '🚀',
      text: 'Optimizing for SEO...',
      duration: 2000,
      color: 'from-green-400 to-emerald-500',
      emoji: '🚀'
    },
    {
      icon: '🏆',
      text: 'Content ready!',
      duration: 1500,
      color: 'from-yellow-400 to-orange-500',
      emoji: '🏆'
    },
  ];

  const sampleTexts = [
    'Welcome to the future of content creation...',
    'AI-powered articles that engage your audience...',
    'Professional content that drives results...',
    'Automated research and writing at scale...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStep === 2) { // Writing content step
      setIsTyping(true);
      const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setGeneratedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setIsTyping(false), 1000);
        }
      }, 80);

      return () => clearInterval(typeInterval);
    } else {
      setGeneratedText('');
      setIsTyping(false);
    }
  }, [currentStep]);

  useEffect(() => {
    // Generate floating icons
    const icons = ['💎', '🎨', '⚡', '🌟', '🎯', '🔥', '💫', '🎪'];
    const newIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[i],
      delay: Math.random() * 3
    }));
    setFloatingIcons(newIcons);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Enhanced Background Glow */}
      <div className={`absolute inset-0 rounded-3xl blur-2xl animate-pulse bg-gradient-to-r ${steps[currentStep].color} opacity-20`}></div>

      {/* Floating Background Icons */}
      {floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute text-2xl animate-float opacity-30"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animationDelay: `${icon.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          {icon.icon}
        </div>
      ))}

      {/* Main Animation Container */}
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Creative Character - Instead of generic robot */}
        <div className="relative mb-8">
          {/* Main Character - Creative Brain */}
          <div className={`relative mx-auto w-28 h-28 bg-gradient-to-br ${steps[currentStep].color} rounded-full shadow-2xl animate-pulse`}>
            {/* Brain Folds */}
            <div className="absolute inset-2 rounded-full bg-white/20">
              <div className="absolute top-2 left-1/4 w-2 h-4 bg-white/40 rounded-full transform -rotate-12"></div>
              <div className="absolute top-3 right-1/3 w-3 h-3 bg-white/40 rounded-full transform rotate-12"></div>
              <div className="absolute bottom-3 left-1/3 w-2 h-3 bg-white/40 rounded-full transform rotate-6"></div>
            </div>

            {/* Animated Eyes */}
            <div className="absolute top-6 left-4 w-3 h-3 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-6 right-4 w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>

            {/* Creative Spark */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-lg animate-bounce">
              {steps[currentStep].emoji}
            </div>
          </div>

          {/* Unique Floating Elements */}
          <div className="absolute -top-6 -right-2 animate-spin-slow">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-sm shadow-lg">
              🎨
            </div>
          </div>
          <div className="absolute -bottom-4 -left-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs shadow-lg">
              ⚡
            </div>
          </div>
          <div className="absolute top-1/2 -right-6 animate-pulse">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-xs shadow-lg">
              ⭐
            </div>
          </div>
        </div>

        {/* Enhanced Content Generation Display */}
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Status Display */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`text-3xl animate-bounce bg-gradient-to-r ${steps[currentStep].color} bg-clip-text text-transparent font-bold`}>
              {steps[currentStep].icon}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white mb-1">{steps[currentStep].text}</div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 bg-gradient-to-r ${steps[currentStep].color} rounded-full transition-all duration-700 ease-out`}
                  style={{
                    width: currentStep === 2 && isTyping
                      ? `${(generatedText.length / 50) * 100}%`
                      : `${((Date.now() / 1000) % 2) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Generated Content Preview */}
          {isTyping && (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="text-sm text-white font-mono leading-relaxed">
                {generatedText}
                <span className="animate-pulse text-blue-400">|</span>
              </div>
            </div>
          )}

          {/* Animated Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 400">
            <defs>
              <linearGradient id="enhancedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="50%" stopColor="rgba(147, 51, 234, 0.4)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
              </linearGradient>
            </defs>
            <path
              d="M50,150 Q120,120 200,150 Q250,180 280,200"
              stroke="url(#enhancedGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-pulse opacity-60"
              strokeDasharray="10,5"
            />
            <path
              d="M50,200 Q120,230 200,200 Q250,170 280,150"
              stroke="url(#enhancedGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse opacity-40"
              style={{ animationDelay: '0.5s' }}
              strokeDasharray="8,4"
            />
          </svg>
        </div>

        {/* Unique Floating Data Points */}
        <div className="absolute top-1/4 -right-12 animate-float delay-1000">
          <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-400/30 shadow-lg">
            <div className="text-xs text-purple-200 font-bold flex items-center gap-1">
              <span className="text-sm">💎</span> 1500 words
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 -left-12 animate-float delay-1500">
          <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-cyan-400/30 shadow-lg">
            <div className="text-xs text-cyan-200 font-bold flex items-center gap-1">
              <span className="text-sm">🎯</span> SEO optimized
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 -left-8 animate-float delay-2000">
          <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-orange-400/30 shadow-lg">
            <div className="text-xs text-orange-200 font-bold flex items-center gap-1">
              <span className="text-sm">⚡</span> Lightning fast
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
