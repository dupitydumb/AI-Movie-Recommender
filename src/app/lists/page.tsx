"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Grid, List as ListIcon, Heart, Users, Lock } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { toaster } from "@/components/ui/toaster";
import Link from "next/link";

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
  movie_list_items: { count: number }[];
  list_likes: { count: number }[];
}

export default function ListsPage() {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'my' | 'public'>('all');
  const { user, session } = useAuth();

  useEffect(() => {
    fetchLists();
  }, [filter, user]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      let url = '/api/lists';
      
      if (filter === 'my' && user) {
        url += `?userId=${user.id}`;
      } else if (filter === 'public') {
        url += '?public=true';
      }

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data.error) {
        toaster.create({
          title: "Error",
          description: data.error,
        });
      } else {
        setLists(data.lists || []);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      toaster.create({
        title: "Error",
        description: "Failed to load movie lists",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLists = lists.filter(list =>
    list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />

        <main className="relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                <ListIcon className="w-4 h-4" />
                Movie Lists
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Curated Movie
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                  Collections
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover amazing movie collections created by our community, or create your own to share with others.
              </p>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search lists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-red-500/50"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === 'all' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    All Lists
                  </button>
                  {user && (
                    <button
                      onClick={() => setFilter('my')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === 'my' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      My Lists
                    </button>
                  )}
                  <button
                    onClick={() => setFilter('public')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === 'public' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Public
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg border border-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Create List Button */}
                {user && (
                  <Button
                    asChild
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <Link href="/lists/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create List
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Lists Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-3"></div>
                      <div className="h-3 bg-gray-700 rounded mb-6 w-2/3"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : filteredLists.length > 0 ? (
                <motion.div
                  key="lists"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}
                >
                  {filteredLists.map((list, index) => (
                    <motion.div
                      key={list.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/lists/${list.id}`}>
                        <div className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                                {list.title}
                              </h3>
                              {list.description && (
                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                  {list.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              {list.is_public ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                              <span className="text-red-400 text-sm font-medium">
                                {list.profiles.username?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="text-gray-300 text-sm font-medium">
                              {list.profiles.username}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>{list.movie_list_items[0]?.count || 0} movies</span>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{list.list_likes[0]?.count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <ListIcon className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                    {searchQuery ? 'No lists found' : 'No movie lists yet'}
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    {searchQuery 
                      ? 'Try adjusting your search terms or browse all lists.'
                      : user 
                        ? 'Start building your first movie collection and share it with the community.'
                        : 'Sign in to create your own movie lists and discover collections from other users.'
                    }
                  </p>
                  {user && !searchQuery && (
                    <Button
                      asChild
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <Link href="/lists/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First List
                      </Link>
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <Footer />
      </div>
  );
}
