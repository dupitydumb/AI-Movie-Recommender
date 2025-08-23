import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user statistics
    const [listsResult, likesReceivedResult, likesGivenResult, moviesResult] = await Promise.all([
      // Total lists created by user
      supabase
        .from('movie_lists')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      
      // Total likes received on user's lists
      supabase
        .from('list_likes')
        .select('id', { count: 'exact' })
        .eq('list_id', supabase
          .from('movie_lists')
          .select('id')
          .eq('user_id', user.id)
        ),
      
      // Total likes given by user
      supabase
        .from('list_likes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      
      // Total movies added by user across all lists
      supabase
        .from('list_items')
        .select('id', { count: 'exact' })
        .eq('list_id', supabase
          .from('movie_lists')
          .select('id')
          .eq('user_id', user.id)
        )
    ]);

    // Handle potential errors
    if (listsResult.error || likesReceivedResult.error || likesGivenResult.error || moviesResult.error) {
      console.error('Stats fetch error:', {
        lists: listsResult.error,
        likesReceived: likesReceivedResult.error,
        likesGiven: likesGivenResult.error,
        movies: moviesResult.error,
      });
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    const stats = {
      total_lists: listsResult.count || 0,
      total_likes_received: likesReceivedResult.count || 0,
      total_likes_given: likesGivenResult.count || 0,
      total_movies_added: moviesResult.count || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Profile stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
