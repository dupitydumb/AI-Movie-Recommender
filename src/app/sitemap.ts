import { MetadataRoute } from 'next'

// Function to fetch popular movies for sitemap
async function getPopularMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`, {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB}`,
        'accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch movies for sitemap');
      return [];
    }
    
    const data = await response.json();
    return data.results?.slice(0, 100) || []; // Limit to top 100 popular movies
  } catch (error) {
    console.error('Error fetching movies for sitemap:', error);
    return [];
  }
}

// Function to fetch trending movies
async function getTrendingMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?language=en-US`, {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB}`,
        'accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.results?.slice(0, 50) || []; // Limit to top 50 trending movies
  } catch (error) {
    console.error('Error fetching trending movies for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://Screenpick.fun'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/price`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Fetch movie data
  const [popularMovies, trendingMovies] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies()
  ]);

  // Create movie pages entries
  const moviePages = popularMovies.map((movie: any) => ({
    url: `${baseUrl}/movie/${movie.id}/watch`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Create trending movie pages (avoid duplicates)
  const trendingMoviePages = trendingMovies
    .filter((movie: any) => !popularMovies.find((pm: any) => pm.id === movie.id))
    .map((movie: any) => ({
      url: `${baseUrl}/movie/${movie.id}/watch`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  return [...staticPages, ...trendingMoviePages, ...moviePages];
}
