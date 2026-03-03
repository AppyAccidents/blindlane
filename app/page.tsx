// ============================================
// Main Page - Home
// This is what users see when they visit /
// 
// Features:
// - Prompt input
// - Side-by-side comparison display
// - Voting buttons
// - Reveal after voting
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { Send, Loader2, Trophy, Sparkles, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { cn, validatePrompt, formatCost } from '@/lib/utils';
import { Comparison, VoteResult } from '@/types';

export default function HomePage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Input state
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comparison state
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [responses, setResponses] = useState({
    A: '',
    B: '',
  });
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Voting state
  const [hasVoted, setHasVoted] = useState(false);
  const [vote, setVote] = useState<VoteResult | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  // Rate limit info
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    current: number;
    limit: number;
    remaining: number;
  } | null>(null);

  // ==========================================
  // HANDLERS
  // ==========================================
  
  /**
   * Handle form submission
   * Called when user clicks "Compare" button
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate prompt
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
      // Call our API
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
      
      // Store rate limit info
      setRateLimitInfo(data.rateLimitInfo);
      
      // Store the comparison (without model identities)
      setComparison(data.comparison);
      
      // Start streaming effect
      setIsStreaming(true);
      await streamResponses(data.comparison.response_a, data.comparison.response_b);
      
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setIsStreaming(false);
    }
  }, [prompt]);
  
  /**
   * Simulates a streaming effect for better UX
   * In a real streaming implementation, this would show text as it arrives
   */
  const streamResponses = async (responseA: string, responseB: string) => {
    // Simple animation: show responses character by character
    const charsPerFrame = 5;
    const delay = 5; // ms
    
    let indexA = 0;
    let indexB = 0;
    
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
    
    // Ensure full text is shown
    setResponses({ A: responseA, B: responseB });
  };
  
  /**
   * Handle voting
   * Called when user clicks "A is better", "B is better", or "Tie"
   */
  const handleVote = useCallback(async (voteChoice: VoteResult) => {
    if (!comparison || hasVoted) return;
    
    setIsVoting(true);
    
    try {
      const response = await fetch('/api/comparison/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparisonId: comparison.id,
          vote: voteChoice,
        }),
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
      setError('Failed to submit vote. Please try again.');
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  }, [comparison, hasVoted]);
  
  /**
   * Reset everything to start over
   */
  const handleReset = () => {
    setPrompt('');
    setComparison(null);
    setResponses({ A: '', B: '' });
    setHasVoted(false);
    setVote(null);
    setIsRevealed(false);
    setError(null);
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          The{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pepsi Challenge
          </span>{' '}
          for AI
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Enter a prompt. Two AI models respond anonymously. Vote for the better one.
          
          <span className="mt-2 block text-sm text-slate-500">
            Currently comparing: GPT-4o Mini vs Claude 3.5 Haiku
          </span>
        </p>
      </div>
      
      {/* Prompt Input Form */}
      {!comparison && (
        <form onSubmit={handleSubmit} className="mb-8 animate-fade-in">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... (e.g., 'Explain quantum computing like I'm 5')"
              className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white p-4 pr-14 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
              {prompt.length}/1000
            </div>
          </div>
          
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}
          
          {rateLimitInfo && rateLimitInfo.remaining === 0 && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              You've reached your daily limit of {rateLimitInfo.limit} comparisons.
              Come back tomorrow!
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {rateLimitInfo && (
                <span>
                  {rateLimitInfo.remaining} of {rateLimitInfo.limit} comparisons remaining today
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all',
                isSubmitting || !prompt.trim()
                  ? 'cursor-not-allowed bg-slate-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Compare
                </>
              )}
            </button>
          </div>
        </form>
      )}
      
      {/* Comparison Results */}
      {comparison && (
        <div className="animate-fade-in space-y-6">
          {/* Prompt display */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500">Your prompt:</p>
            <p className="mt-1 text-slate-900 dark:text-white">{comparison.prompt_text}</p>
          </div>
          
          {/* Side-by-side responses */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Model A */}
            <div className={cn(
              'relative rounded-xl border-2 bg-white p-6 shadow-sm transition-all dark:bg-slate-900',
              hasVoted && vote === 'A' 
                ? 'border-green-500 ring-2 ring-green-500/20' 
                : 'border-slate-200 dark:border-slate-800'
            )}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Model A</p>
                    {!isRevealed && (
                      <p className="text-xs text-slate-500">Identity hidden</p>
                    )}
                  </div>
                </div>
                {hasVoted && vote === 'A' && (
                  <Trophy className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {responses.A}
                  {isStreaming && responses.A.length < comparison.response_a.length && (
                    <span className="typing-cursor" />
                  )}
                </div>
              </div>
              
              {/* Revealed info */}
              {isRevealed && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {comparison.model_a === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'Claude 3.5 Haiku'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Cost: {formatCost(comparison.cost_a_usd)} • {comparison.tokens_input_a + comparison.tokens_output_a} tokens
                  </p>
                </div>
              )}
            </div>
            
            {/* Model B */}
            <div className={cn(
              'relative rounded-xl border-2 bg-white p-6 shadow-sm transition-all dark:bg-slate-900',
              hasVoted && vote === 'B' 
                ? 'border-green-500 ring-2 ring-green-500/20' 
                : 'border-slate-200 dark:border-slate-800'
            )}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                    B
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Model B</p>
                    {!isRevealed && (
                      <p className="text-xs text-slate-500">Identity hidden</p>
                    )}
                  </div>
                </div>
                {hasVoted && vote === 'B' && (
                  <Trophy className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {responses.B}
                  {isStreaming && responses.B.length < comparison.response_b.length && (
                    <span className="typing-cursor" />
                  )}
                </div>
              </div>
              
              {/* Revealed info */}
              {isRevealed && (
                <div className="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {comparison.model_b === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'Claude 3.5 Haiku'}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Cost: {formatCost(comparison.cost_b_usd)} • {comparison.tokens_input_b + comparison.tokens_output_b} tokens
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Total cost */}
          {isRevealed && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total cost for this comparison:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCost(comparison.total_cost_usd)}
                </span>
              </p>
            </div>
          )}
          
          {/* Voting buttons */}
          {!hasVoted ? (
            <div className="space-y-4">
              <p className="text-center font-medium text-slate-700 dark:text-slate-300">
                Which response is better?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleVote('A')}
                  disabled={isVoting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  A is better
                </button>
                <button
                  onClick={() => handleVote('B')}
                  disabled={isVoting}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  B is better
                </button>
                <button
                  onClick={() => handleVote('TIE')}
                  disabled={isVoting}
                  className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  It's a tie
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Thanks for voting!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {vote === 'TIE' 
                    ? "You thought both models were equally good."
                    : `You preferred Model ${vote}.`
                  }
                </p>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Compare again
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Tips section (shown when no comparison) */}
      {!comparison && (
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <EyeOff className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Blind Testing</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Models are randomly assigned to A or B. You won't know which is which until you vote.
            </p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Vote & Reveal</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pick your winner, then see which model you chose. Check the leaderboard to see which AI is winning overall.
            </p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Try Anything</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Creative writing, coding, analysis, or casual chat. Different models excel at different tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
