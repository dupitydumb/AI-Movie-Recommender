import React from 'react';
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function NotFound() {
  return (
    <div>
      <Header />
    <div className="flex flex-col items-center justify-center h-screen ${geistSans.variable} ${geistMono.variable} antialiased text-gray-900">
      <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600">Oops, the page you are looking for does not exist.</p>
      </div>
      
    </div>
    <Footer />
    </div>
  );
}
