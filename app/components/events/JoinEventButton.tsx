/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { joinEvent as joinEventAction, leaveEvent as leaveEventAction } from '@/app/lib/eventActions';
import { Event } from '@/app/lib/events';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { canJoinEvent, canLeaveEvent, validateParticipantCount } from '@/lib/eventValidation';
import toast from 'react-hot-toast';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Validate event data first
  const validatedEvent = validateParticipantCount(event);

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
  
  const isJoined = user?._id && validatedEvent.participants && validatedEvent.participants.some(participant => {
    if (typeof participant === 'string') {
      return participant === user._id;
    } else if (participant && typeof participant === 'object' && participant._id) {
      return participant._id === user._id;
    }
    return false;
  });
  
  const isFull = validatedEvent.currentParticipants >= validatedEvent.maxParticipants;
  const isPastEvent = new Date(event.date) < new Date();
  const isPaidEvent = event.price > 0;

  // Check join/leave permissions
  const joinCheck = canJoinEvent(validatedEvent, user._id);
  const leaveCheck = canLeaveEvent(validatedEvent, user._id);

  const handleJoinEvent = async () => {
    if (!user) {
      toast.error('Please login to join this event');
      return;
    }

    if (isHost) {
      toast.error('You cannot join your own event');
      return;
    }

    // Check if user can join using validation utility
    const joinValidation = canJoinEvent(validatedEvent, user._id);
    if (!joinValidation.canJoin) {
      toast.error(joinValidation.reason || 'Cannot join this event');
      return;
    }

    if (isPastEvent) {
      toast.error('Cannot join past events');
      return;
    }

    // Join directly without payment dialog
    await performJoin();
  };

  const performJoin = async () => {
    setIsLoading(true);
    try {
      console.log('🔗 Attempting to join event:', {
        eventId: event._id,
        currentParticipants: event.currentParticipants,
        maxParticipants: event.maxParticipants,
        userId: user._id,
        isFreeEvent: true
      });

      const response = await joinEventAction(event._id);
      
      // Validate response data
      if (response.data && response.data.currentParticipants < 0) {
        console.warn('⚠️ Backend returned negative participant count after join, fixing on client side');
        response.data.currentParticipants = 1; // At least the current user
      }
      
      // Check if event is now over capacity
      if (response.data && response.data.currentParticipants > response.data.maxParticipants) {
        console.warn('⚠️ Event is now over capacity:', {
          current: response.data.currentParticipants,
          max: response.data.maxParticipants
        });
        response.data.currentParticipants = response.data.maxParticipants;
      }
      
      toast.success('✅ Joined event successfully!');
      onJoinSuccess?.(response);
      onUpdate?.(response.data);

      // All events are now free - no payment redirect needed
      toast.success('🎉 Successfully joined the event!');
      console.log('✅ Event joined successfully - no payment required');
    } catch (error: any) {
      console.error('❌ Join event error:', error);
      
      let errorMessage = 'Failed to join event';
      if (error.response?.data?.message?.includes('currentParticipants')) {
        errorMessage = 'Event participant count error. Please refresh the page and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) return;

    // Check if user can leave using validation utility
    const leaveValidation = canLeaveEvent(validatedEvent, user._id);
    if (!leaveValidation.canLeave) {
      toast.error(leaveValidation.reason || 'Cannot leave this event');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚪 Attempting to leave event:', {
        eventId: validatedEvent._id,
        currentParticipants: validatedEvent.currentParticipants,
        userId: user._id
      });

      const response = await leaveEventAction(validatedEvent._id);
      
      // Validate and fix response data
      if (response.data) {
        const fixedData = validateParticipantCount(response.data);
        response.data = fixedData;
      }
      
      toast.success('Successfully left the event');
      onLeaveSuccess?.(response);
      onUpdate?.(response.data);
    } catch (error: any) {
      console.error('❌ Leave event error:', error);
      
      let errorMessage = 'Failed to leave event';
      
      // Handle specific error types
      if (error.response?.status === 500) {
        console.error('💥 Backend server error (500) - This is a backend issue');
        errorMessage = 'Server error occurred. The event has been updated locally. Please refresh the page.';
        
        // Try to update local state optimistically
        try {
          const updatedEvent = {
            ...event, // Use the original event object
            currentParticipants: Math.max(validatedEvent.currentParticipants - 1, 0),
            participants: validatedEvent.participants?.filter(p => 
              (typeof p === 'string' ? p : p._id) !== user._id
            ) || []
          };
          
          // Update local state optimistically
          onUpdate?.(updatedEvent);
          toast.success('Left event locally. Please refresh to see latest changes.');
          return; // Don't show error toast since we handled it optimistically
        } catch (updateError) {
          console.error('Failed to update local state:', updateError);
        }
      } else if (error.response?.data?.message?.includes('currentParticipants') && 
          error.response?.data?.message?.includes('less than minimum')) {
        errorMessage = 'Cannot leave event: Participant count would become negative. Please refresh the page.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
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
      Join Event - Free
    </Button>
  );
}
