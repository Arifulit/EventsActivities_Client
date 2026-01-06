// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Calendar,
//   Users,
//   MapPin,
//   Star,
//   Heart,
//   Music,
//   Gamepad2,
//   Dumbbell,
//   BookOpen,
//   Coffee,
//   Camera,
//   Plane,
//   CheckCircle,
//   TrendingUp,
//   Award,
//   MessageSquare,
//   ArrowRight
// } from 'lucide-react';

// export default function MainPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && user) {
//       // Only redirect if user specifically navigates to dashboard
//       // Don't redirect from home page
//     }
//   }, [user, loading, router]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   // Show landing page for all users
//   const categories = [
//     { icon: Music, name: 'Music & Concerts', color: 'bg-purple-600 text-white shadow-purple-300' },
//     { icon: Gamepad2, name: 'Gaming', color: 'bg-blue-600 text-white shadow-blue-300' },
//     { icon: Dumbbell, name: 'Sports & Fitness', color: 'bg-green-600 text-white shadow-green-300' },
//     { icon: BookOpen, name: 'Education', color: 'bg-yellow-500 text-white shadow-yellow-300' },
//     { icon: Coffee, name: 'Food & Drink', color: 'bg-orange-600 text-white shadow-orange-300' },
//     { icon: Camera, name: 'Photography', color: 'bg-pink-600 text-white shadow-pink-300' },
//     { icon: Plane, name: 'Travel', color: 'bg-indigo-600 text-white shadow-indigo-300' },
//   ];

//   const features = [
//     {
//       icon: Users,
//       title: 'Find Your People',
//       description: 'Connect with like-minded individuals who share your interests and passion for events.'
//     },
//     {
//       icon: MapPin,
//       title: 'Local Events',
//       description: 'Discover exciting events happening right in your neighborhood and city.'
//     },
//     {
//       icon: Calendar,
//       title: 'Never Miss Out',
//       description: 'Get personalized recommendations and never miss an event you\'ll love.'
//     },
//     {
//       icon: Heart,
//       title: 'Build Community',
//       description: 'Create lasting friendships and build a community around shared experiences.'
//     }
//   ];

//   const stats = [
//     { number: '10K+', label: 'Active Users' },
//     { number: '5K+', label: 'Events Created' },
//     { number: '50+', label: 'Cities Covered' },
//     { number: '4.8', label: 'Average Rating' }
//   ];

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20 overflow-hidden">
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-white text-sm">
//               <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
//               10K+ Active Users • Join the Community
//             </div>
//             <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
//               Never Experience Events
//               <span className="block text-yellow-300"> Alone Again</span>
//             </h1>
//             <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
//               Connect with like-minded people for concerts, sports, hobbies, and adventures. 
//               Find your perfect event companion and make every experience memorable.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link href="/events">
//                 <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
//                   <Calendar className="w-5 h-5 mr-2" />
//                   Explore Events
//                 </Button>
//               </Link>
//               <Link href="/register">
//                 <Button variant="outline" size="lg" className="px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm transition-all duration-300">
//                   Join Community
//                   <ArrowRight className="w-5 h-5 ml-2" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Categories Section */}
//       <section className="py-20 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Find events that match your interests across various categories
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
//             {categories.map((category, index) => (
//               <Card key={index} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-400 bg-gradient-to-br from-white to-gray-50 hover:-translate-y-3">
//                 <CardContent className="p-6 text-center">
//                   <div className={`w-20 h-20 rounded-2xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-2xl ring-4 ring-white ring-opacity-50`}>
//                     <category.icon className="w-10 h-10 drop-shadow-lg" />
//                   </div>
//                   <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{category.name}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EventsHub?</h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               We make it easy to find companions for any event or activity
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <Card key={index} className="group text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-3">
//                 <CardHeader>
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
//                     <feature.icon className="w-10 h-10 text-white" />
//                   </div>
//                   <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-gray-600 leading-relaxed">{feature.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-2">Join Our Growing Community</h2>
//             <p className="text-blue-100">Numbers that speak for themselves</p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//             {stats.map((stat, index) => (
//               <div key={index} className="group">
//                 <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
//                 <div className="text-blue-100 text-lg">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


// app/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Calendar,
  Users,
  MapPin,
  Heart,
  Music,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Coffee,
  Camera,
  Plane,
  ArrowRight
} from 'lucide-react';
import api from '@/app/lib/api';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [platformStats, setPlatformStats] = useState([
    { number: '0', label: 'Active Users' },
    { number: '0', label: 'Events Created' },
    { number: '0', label: 'Cities Covered' },
    { number: '0.0', label: 'Average Rating' }
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/platform/stats');
        const data = response.data.data;
        setPlatformStats([
          { number: data.activeUsers?.toLocaleString() || '0', label: 'Active Users' },
          { number: data.eventsCreated?.toLocaleString() || '0', label: 'Events Created' },
          { number: data.citiesCovered?.toString() || '0', label: 'Cities Covered' },
          { number: data.averageRating?.toFixed(1) || '0.0', label: 'Average Rating' }
        ]);
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);
  const router = useRouter();

  // Authentication logic for home page
  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to dashboard
        router.push('/dashboard');
      }
      // If user is not logged in, show home page (landing page)
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  const categories = [
    { icon: Music, name: 'Music & Concerts', color: 'bg-purple-600 text-white shadow-purple-300' },
    { icon: Gamepad2, name: 'Gaming', color: 'bg-blue-600 text-white shadow-blue-300' },
    { icon: Dumbbell, name: 'Sports & Fitness', color: 'bg-green-600 text-white shadow-green-300' },
    { icon: BookOpen, name: 'Education', color: 'bg-yellow-500 text-white shadow-yellow-300' },
    { icon: Coffee, name: 'Food & Drink', color: 'bg-orange-600 text-white shadow-orange-300' },
    { icon: Camera, name: 'Photography', color: 'bg-pink-600 text-white shadow-pink-300' },
    { icon: Plane, name: 'Travel', color: 'bg-indigo-600 text-white shadow-indigo-300' },
  ];

  const features = [
    {
      icon: Users,
      title: 'Find Your People',
      description: 'Connect with like-minded individuals who share your interests and passion for events.'
    },
    {
      icon: MapPin,
      title: 'Local Events',
      description: 'Discover exciting events happening right in your neighborhood and city.'
    },
    {
      icon: Calendar,
      title: 'Never Miss Out',
      description: 'Get personalized recommendations and never miss an event you\'ll love.'
    },
    {
      icon: Heart,
      title: 'Build Community',
      description: 'Create lasting friendships and build a community around shared experiences.'
    }
  ];

  const stats = statsLoading ? [
    { number: '...', label: 'Active Users' },
    { number: '...', label: 'Events Created' },
    { number: '...', label: 'Cities Covered' },
    { number: '...', label: 'Average Rating' }
  ] : platformStats;

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-white text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {statsLoading ? 'Loading...' : `${platformStats[0].number} Active Users • Join the Community`}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Never Experience Events
              <span className="block text-yellow-300"> Alone Again</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with like-minded people for concerts, sports, hobbies, and adventures. 
              Find your perfect event companion and make every experience memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Calendar className="w-5 h-5 mr-2" />
                  Explore Events
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm transition-all duration-300">
                  Join Community
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find events that match your interests across various categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-400 bg-gradient-to-br from-white to-gray-50 hover:-translate-y-3">
                <CardContent className="p-6 text-center">
                  <div className={`w-20 h-20 rounded-2xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-2xl ring-4 ring-white ring-opacity-50`}>
                    <category.icon className="w-10 h-10 drop-shadow-lg" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {category.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EventsHub?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find companions for any event or activity
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-3">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Join Our Growing Community</h2>
            <p className="text-blue-100">Numbers that speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}