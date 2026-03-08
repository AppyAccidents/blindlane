import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 250);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('comparisons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filter === 'voted') {
      query = query.not('winner', 'is', null);
    } else if (filter === 'unvoted') {
      query = query.is('winner', null);
    }

    if (search) {
      query = query.ilike('prompt_text', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      comparisons: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comparisons' },
      { status: 500 }
    );
  }
}
