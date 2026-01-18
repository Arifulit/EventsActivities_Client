'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import EventCard from '@/app/components/events/EventCard';
import ProfessionalSearch from '@/components/search/ProfessionalSearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/app/lib/api';
import { Event } from '@/app/lib/events';

interface ApiResponse {
  success: boolean;
  data: Event[];
  total: number;
  page: number;
  pages: number;
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');

  const categories = ['music', 'gaming', 'sports', 'education', 'food', 'photography', 'travel', 'technology', 'entertainment', 'networking', 'business', 'health', 'arts', 'other'];
  const types = ['workshop', 'conference', 'meetup', 'party', 'competition', 'webinar'];

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse>('/events?status=open');
        
        console.log('=== Events Fetched ===');
        if (response.data.success && Array.isArray(response.data.data)) {
          console.log('Total events:', response.data.data.length);
          response.data.data.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
              title: event.title,
              id: event._id,
              image: event.image || 'NO IMAGE',
              category: event.category
            });
          });
          setEvents(response.data.data);
        } else if (Array.isArray(response.data)) {
          setEvents(response.data);
        } else {
          setEvents([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter and sort events
  const applyFilters = useCallback(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          (event.tags && event.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // City filter
    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(event => event.location?.city === selectedCity);
    }

    // Price range filter
    if (priceRange !== 'all') {
      if (priceRange === 'free') {
        filtered = filtered.filter(event => event.price === 0 || event.paymentType === 'free');
      } else if (priceRange === 'paid') {
        filtered = filtered.filter(event => event.price > 0 && event.paymentType !== 'free');
      } else if (priceRange === 'under50') {
        filtered = filtered.filter(event => event.price > 0 && event.price < 50);
      } else if (priceRange === 'under100') {
        filtered = filtered.filter(event => event.price > 0 && event.price < 100);
      }
    }

    // Sort
    switch (sortBy) {
      case 'upcoming':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, selectedType, selectedCity, priceRange, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const uniqueCities = Array.from(new Set(events.map(e => e.location?.city).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Discover Events</h1>
          <p className="text-lg text-purple-100">Find and join events that match your interests</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Search Events</label>
                  <ProfessionalSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    placeholder="Search events..."
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Event Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                {uniqueCities.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">City</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Cities</SelectItem>
                        {uniqueCities.map(city => (
                          <SelectItem key={city} value={city || ''}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Price</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="under50">Under $50</SelectItem>
                      <SelectItem value="under100">Under $100</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSelectedCity('all');
                    setPriceRange('all');
                    setSortBy('upcoming');
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Events Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event._id}
                    event={event}
                    className="h-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
