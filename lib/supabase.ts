// ============================================
// Supabase Client Setup
// This connects our app to the Supabase database
// ============================================

import { createClient } from '@supabase/supabase-js';
import { Comparison, ModelStats } from '@/types';

// These are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Client-side Supabase client
 * Use this in React components and browser code
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client
 * Use this in API routes (has admin privileges)
 * This can bypass Row Level Security!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Creates a new comparison in the database
 * Called after we get both LLM responses
 */
export async function createComparison(
  comparisonData: Omit<Comparison, 'id' | 'created_at' | 'voted_at'>
): Promise<Comparison | null> {
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .insert([comparisonData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating comparison:', error);
    return null;
  }
  
  return data as Comparison;
}

/**
 * Gets a comparison by ID
 */
export async function getComparison(id: string): Promise<Comparison | null> {
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching comparison:', error);
    return null;
  }
  
  return data as Comparison;
}

/**
 * Records a vote for a comparison
 */
export async function recordVote(
  comparisonId: string,
  vote: 'A' | 'B' | 'TIE'
): Promise<Comparison | null> {
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .update({
      winner: vote,
      voted_at: new Date().toISOString(),
    })
    .eq('id', comparisonId)
    .select()
    .single();
  
  if (error) {
    console.error('Error recording vote:', error);
    return null;
  }
  
  return data as Comparison;
}

/**
 * Gets voting statistics (leaderboard)
 */
export async function getVoteStats(): Promise<ModelStats[]> {
  const { data, error } = await supabaseAdmin
    .from('vote_stats')
    .select('*');
  
  if (error) {
    console.error('Error fetching vote stats:', error);
    return [];
  }
  
  return data as ModelStats[];
}

/**
 * Checks if user has exceeded rate limit
 * Returns current count and whether they're allowed to proceed
 */
export async function checkRateLimit(ipAddress: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const limit = parseInt(process.env.RATE_LIMIT_PER_IP || '10');
  
  // Call the database function to get current count
  const { data, error } = await supabaseAdmin
    .rpc('get_rate_limit', { p_ip_address: ipAddress });
  
  if (error) {
    console.error('Error checking rate limit:', error);
    // If we can't check, allow the request (fail open for user experience)
    return { allowed: true, current: 0, limit, remaining: limit };
  }
  
  const current = data || 0;
  const remaining = Math.max(0, limit - current);
  
  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
}

/**
 * Increments the rate limit counter for an IP
 */
export async function incrementRateLimit(ipAddress: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .rpc('increment_rate_limit', { p_ip_address: ipAddress });
  
  if (error) {
    console.error('Error incrementing rate limit:', error);
    return 0;
  }
  
  return data || 0;
}

/**
 * Gets today's total cost
 * Used for budget control
 */
export async function getDailyCost(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabaseAdmin
    .from('daily_costs')
    .select('total_cost_usd')
    .eq('date', today)
    .single();
  
  if (error || !data) {
    return 0;
  }
  
  return data.total_cost_usd;
}

/**
 * Gets recent comparisons for a user (if logged in)
 * or for an IP (if anonymous)
 */
export async function getRecentComparisons(
  userId?: string,
  ipAddress?: string,
  limit: number = 10
): Promise<Comparison[]> {
  let query = supabaseAdmin
    .from('comparisons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (ipAddress) {
    query = query.eq('ip_address', ipAddress);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching recent comparisons:', error);
    return [];
  }
  
  return data as Comparison[];
}
