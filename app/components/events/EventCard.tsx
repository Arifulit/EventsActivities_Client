'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/app/lib/events';
import { useAuth } from '@/app/context/AuthContext';
import JoinEventButton from './JoinEventButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import PermissionGuard from '@/components/auth/PermissionGuard';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  User,
  Tag,
  Star,
  Heart,
  TrendingUp,
  Sparkles,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
  event: Event;
  onUpdate?: (updatedEvent: Event) => void;
  className?: string;
}

export default function EventCard({ event, onUpdate, className = '' }: EventCardProps) {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState(event);

  const handleEventUpdate = (updatedEvent: Event) => {
    setCurrentEvent(updatedEvent);
    onUpdate?.(updatedEvent);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'Time TBD';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const isUpcoming = currentEvent.date ? new Date(currentEvent.date) > new Date() : false;
  const isToday = currentEvent.date ? new Date(currentEvent.date).toDateString() === new Date().toDateString() : false;
  const spotsLeft = (currentEvent.maxParticipants || 0) - (currentEvent.currentParticipants || 0);
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      technology: 'bg-blue-100 text-blue-800',
      music: 'bg-purple-100 text-purple-800',
      gaming: 'bg-indigo-100 text-indigo-800',
      sports: 'bg-green-100 text-green-800',
      education: 'bg-yellow-100 text-yellow-800',
      food: 'bg-orange-100 text-orange-800',
      photography: 'bg-pink-100 text-pink-800',
      travel: 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      workshop: 'bg-blue-50 text-blue-700 border-blue-200',
      conference: 'bg-purple-50 text-purple-700 border-purple-200',
      meetup: 'bg-green-50 text-green-700 border-green-200',
      party: 'bg-pink-50 text-pink-700 border-pink-200',
      competition: 'bg-red-50 text-red-700 border-red-200',
      webinar: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const isHost = user && user._id === currentEvent.hostId;
  const isParticipant = user && currentEvent.participants?.includes(user._id);

  return (
    <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 ${className}`}>
      {/* Event Image Header */}
      <div className="relative h-48 overflow-hidden">
        {currentEvent.image ? (
          <Image
            src={currentEvent.image}
            alt={currentEvent.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`${getCategoryColor(currentEvent.category)} backdrop-blur-sm bg-opacity-90`}>
            {currentEvent.category}
          </Badge>
          {isToday && (
            <Badge className="bg-red-500 text-white backdrop-blur-sm bg-opacity-90">
              Today
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${getTypeColor(currentEvent.type)} backdrop-blur-sm bg-opacity-90`}>
            {currentEvent.type}
          </Badge>
        </div>
        
        {/* Price badge */}
        {currentEvent.price > 0 && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
              <span className="text-sm font-bold text-green-600">${currentEvent.price}</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="space-y-3">
          <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-green-600 transition-colors">
            {currentEvent.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-gray-600">
            {currentEvent.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">{formatDate(currentEvent.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium">{formatTime(currentEvent.time)}</span>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="p-1.5 bg-teal-100 rounded-lg">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <span className="font-medium">{currentEvent.duration} minutes</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <div className="p-1.5 bg-lime-100 rounded-lg mt-0.5">
            <MapPin className="w-4 h-4 text-lime-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-700">
              {currentEvent.location?.venue || 'Venue TBD'}
            </div>
            <div className="text-gray-500 text-xs">
              {currentEvent.location?.address || 'Address TBD'}, {currentEvent.location?.city || 'City TBD'}
            </div>
          </div>
        </div>

        {/* Participants with progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium">{currentEvent.currentParticipants}/{currentEvent.maxParticipants}</span>
            </div>
            <span className="text-xs text-gray-500">
              {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots left`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isAlmostFull ? 'bg-red-500' : spotsLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(currentEvent.currentParticipants / currentEvent.maxParticipants) * 100}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {currentEvent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentEvent.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200 transition-colors">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {currentEvent.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100">
                +{currentEvent.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Host info */}
        {currentEvent.hostId && typeof currentEvent.hostId === 'object' && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Avatar className="h-6 w-6">
              {currentEvent.hostId.profileImage ? (
                <AvatarImage src={currentEvent.hostId.profileImage} alt={currentEvent.hostId.fullName || 'Host'} />
              ) : (
                <AvatarFallback className="text-xs bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  {currentEvent.hostId.fullName ? 
                    currentEvent.hostId.fullName.split(' ').map(n => n[0]).join('') : 
                    'H'
                  }
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{currentEvent.hostId.fullName || 'Unknown Host'}</p>
              {currentEvent.hostId.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{currentEvent.hostId.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {isHost && (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
              <User className="w-3 h-3 mr-1" />
              Your Event
            </Badge>
          )}
          {isParticipant && !isHost && (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Users className="w-3 h-3 mr-1" />
              Joined
            </Badge>
          )}
          {currentEvent.currentParticipants >= currentEvent.maxParticipants && (
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              <TrendingUp className="w-3 h-3 mr-1" />
              Full
            </Badge>
          )}
          {isUpcoming && spotsLeft <= 3 && spotsLeft > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
              <Heart className="w-3 h-3 mr-1" />
              Filling Fast
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 space-y-3 bg-gray-50/50">
        {/* Host Actions */}
        <PermissionGuard permission="editOwnEvents">
          {isHost && (
            <div className="flex gap-2 w-full">
              <Link href={`/events/${currentEvent._id}/participants`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Participants
                </Button>
              </Link>
              <Link href={`/events/edit/${currentEvent._id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          )}
        </PermissionGuard>

        {/* View Details Button */}
        <Link href={`/events/${currentEvent._id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-300 transform hover:scale-105">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>

        {/* Join/Leave Button */}
        <PermissionGuard permission="joinEvents">
          <JoinEventButton
            event={currentEvent}
            onJoinSuccess={handleEventUpdate}
            onLeaveSuccess={handleEventUpdate}
          />
        </PermissionGuard>
      </CardFooter>
    </Card>
  );
}
