'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { 
  User as UserIcon, 
  MapPin, 
  Mail, 
  Calendar, 
  Star, 
  Edit, 
  Save, 
  X, 
  Camera,
  Shield,
  Crown,
  CheckCircle,
  Globe,
  Briefcase,
  Settings
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';
import { updateUserProfile, UserProfile } from '@/app/lib/users';
import { toast } from 'react-hot-toast';
import api from '@/app/lib/api';
import { User } from '@/types/auth';

export default function AuthMePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    interests: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsFetching(true);
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      setCurrentUser(userData);
      
      setEditForm({
        fullName: userData.fullName,
        bio: userData.bio || '',
        location: userData.location?.city || '',
        interests: userData.interests || [],
      });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (currentUser) {
      setEditForm({
        fullName: currentUser.fullName,
        bio: currentUser.bio || '',
        location: currentUser.location?.city || '',
        interests: currentUser.interests || [],
      });
    }
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const response = await updateUserProfile(currentUser._id, {
        fullName: editForm.fullName,
        bio: editForm.bio,
        location: {
          city: editForm.location
        },
        interests: editForm.interests
      });
      
      // Refresh current user data
      await fetchCurrentUser();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'host':
        return <Crown className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'host':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!currentUser && !isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
                  <Avatar className="w-full h-full ring-4 ring-gray-200">
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.fullName || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl sm:text-3xl font-bold">
                      {currentUser?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl mt-4">{currentUser?.fullName}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge className={getRoleColor(currentUser?.role || 'user')}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(currentUser?.role || 'user')}
                      <span className="text-xs font-bold uppercase">{currentUser?.role}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{currentUser?.email}</span>
                </div>
                {currentUser?.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{currentUser?.location?.city}, {currentUser?.location?.country || 'Unknown'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(currentUser?.createdAt || '')}</span>
                </div>
                
                {!isEditing ? (
                  <Button 
                    onClick={handleEdit}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Biography</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {currentUser?.bio || 'No bio added yet'}
                      </p>
                    </div>
                    {currentUser?.location && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                        <p className="text-gray-600">{currentUser.location?.city}, {currentUser.location?.country || 'Unknown'}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={addInterest}
                        disabled={!newInterest.trim()}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeInterest(interest)}
                        >
                          {interest} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentUser?.interests && currentUser.interests.length > 0 ? (
                      currentUser?.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No interests added yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
