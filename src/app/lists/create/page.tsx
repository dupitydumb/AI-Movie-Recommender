"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";

export default function CreateListPage() {
  const { user, session } = useAuth();

  const testAPI = async () => {
    console.log('Full session object:', session);
    console.log('Session access_token:', session?.access_token);
    console.log('User:', user);

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          title: "Test List",
          description: "Testing API",
          isPublic: true,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.error) {
        toaster.create({
          title: "API Error",
          description: data.error,
        });
      } else {
        toaster.create({
          title: "Success!",
          description: "API call worked",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toaster.create({
        title: "Error",
        description: "Failed to call API",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please sign in to create a list</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Test Create List Page
          </h1>
          <p className="text-xl text-gray-400">
            Testing authentication for API calls
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <div className="space-y-4">
            <div>
              <p className="text-white">User: {user?.email}</p>
              <p className="text-white">Has Session: {session ? 'Yes' : 'No'}</p>
              <p className="text-white">Has Access Token: {session?.access_token ? 'Yes' : 'No'}</p>
            </div>
            
            <Button onClick={testAPI}>
              Test API Call
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
