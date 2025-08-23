"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Calendar, User, Lock, Globe, Edit, Trash2, Star } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

interface MovieListItem {
  id: string;
  movie_id: string;
  movie_title: string;
  movie_poster_url?: string;
  movie_year?: number;
  notes?: string;
  position: number;
}

interface MovieList {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
  movie_list_items: MovieListItem[];
  list_likes: { count: number }[];
}

export default function ListDetailsPage() {
  const [list, setList] = useState<MovieList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  
  const { user, session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listId = params.listId as string;

  useEffect(() => {
    if (listId) {
      fetchListDetails();
    }
  }, [listId]);

  const fetchListDetails = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`);
      const data = await response.json();
      
      if (data.error) {
        toaster.create({
          title: "Error",
          description: data.error,
        });
        router.push('/lists');
        return;
      }

      setList(data.list);
      setLikesCount(data.list.list_likes?.[0]?.count || 0);
      
      // Sort items by position
      if (data.list.movie_list_items) {
        data.list.movie_list_items.sort((a: MovieListItem, b: MovieListItem) => a.position - b.position);
      }

      // TODO: Check if user has liked this list
      // This would require an additional API call or include it in the main query
    } catch (error) {
      console.error('Error fetching list:', error);
      toaster.create({
        title: "Error",
        description: "Failed to load list",
      });
      router.push('/lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toaster.create({
        title: "Sign In Required",
        description: "Please sign in to like lists",
      });
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/lists/${listId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking list:', error);
      toaster.create({
        title: "Error",
        description: "Failed to like list",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: list?.title,
        text: list?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toaster.create({
        title: "Link Copied",
        description: "List link copied to clipboard",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        toaster.create({
          title: "List Deleted",
          description: "Your list has been deleted successfully",
        });
        router.push('/lists');
      } else {
        throw new Error('Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toaster.create({
        title: "Error",
        description: "Failed to delete list",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Header />
        <main className="relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-800 rounded w-1/4"></div>
              <div className="h-12 bg-gray-800 rounded w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Header />
        <main className="relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">List Not Found</h1>
            <p className="text-gray-400 mb-8">The list you're looking for doesn't exist or has been deleted.</p>
            <Link
              href="/lists"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lists
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === list.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/lists"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lists
            </Link>
          </motion.div>

          {/* List Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <User className="w-4 h-4" />
                      <span>{list.profiles.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      {list.is_public ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {list.title}
                  </h1>

                  {list.description && (
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-gray-400">
                    <span>{list.movie_list_items.length} movies</span>
                    <span>•</span>
                    <span>{likesCount} likes</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isOwner && (
                    <Button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        isLiked
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>

                  {isOwner && (
                    <>
                      <Link
                        href={`/lists/${listId}/edit`}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>

                      <Button
                        onClick={handleDelete}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Movies Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {list.movie_list_items.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-bold mb-2">No Movies Yet</h2>
                  <p>This list is empty. Movies will appear here once added.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {list.movie_list_items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                      {/* Movie Poster */}
                      <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                        {item.movie_poster_url ? (
                          <img
                            src={item.movie_poster_url}
                            alt={item.movie_title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Star className="w-8 h-8" />
                          </div>
                        )}
                        
                        {/* Position Badge */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Movie Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                          {item.movie_title}
                        </h3>
                        {item.movie_year && (
                          <p className="text-gray-400 text-xs mb-2">
                            {item.movie_year}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-gray-400 text-xs line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
