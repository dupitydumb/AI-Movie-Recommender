import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}?error=auth_error`);
      }

      // Create user profile if it doesn't exist
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            username: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata.avatar_url,
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}?error=unexpected_error`);
    }
  }

  // Redirect to home page
  return NextResponse.redirect(requestUrl.origin);
}
