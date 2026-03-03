// ============================================
// Main Page - Terminal Theme
// Cyberpunk LLM Comparison Interface
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { validatePrompt, formatCost } from '@/lib/utils';
import { Comparison, VoteResult } from '@/types';

export default function HomePage() {
  // State
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [responses, setResponses] = useState({ A: '', B: '' });
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [vote, setVote] = useState<VoteResult | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{current: number; limit: number; remaining: number} | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid prompt');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setComparison(null);
    setResponses({ A: '', B: '' });
    setHasVoted(false);
    setVote(null);
    setIsRevealed(false);

    try {
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Something went wrong');
        setRateLimitInfo(data.rateLimitInfo || null);
        return;
      }

      setRateLimitInfo(data.rateLimitInfo);
      setComparison(data.comparison);
      setIsStreaming(true);
      await streamResponses(data.comparison.response_a, data.comparison.response_b);
    } catch (err) {
      setError('Failed to connect to the server');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setIsStreaming(false);
    }
  }, [prompt]);

  const streamResponses = async (responseA: string, responseB: string) => {
    const charsPerFrame = 8;
    const delay = 3;
    let indexA = 0, indexB = 0;
    const maxLength = Math.max(responseA.length, responseB.length);

    for (let i = 0; i < maxLength; i += charsPerFrame) {
      indexA = Math.min(indexA + charsPerFrame, responseA.length);
      indexB = Math.min(indexB + charsPerFrame, responseB.length);
      setResponses({
        A: responseA.slice(0, indexA),
        B: responseB.slice(0, indexB),
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setResponses({ A: responseA, B: responseB });
  };

  const handleVote = useCallback(async (voteChoice: VoteResult) => {
    if (!comparison || hasVoted) return;
    setIsVoting(true);

    try {
      const response = await fetch('/api/comparison/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonId: comparison.id, vote: voteChoice }),
      });
      const data = await response.json();

      if (data.success) {
        setVote(voteChoice);
        setHasVoted(true);
        setIsRevealed(true);
        setComparison(data.comparison);
      } else {
        setError(data.error || 'Failed to record vote');
      }
    } catch (err) {
      setError('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  }, [comparison, hasVoted]);

  const handleReset = () => {
    setPrompt('');
    setComparison(null);
    setResponses({ A: '', B: '' });
    setHasVoted(false);
    setVote(null);
    setIsRevealed(false);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          SYSTEM_READY
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-cyan-400 glow-cyan">&gt;</span>
          <span className="text-white"> Blind Comparison</span>
          <span className="text-orange-500 glow-orange">_</span>
        </h1>
        <p className="text-cyan-600 max-w-2xl mx-auto font-light">
          Enter a prompt. Two neural networks process simultaneously. 
          Vote for the superior output. Identity revealed post-vote.
        </p>
      </div>

      {/* Rate Limit Status */}
      {rateLimitInfo && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-lg border border-cyan-500/20 bg-black/50 text-xs">
            <span className="text-cyan-600">QUOTA_REMAINING:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-cyan-900/50 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 transition-all"
                  style={{ width: `${(rateLimitInfo.remaining / rateLimitInfo.limit) * 100}%` }}
                />
              </div>
              <span className="text-cyan-400 font-mono">
                {rateLimitInfo.remaining}/{rateLimitInfo.limit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      {!comparison && (
        <div className="terminal-panel scanlines animate-slide-up">
          <div className="terminal-header mb-4">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
            <span className="ml-2 text-xs text-cyan-600 font-mono">input_prompt.txt</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute top-4 left-4 text-cyan-600 font-mono text-sm">$</div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your query... (e.g., 'Explain quantum superposition in 3 sentences')"
                className="terminal-input pl-8 min-h-[140px] resize-y"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-3 right-3 text-xs text-cyan-700 font-mono">
                {prompt.length}/1000
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
                <span className="text-red-500">[ERROR]</span> {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-cyan-700 font-mono">
                <span className="text-orange-500">MODELS:</span> GPT-4o-Mini vs Claude-3.5-Haiku
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !prompt.trim()}
                className="btn-cyber disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">PROCESSING</span>
                    <span className="ml-2">⋯</span>
                  </>
                ) : (
                  <>
                    EXECUTE_COMPARISON
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-fade-in">
          {/* Prompt Display */}
          <div className="terminal-panel">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-cyan-600 font-mono text-xs">$ cat prompt.txt</span>
            </div>
            <p className="text-cyan-100 font-mono text-sm pl-4 border-l-2 border-cyan-500/30">
              {comparison.prompt_text}
            </p>
          </div>

          {/* Model Responses Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Model A */}
            <ModelCard
              label="A"
              color="cyan"
              response={responses.A}
              fullResponse={comparison.response_a}
              isStreaming={isStreaming}
              isWinner={hasVoted && vote === 'A'}
              isRevealed={isRevealed}
              modelName={comparison.model_a}
              cost={comparison.cost_a_usd}
              tokens={comparison.tokens_input_a + comparison.tokens_output_a}
            />

            {/* Model B */}
            <ModelCard
              label="B"
              color="orange"
              response={responses.B}
              fullResponse={comparison.response_b}
              isStreaming={isStreaming}
              isWinner={hasVoted && vote === 'B'}
              isRevealed={isRevealed}
              modelName={comparison.model_b}
              cost={comparison.cost_b_usd}
              tokens={comparison.tokens_input_b + comparison.tokens_output_b}
            />
          </div>

          {/* Total Cost */}
          {isRevealed && (
            <div className="terminal-panel border-glow-cyan">
              <div className="flex items-center justify-between">
                <span className="text-cyan-600 font-mono text-xs">$ total_cost --summary</span>
                <span className="text-cyan-400 font-mono">
                  {formatCost(comparison.total_cost_usd)}
                </span>
              </div>
            </div>
          )}

          {/* Voting Section */}
          {!hasVoted ? (
            <div className="terminal-panel scanlines">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-cyan-400 font-mono text-sm">
                    &gt; AWAITING_USER_VERDICT_
                  </p>
                  <p className="text-cyan-600 text-xs">
                    Select the superior response. Identity will be revealed post-vote.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <VoteButton
                    label="A"
                    color="cyan"
                    onClick={() => handleVote('A')}
                    disabled={isVoting}
                  />
                  <VoteButton
                    label="B"
                    color="orange"
                    onClick={() => handleVote('B')}
                    disabled={isVoting}
                  />
                  <button
                    onClick={() => handleVote('TIE')}
                    disabled={isVoting}
                    className="btn-cyber border-cyan-500/30 text-cyan-500 hover:text-cyan-400"
                  >
                    TIE / NO_CLEAR_WINNER
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="terminal-panel border-glow-cyan">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 font-mono text-sm">
                    VERDICT_RECORDED
                  </span>
                </div>
                
                <p className="text-cyan-600 font-mono text-sm">
                  {vote === 'TIE' 
                    ? '>> Both models rated equally.'
                    : `>> Model ${vote} selected as superior.`
                  }
                </p>
                
                <button
                  onClick={handleReset}
                  className="btn-cyber"
                >
                  <span>NEW_COMPARISON</span>
                  <span className="ml-2">↻</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      {!comparison && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoCard 
            icon="◈" 
            title="Randomized" 
            desc="Models assigned A/B randomly. True blind testing."
          />
          <InfoCard 
            icon="◉" 
            title="Transparent" 
            desc="See exact API costs. No hidden fees."
          />
          <InfoCard 
            icon="◇" 
            title="Anonymous" 
            desc="No account required. IP-based rate limiting only."
          />
        </div>
      )}
    </div>
  );
}

// Model Card Component
function ModelCard({
  label,
  color,
  response,
  fullResponse,
  isStreaming,
  isWinner,
  isRevealed,
  modelName,
  cost,
  tokens,
}: {
  label: string;
  color: 'cyan' | 'orange';
  response: string;
  fullResponse: string;
  isStreaming: boolean;
  isWinner: boolean;
  isRevealed: boolean;
  modelName: string;
  cost: number;
  tokens: number;
}) {
  const isCyan = color === 'cyan';
  const borderColor = isCyan ? 'border-cyan-500/30' : 'border-orange-500/30';
  const glowColor = isCyan ? 'border-glow-cyan' : 'border-glow-orange';
  const textColor = isCyan ? 'text-cyan-400' : 'text-orange-400';
  const bgGlow = isCyan ? 'shadow-[0_0_30px_rgba(0,255,255,0.1)]' : 'shadow-[0_0_30px_rgba(255,107,53,0.1)]';
  
  return (
    <div className={`terminal-panel ${isWinner ? glowColor : ''} ${bgGlow}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded border ${borderColor} ${isCyan ? 'bg-cyan-500/10' : 'bg-orange-500/10'}`}>
            <span className={`font-bold ${textColor} text-lg`}>{label}</span>
          </div>
          <div>
            <p className={`font-mono font-semibold ${textColor}`}>MODEL_{label}</p>
            {!isRevealed && (
              <p className="text-xs text-cyan-700 font-mono">[ENCRYPTED]</p>
            )}
          </div>
        </div>
        {isWinner && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="text-green-500">★</span>
            <span className="text-green-400 text-xs font-mono">SELECTED</span>
          </div>
        )}
      </div>
      
      {/* Response */}
      <div className="code-block min-h-[200px] max-h-[400px] overflow-y-auto">
        <div className="whitespace-pre-wrap text-cyan-100/90 text-sm leading-relaxed">
          {response || <span className="text-cyan-700 italic">// Awaiting response...</span>}
          {isStreaming && response.length < fullResponse.length && (
            <span className="typing-cursor" />
          )}
        </div>
      </div>
      
      {/* Revealed Info */}
      {isRevealed && (
        <div className={`mt-4 p-3 rounded border ${borderColor} ${isCyan ? 'bg-cyan-500/5' : 'bg-orange-500/5'}`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={textColor}>
              {modelName === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'Claude 3.5 Haiku'}
            </span>
            <span className="text-cyan-600">
              {formatCost(cost)} • {tokens} TOKENS
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Vote Button Component
function VoteButton({
  label,
  color,
  onClick,
  disabled,
}: {
  label: string;
  color: 'cyan' | 'orange';
  onClick: () => void;
  disabled: boolean;
}) {
  const isCyan = color === 'cyan';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-cyber ${isCyan ? '' : 'btn-cyber-orange'} text-lg px-8`}
    >
      {disabled ? (
        <span className="animate-pulse">PROCESSING</span>
      ) : (
        <>
          <span>{label}</span>
          <span className="ml-2 text-sm opacity-70">IS_SUPERIOR</span>
        </>
      )}
    </button>
  );
}

// Info Card Component
function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="terminal-panel text-center p-6">
      <div className="text-2xl text-cyan-500 mb-3">{icon}</div>
      <h3 className="text-cyan-400 font-mono font-semibold mb-2">{title}</h3>
      <p className="text-cyan-700 text-sm">{desc}</p>
    </div>
  );
}
