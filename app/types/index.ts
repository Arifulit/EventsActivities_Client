export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'user' | 'host' | 'admin';
  profileImage?: string;
  bio?: string;
  interests: string[];
  location: string;
  rating?: number;
  createdAt: string;
}

export interface Event {
  _id: string;
  name: string;
  type: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  joiningFee: number;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  host: User;
  participants: User[];
  createdAt: string;
}

export interface Review {
  _id: string;
  user: User;
  host: User;
  event: Event;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  location: string;
}