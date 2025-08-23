-- Create users table extension (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movie lists table
CREATE TABLE public.movie_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movie list items table
CREATE TABLE public.movie_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.movie_lists(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL, -- TMDB movie ID
  movie_title TEXT NOT NULL,
  movie_poster_url TEXT,
  movie_year INTEGER,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved movies table (user's personal watchlist)
CREATE TABLE public.saved_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL, -- TMDB movie ID
  movie_title TEXT NOT NULL,
  movie_poster_url TEXT,
  movie_year INTEGER,
  is_watched BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list likes table
CREATE TABLE public.list_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.movie_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, list_id)
);

-- Create indexes for better performance
CREATE INDEX idx_movie_lists_user_id ON public.movie_lists(user_id);
CREATE INDEX idx_movie_lists_public ON public.movie_lists(is_public);
CREATE INDEX idx_movie_list_items_list_id ON public.movie_list_items(list_id);
CREATE INDEX idx_saved_movies_user_id ON public.saved_movies(user_id);
CREATE INDEX idx_list_likes_list_id ON public.list_likes(list_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for movie_lists
CREATE POLICY "Public lists are viewable by everyone" ON public.movie_lists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists" ON public.movie_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON public.movie_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON public.movie_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for movie_list_items
CREATE POLICY "List items are viewable based on list visibility" ON public.movie_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists 
      WHERE id = list_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert items to their own lists" ON public.movie_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movie_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own lists" ON public.movie_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their own lists" ON public.movie_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for saved_movies
CREATE POLICY "Users can view their own saved movies" ON public.saved_movies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved movies" ON public.saved_movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved movies" ON public.saved_movies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved movies" ON public.saved_movies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for list_likes
CREATE POLICY "List likes are viewable by everyone" ON public.list_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like lists" ON public.list_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike lists" ON public.list_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movie_lists_updated_at
  BEFORE UPDATE ON public.movie_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
