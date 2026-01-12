'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { joinEvent as joinEventAction, leaveEvent as leaveEventAction } from '@/app/lib/eventActions';
import { Event } from '@/app/lib/events';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  UserPlus, 
  UserMinus, 
  Loader2, 
  Users, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface JoinEventButtonProps {
  event: Event;
  onUpdate?: (updatedEvent: Event) => void;
  onJoinSuccess?: (response: any) => void;
  onLeaveSuccess?: (response: any) => void;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export default function JoinEventButton({
  event,
  onUpdate,
  onJoinSuccess,
  onLeaveSuccess,
  size = 'default',
  variant = 'default',
  className = ''
}: JoinEventButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Early return if user is not available
  if (!user) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <UserPlus className="w-4 h-4 mr-2" />
        Login to Join
      </Button>
    );
  }

  const isHost = user?._id && (
    (typeof event.hostId === 'object' && event.hostId?._id === user._id) ||
    (typeof event.hostId === 'string' && event.hostId === user._id)
  );
  
  const isJoined = user?._id && event.participants && event.participants.some(participant => {
    if (typeof participant === 'string') {
      return participant === user._id;
    } else if (participant && typeof participant === 'object' && participant._id) {
      return participant._id === user._id;
    }
    return false;
  });
  const isFull = event.currentParticipants >= event.maxParticipants;
  const isPastEvent = new Date(event.date) < new Date();
  const isPaidEvent = event.price > 0;

  const handleJoinEvent = async () => {
    if (!user) {
      toast.error('Please login to join this event');
      return;
    }

    if (isHost) {
      toast.error('You cannot join your own event');
      return;
    }

    if (isFull) {
      toast.error('This event is already full');
      return;
    }

    if (isPastEvent) {
      toast.error('This event has already passed');
      return;
    }

    // Join directly without payment dialog
    await performJoin();
  };

  const performJoin = async () => {
    setIsLoading(true);
    try {
      const response = await joinEventAction(event._id);
      
      toast.success(response.message);
      onJoinSuccess?.(response);
      onUpdate?.(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join event';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await leaveEventAction(event._id);
      
      toast.success('Successfully left the event');
      onLeaveSuccess?.(response);
      onUpdate?.(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to leave event';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is the host
  if (isHost) {
    return (
      <Badge variant="secondary" className={className}>
        Your Event
      </Badge>
    );
  }

  // If already joined
  if (isJoined) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleLeaveEvent}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <UserMinus className="w-4 h-4 mr-2" />
        )}
        Leave Event
      </Button>
    );
  }

  // If event is full
  if (isFull) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <Users className="w-4 h-4 mr-2" />
        Event Full
      </Button>
    );
  }

  // If event is in the past
  if (isPastEvent) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Event Ended
      </Button>
    );
  }

  // Join button - direct join without payment dialog
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleJoinEvent}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isPaidEvent ? (
        <>
          <DollarSign className="w-4 h-4 mr-1" />
          Join - ${event.price}
        </>
      ) : (
        'Join Event'
      )}
    </Button>
  );
}
