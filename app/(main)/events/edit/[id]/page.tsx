'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { toast } from 'react-hot-toast';
import api from '@/app/lib/api';

interface EventData {
  title: string;
  description: string;
  type: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  location: {
    venue: string;
    address: string;
    city: string;
  };
  maxParticipants: number;
  price: number;
  requirements: string;
  tags: string;
  isPublic: boolean;
}

export default function UpdateEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        if (response.data.success) {
          const eventData = response.data.data;
          setEvent({
            ...eventData,
            requirements: eventData.requirements.join('\n'),
            tags: eventData.tags.join(','),
            date: eventData.date.split('T')[0] // Format date for input[type="date"]
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      const updatedEvent = {
        ...event,
        requirements: event.requirements.split('\n').filter(r => r.trim() !== ''),
        tags: event.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      };

      const response = await api.put(`/events/${id}`, updatedEvent);
      
      if (response.data.success) {
        toast.success('Event updated successfully');
        router.push(`/events/${id}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEvent(prev => prev ? {
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      } : null);
    } else {
      setEvent(prev => prev ? {
        ...prev,
        [name]: name === 'maxParticipants' || name === 'price' || name === 'duration' 
          ? Number(value) 
          : value
      } : null);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEvent(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/events/${id}`);
      if (response.data.success) {
        toast.success('Event deleted successfully');
        router.push('/events');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading event data...</div>;
  }

  if (!event) {
    return <div className="container mx-auto py-8">Event not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Update Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            name="title"
            value={event.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={event.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <select
              id="type"
              name="type"
              value={event.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
              <option value="conference">Conference</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={event.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="art">Art</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={event.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              type="time"
              id="time"
              name="time"
              value={event.time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              type="number"
              id="duration"
              name="duration"
              min="1"
              value={event.duration}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location.venue">Venue Name</Label>
              <Input
                id="location.venue"
                name="location.venue"
                value={event.location.venue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location.address">Address</Label>
              <Input
                id="location.address"
                name="location.address"
                value={event.location.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location.city">City</Label>
            <Input
              id="location.city"
              name="location.city"
              value={event.location.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Maximum Participants</Label>
            <Input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              min="1"
              value={event.maxParticipants}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={event.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements (one per line)</Label>
          <Textarea
            id="requirements"
            name="requirements"
            value={event.requirements}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={event.tags}
            onChange={handleChange}
            placeholder="tech, workshop, web-development"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={event.isPublic}
            onChange={handleCheckboxChange}
            className="h-4 w-4"
          />
          <Label htmlFor="isPublic" className="!m-0">
            Make this event public
          </Label>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Event
          </Button>
          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}