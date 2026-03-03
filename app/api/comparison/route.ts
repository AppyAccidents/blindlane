// ============================================
// API Route: Create Comparison
// POST /api/comparison
// 
// This is the heart of BlindLane!
// It takes a prompt, calls both LLMs in parallel,
// randomizes which is A/B, and saves to database
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { 
  createComparison, 
  checkRateLimit, 
  incrementRateLimit,
  getDailyCost 
} from '@/lib/supabase';
import { 
  validatePrompt, 
  randomizeModels, 
  calculateCost,
  getClientIp,
  estimateTokenCount,
} from '@/lib/utils';
import { ModelType } from '@/types';

// Initialize API clients
// These use your API keys from .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Cost control constants
const DAILY_BUDGET_LIMIT = parseFloat(process.env.DAILY_BUDGET_LIMIT || '10');
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT_SECONDS || '15') * 1000; // Convert to ms
const MAX_PROMPT_LENGTH = parseInt(process.env.MAX_PROMPT_LENGTH || '1000');

/**
 * Main handler for POST requests
 * This is called when user clicks "Compare"
 */
export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // STEP 1: Get and validate the prompt
    // ==========================================
    const body = await request.json();
    const { prompt } = body;
    
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const trimmedPrompt = prompt.trim();
    
    // ==========================================
    // STEP 2: Check rate limits
    // ==========================================
    const ipAddress = getClientIp(request);
    const rateLimit = await checkRateLimit(ipAddress);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Rate limit exceeded. You can make ${rateLimit.limit} comparisons per day. Try again tomorrow!`,
          rateLimitInfo: rateLimit,
        },
        { status: 429 }
      );
    }
    
    // ==========================================
    // STEP 3: Check daily budget
    // ==========================================
    const dailyCost = await getDailyCost();
    if (dailyCost >= DAILY_BUDGET_LIMIT) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Daily budget exceeded. Please try again tomorrow.' 
        },
        { status: 503 }
      );
    }
    
    // ==========================================
    // STEP 4: Randomize which model is A and B
    // This is the "blind" part!
    // ==========================================
    const [modelA, modelB] = randomizeModels();
    
    // ==========================================
    // STEP 5: Call both APIs in parallel
    // 
    // Promise.all means we call both at the same time,
    // not one after another. This is faster!
    // ==========================================
    const [resultA, resultB] = await Promise.all([
      callModel(modelA, trimmedPrompt),
      callModel(modelB, trimmedPrompt),
    ]);
    
    // ==========================================
    // STEP 6: Increment rate limit counter
    // ==========================================
    await incrementRateLimit(ipAddress);
    
    // ==========================================
    // STEP 7: Calculate costs
    // ==========================================
    const costA = calculateCost(modelA, resultA.inputTokens, resultA.outputTokens);
    const costB = calculateCost(modelB, resultB.inputTokens, resultB.outputTokens);
    
    // ==========================================
    // STEP 8: Save to database
    // ==========================================
    const comparison = await createComparison({
      prompt_text: trimmedPrompt,
      prompt_length: trimmedPrompt.length,
      model_a: modelA,
      model_b: modelB,
      response_a: resultA.response,
      response_b: resultB.response,
      tokens_input_a: resultA.inputTokens,
      tokens_output_a: resultA.outputTokens,
      tokens_input_b: resultB.inputTokens,
      tokens_output_b: resultB.outputTokens,
      cost_a_usd: costA,
      cost_b_usd: costB,
      total_cost_usd: costA + costB,
      winner: null,
      user_id: null, // We'll add auth later
      ip_address: ipAddress,
      user_agent: request.headers.get('user-agent') || null,
    });
    
    if (!comparison) {
      return NextResponse.json(
        { success: false, error: 'Failed to save comparison' },
        { status: 500 }
      );
    }
    
    // ==========================================
    // STEP 9: Return response to frontend
    // Note: We DON'T tell the frontend which model is which!
    // The frontend only knows "A" and "B"
    // ==========================================
    return NextResponse.json({
      success: true,
      comparison: {
        id: comparison.id,
        prompt_text: comparison.prompt_text,
        response_a: comparison.response_a,
        response_b: comparison.response_b,
        // Don't include model_a/model_b here!
        // That's revealed only after voting
      },
      rateLimitInfo: {
        current: rateLimit.current + 1,
        limit: rateLimit.limit,
        remaining: Math.max(0, rateLimit.limit - rateLimit.current - 1),
      },
    });
    
  } catch (error) {
    console.error('Error in comparison API:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Calls an LLM API based on the model type
 * 
 * @param model - Which model to call
 * @param prompt - The user's prompt
 * @returns Response text and token usage
 */
async function callModel(
  model: ModelType,
  prompt: string
): Promise<{
  response: string;
  inputTokens: number;
  outputTokens: number;
}> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    if (model === 'gpt-4o-mini') {
      // ==========================================
      // Call OpenAI GPT-4o Mini
      // ==========================================
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000, // Limit response length to control costs
        temperature: 0.7, // Slight creativity but mostly deterministic
      }, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      return {
        response: response.choices[0]?.message?.content || 'No response',
        inputTokens: response.usage?.prompt_tokens || estimateTokenCount(prompt),
        outputTokens: response.usage?.completion_tokens || estimateTokenCount(
          response.choices[0]?.message?.content || ''
        ),
      };
      
    } else {
      // ==========================================
      // Call Anthropic Claude 3.5 Haiku
      // ==========================================
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Extract text content from Anthropic response
      const content = response.content
        .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
        .map(block => block.text)
        .join('');
      
      return {
        response: content || 'No response',
        inputTokens: response.usage?.input_tokens || estimateTokenCount(prompt),
        outputTokens: response.usage?.output_tokens || estimateTokenCount(content),
      };
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Check if it's a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        response: '⏱️ Request timed out (15s limit)',
        inputTokens: estimateTokenCount(prompt),
        outputTokens: 0,
      };
    }
    
    // Other errors
    console.error(`Error calling ${model}:`, error);
    return {
      response: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      inputTokens: estimateTokenCount(prompt),
      outputTokens: 0,
    };
  }
}
