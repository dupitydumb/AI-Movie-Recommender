'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toaster } from '@/components/ui/toaster';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { 
  Edit2, 
  Save, 
  X, 
  Camera, 
  User, 
  Mail, 
  Calendar,
  Heart,
  List,
  Film,
  ThumbsUp,
  Loader2,
  Sparkles,
  Settings
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  total_lists: number;
  total_likes: number;
}

interface UserStats {
  total_lists: number;
  total_likes_received: number;
  total_likes_given: number;
  total_movies_added: number;
}

export default function ProfilePage() {
  const { user, updateProfile, session } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
  }, [user, router]);

  // Fetch user profile and stats
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load profile',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/profile/stats', {
                headers: {
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
        
        toaster.create({
          title: 'Success',
          description: 'Profile updated successfully',
          type: 'success',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || '',
    });
    setEditing(false);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-800 rounded-full relative">
            <div className="absolute inset-0 w-16 h-16 border-4 border-t-red-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <Header />
        <div className="container max-w-6xl mx-auto py-16 px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg">Failed to load profile. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header />

      <main className="relative z-10 pt-10 pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
              <User className="w-4 h-4" />
              Your Profile
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    My Profile
                  </span>
                </h1>
                <p className="text-gray-300">Manage your personal information and movie preferences</p>
              </div>
              
              {!editing ? (
                <motion.button
                  onClick={() => setEditing(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={!saving ? { scale: 1.05 } : {}}
                    whileTap={!saving ? { scale: 0.95 } : {}}
                    className={`px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    disabled={saving}
                    whileHover={!saving ? { scale: 1.05 } : {}}
                    whileTap={!saving ? { scale: 0.95 } : {}}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Profile Card */}
            <motion.div 
              className="md:col-span-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20"></div>
                <div className="px-6 py-8 -mt-12 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                      {profile.avatar_url ? (
                        <img 
                          src={editing ? editForm.avatar_url : profile.avatar_url} 
                          alt={profile.display_name || profile.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                          {(profile.display_name || profile.email)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    {editing && (
                      <button
                        className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 p-2 rounded-full text-white"
                        onClick={() => {
                          toaster.create({
                            title: 'Coming Soon',
                            description: 'Avatar upload feature will be available soon!',
                          });
                        }}
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div className="w-full space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editForm.display_name}
                          onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                          placeholder="Enter your display name"
                          className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-4 space-y-3">
                      <h2 className="text-2xl font-bold text-white">
                        {profile.display_name || 'Anonymous User'}
                      </h2>
                      <p className="text-gray-400">{profile.email}</p>
                      <div className="px-4 py-3 bg-gray-800/50 border border-gray-800 rounded-xl">
                        <p className="text-gray-300 text-sm italic">
                          {profile.bio || 'No bio added yet'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="w-full pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Account Settings</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <button
                      className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        toaster.create({
                          title: 'Coming Soon',
                          description: 'Account deletion will be available soon',
                        });
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Statistics and Activity */}
            <motion.div 
              className="md:col-span-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Stats Cards */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Your Stats</h3>
                </div>
                
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard
                      icon={<List className="h-6 w-6 text-red-400" />}
                      value={stats.total_lists}
                      label="Lists Created"
                    />
                    <StatsCard
                      icon={<Film className="h-6 w-6 text-purple-400" />}
                      value={stats.total_movies_added}
                      label="Movies Added"
                    />
                    <StatsCard
                      icon={<Heart className="h-6 w-6 text-pink-400" />}
                      value={stats.total_likes_received}
                      label="Likes Received"
                    />
                    <StatsCard
                      icon={<ThumbsUp className="h-6 w-6 text-blue-400" />}
                      value={stats.total_likes_given}
                      label="Likes Given"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-10 h-10 border-2 border-gray-700 border-t-red-400 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Recent Activity */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Film className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  </div>
                  <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Placeholder for recent activity - can be implemented later */}
                  <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 flex justify-center">
                    <p className="text-gray-400">Your recent activity will appear here</p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-4">
                    <button 
                      onClick={() => router.push('/lists/create')}
                      className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <List className="h-5 w-5" />
                      Create a New List
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, value, label }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center"
    >
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value || 0}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </motion.div>
  );
}
