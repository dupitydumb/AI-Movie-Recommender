import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    
    // Create Supabase client with the access token
    const supabase = await createServerSupabaseClient(accessToken);
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';

    let query = supabase
      .from('movie_lists')
      .select(`
        *,
        profiles:user_id(username, avatar_url),
        movie_list_items(count),
        list_likes(count)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (isPublic) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ lists: data });
  } catch (error) {
    console.error('Error fetching movie lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    
    // Create Supabase client with the access token
    const supabase = await createServerSupabaseClient(accessToken);
    
    const { title, description, isPublic } = await request.json();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating list for user:', user.id);

    const { data, error } = await supabase
      .from('movie_lists')
      .insert({
        user_id: user.id,
        title,
        description,
        is_public: isPublic ?? true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ list: data });
  } catch (error) {
    console.error('Error creating movie list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
