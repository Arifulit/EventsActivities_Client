'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { joinEvent, leaveEvent, Event } from '@/app/lib/events';
import { 
  UserPlus, 
  UserMinus, 
  Loader2, 
  CheckCircle2, 
  Users, 
  DollarSign,
  CreditCard,
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const isHost = user && (
    (typeof event.hostId === 'object' && event.hostId._id === user._id) ||
    (typeof event.hostId === 'string' && event.hostId === user._id)
  );
  
  const isJoined = user && event.participants.includes(user._id);
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

    // For paid events, show payment dialog
    if (isPaidEvent) {
      setShowPaymentDialog(true);
      return;
    }

    // For free events, join directly
    await performJoin();
  };

  const performJoin = async () => {
    setIsLoading(true);
    try {
      const response = await joinEvent(event._id);
      
      toast.success(response.message);
      onJoinSuccess?.(response);
      onUpdate?.(response.data);
      setShowPaymentDialog(false);
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
      const response = await leaveEvent(event._id);
      
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

  // Join button with payment dialog for paid events
  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      
      {isPaidEvent && (
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Registration</DialogTitle>
            <DialogDescription>
              This event requires a payment of ${event.price} to join. Complete the payment below to secure your spot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Event Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{event.title}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Time: {event.time}</p>
                <p>Location: {event.location.venue}</p>
                <p>Price: ${event.price}</p>
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Payment Method:</p>
              
              <Button
                onClick={performJoin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Pay ${event.price} with Card
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Your payment is secure and encrypted. You'll receive a confirmation email after successful payment.
            </p>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
