'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Heart, Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';

export default function SavedEventsPage() {
  const [savedEvents] = useState([
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park, New York',
      price: '$45',
      category: 'Music',
      organizer: 'NYC Events',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-10',
      attendees: 1250,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Tech Innovation Workshop',
      date: '2024-02-20',
      time: '2:00 PM',
      location: 'Tech Hub, San Francisco',
      price: '$25',
      category: 'Workshop',
      organizer: 'TechLearn',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-08',
      attendees: 85,
      rating: 4.6
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      date: '2024-03-10',
      time: '12:00 PM',
      location: 'Downtown Plaza, Chicago',
      price: '$65',
      category: 'Food & Dining',
      organizer: 'Chicago Food Events',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-05',
      attendees: 500,
      rating: 4.9
    },
    {
      id: 4,
      title: 'Art Exhibition: Modern Visions',
      date: '2024-04-05',
      time: '10:00 AM',
      location: 'Art Gallery, Los Angeles',
      price: '$15',
      category: 'Art & Culture',
      organizer: 'LA Art Museum',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-03',
      attendees: 200,
      rating: 4.7
    }
  ]);

  const handleUnsave = (eventId: number) => {
    console.log('Unsave event:', eventId);
    // Handle unsaving logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Saved Events</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {savedEvents.length} events saved
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedEvents.map((event) => (
          <Card key={event.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-0">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUnsave(event.id)}
                    className="bg-white/90 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                <Badge className="absolute top-2 left-2" variant="secondary">
                  {event.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">by {event.organizer}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">{event.price}</span>
                    <Badge variant="outline" className="text-xs">
                      ⭐ {event.rating}
                    </Badge>
                  </div>
                  <Button size="sm" className="hover:bg-green-600">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Saved on {new Date(event.savedDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved events yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring events and save your favorites to see them here.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Explore Events
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}