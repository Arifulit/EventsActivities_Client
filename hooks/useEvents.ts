import { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Event {
  _id: string;
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
  hostId: {
    _id: string;
    fullName: string;
    profileImage: string;
    averageRating: number;
  };
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  image: string;
  requirements: string[];
  tags: string[];
  status: string;
  isPublic: boolean;
  participants: string[];
  waitingList: string[];
  createdAt: string;
  updatedAt: string;
}

interface EventsResponse {
  success: boolean;
  message: string;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const useEvents = (params = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events', { params });
      const data: EventsResponse = response.data;
      if (data.success) {
        setEvents(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, [JSON.stringify(params)]); // Re-run when params change

  return {
    events,
    loading,
    error,
    pagination,
    refetch: fetchAllEvents,
  };
};

export default useEvents;
