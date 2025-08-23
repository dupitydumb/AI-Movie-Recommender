import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { listId, movieId, movieTitle, moviePosterUrl, movieYear, notes, position } = await request.json();

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify that the user owns the list
    const { data: listData, error: listError } = await supabase
      .from('movie_lists')
      .select('user_id')
      .eq('id', listId)
      .single();

    if (listError) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (listData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if movie is already in the list
    const { data: existingItem } = await supabase
      .from('movie_list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('movie_id', movieId)
      .single();

    if (existingItem) {
      return NextResponse.json({ error: 'Movie already in list' }, { status: 400 });
    }

    // Add movie to list
    const { data, error } = await supabase
      .from('movie_list_items')
      .insert({
        list_id: listId,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_poster_url: moviePosterUrl,
        movie_year: movieYear,
        notes,
        position: position ?? 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Error adding movie to list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify that the user owns the list that contains this item
    const { data: itemData, error: itemError } = await supabase
      .from('movie_list_items')
      .select(`
        *,
        movie_lists!inner(user_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (itemData.movie_lists.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the item
    const { error } = await supabase
      .from('movie_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing movie from list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { itemId, notes, position } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify that the user owns the list that contains this item
    const { data: itemData, error: itemError } = await supabase
      .from('movie_list_items')
      .select(`
        *,
        movie_lists!inner(user_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (itemData.movie_lists.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the item
    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;
    if (position !== undefined) updateData.position = position;

    const { data, error } = await supabase
      .from('movie_list_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Error updating movie list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
