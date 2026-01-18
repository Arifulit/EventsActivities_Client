/**
 * Event validation utilities to prevent participant count issues
 */

export interface EventData {
  _id: string;
  currentParticipants: number;
  maxParticipants: number;
  participants?: any[];
  hostId?: string | { _id: string };
  date?: string;
  price?: number;
}

/**
 * Validates and fixes participant count issues
 */
export const validateParticipantCount = (event: EventData): EventData => {
  const validatedEvent = { ...event };
  
  // Ensure currentParticipants is a number
  if (typeof validatedEvent.currentParticipants !== 'number' || isNaN(validatedEvent.currentParticipants)) {
    console.warn('⚠️ Invalid currentParticipants type, setting to 0');
    validatedEvent.currentParticipants = 0;
  }
  
  // Prevent negative participant counts
  if (validatedEvent.currentParticipants < 0) {
    console.warn('⚠️ Negative participant count detected, setting to 0:', {
      eventId: validatedEvent._id,
      invalidCount: validatedEvent.currentParticipants
    });
    validatedEvent.currentParticipants = 0;
  }
  
  // Ensure maxParticipants is valid
  if (typeof validatedEvent.maxParticipants !== 'number' || validatedEvent.maxParticipants <= 0) {
    console.warn('⚠️ Invalid maxParticipants, setting to default value');
    validatedEvent.maxParticipants = Math.max(validatedEvent.currentParticipants, 1);
  }
  
  // Prevent over-capacity
  if (validatedEvent.currentParticipants > validatedEvent.maxParticipants) {
    console.warn('⚠️ Event over capacity, adjusting currentParticipants:', {
      eventId: validatedEvent._id,
      current: validatedEvent.currentParticipants,
      max: validatedEvent.maxParticipants
    });
    validatedEvent.currentParticipants = validatedEvent.maxParticipants;
  }
  
  // Sync with participants array if available
  if (Array.isArray(validatedEvent.participants)) {
    const actualParticipantCount = validatedEvent.participants.length;
    if (actualParticipantCount !== validatedEvent.currentParticipants) {
      console.warn('⚠️ Mismatch between currentParticipants and participants array length:', {
        eventId: validatedEvent._id,
        currentParticipants: validatedEvent.currentParticipants,
        participantsArrayLength: actualParticipantCount
      });
      validatedEvent.currentParticipants = actualParticipantCount;
    }
  }
  
  return validatedEvent;
};

/**
 * Checks if a user can join an event
 */
export const canJoinEvent = (event: EventData, userId?: string): { canJoin: boolean; reason?: string } => {
  const validatedEvent = validateParticipantCount(event);
  
  if (!userId) {
    return { canJoin: false, reason: 'User not authenticated' };
  }
  
  // Check if already joined
  if (Array.isArray(validatedEvent.participants)) {
    const isAlreadyJoined = validatedEvent.participants.some(participant => {
      if (typeof participant === 'string') {
        return participant === userId;
      } else if (participant && typeof participant === 'object' && participant._id) {
        return participant._id === userId;
      }
      return false;
    });
    
    if (isAlreadyJoined) {
      return { canJoin: false, reason: 'Already joined this event' };
    }
  }
  
  // Check capacity
  if (validatedEvent.currentParticipants >= validatedEvent.maxParticipants) {
    return { canJoin: false, reason: 'Event is full' };
  }
  
  return { canJoin: true };
};

/**
 * Checks if a user can leave an event
 */
export const canLeaveEvent = (event: EventData, userId?: string): { canLeave: boolean; reason?: string } => {
  const validatedEvent = validateParticipantCount(event);
  
  if (!userId) {
    return { canLeave: false, reason: 'User not authenticated' };
  }
  
  // Check if participant count is already 0
  if (validatedEvent.currentParticipants <= 0) {
    return { canLeave: false, reason: 'No participants to remove' };
  }
  
  // Check if user is actually joined
  if (Array.isArray(validatedEvent.participants)) {
    const isJoined = validatedEvent.participants.some(participant => {
      if (typeof participant === 'string') {
        return participant === userId;
      } else if (participant && typeof participant === 'object' && participant._id) {
        return participant._id === userId;
      }
      return false;
    });
    
    if (!isJoined) {
      return { canLeave: false, reason: 'Not joined to this event' };
    }
  }
  
  return { canLeave: true };
};

/**
 * Updates participant count safely
 */
export const updateParticipantCount = (
  event: EventData, 
  change: 'increment' | 'decrement', 
  userId?: string
): EventData => {
  const validatedEvent = validateParticipantCount(event);
  const updatedEvent = { ...validatedEvent };
  
  if (change === 'increment') {
    updatedEvent.currentParticipants = Math.min(
      updatedEvent.currentParticipants + 1,
      updatedEvent.maxParticipants
    );
    
    // Add to participants array if available
    if (Array.isArray(updatedEvent.participants) && userId) {
      if (!updatedEvent.participants.includes(userId)) {
        updatedEvent.participants.push(userId);
      }
    }
  } else if (change === 'decrement') {
    updatedEvent.currentParticipants = Math.max(updatedEvent.currentParticipants - 1, 0);
    
    // Remove from participants array if available
    if (Array.isArray(updatedEvent.participants) && userId) {
      updatedEvent.participants = updatedEvent.participants.filter(p => {
        if (typeof p === 'string') {
          return p !== userId;
        } else if (p && typeof p === 'object' && p._id) {
          return p._id !== userId;
        }
        return true;
      });
    }
  }
  
  return validateParticipantCount(updatedEvent);
};
