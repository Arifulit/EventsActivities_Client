'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { User, MapPin, Mail, Calendar, Star, Edit, Save, X, Camera } from 'lucide-react';
import { formatDate } from '@/app/lib/utils';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    interests: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUser = {
        _id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
        bio: 'Passionate about music, outdoor adventures, and meeting new people!',
        location: 'New York, USA',
        interests: ['Music', 'Hiking', 'Photography', 'Cooking'],
        profileImage: '',
        rating: 4.8,
        createdAt: '2024-01-15',
        role: 'user',
        hostedEvents: [],
        joinedEvents: []
      };
      
      setUser(mockUser);
      setEditForm({
        fullName: mockUser.fullName,
        bio: mockUser.bio,
        location: mockUser.location,
        interests: mockUser.interests,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        fullName: user.fullName,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
      });
    }
  };

  const handleSave = async () => {
    try {
      // Mock update - replace with actual API call
      setUser({
        ...user,
        ...editForm,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter(i => i !== interest),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                {isOwnProfile && isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="text-2xl font-bold"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Location"
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h1>
                    <p className="text-gray-600 mb-4">{user.bio}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2 justify-center sm:justify-start">
                  {isOwnProfile ? (
                    isEditing ? (
                      <>
                        <Button onClick={handleSave} size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEdit} size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Profile
                      </Button>
                    )
                  ) : (
                    <Button size="sm">Follow</Button>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="text-center">
                <div className="flex items-center space-x-1 justify-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold">{user.rating}</span>
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editForm.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add new interest"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest}>Add</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Hosted Events */}
          <Card>
            <CardHeader>
              <CardTitle>Hosted Events</CardTitle>
              <CardDescription>Events organized by {user.fullName}</CardDescription>
            </CardHeader>
            <CardContent>
              {user.hostedEvents.length === 0 ? (
                <p className="text-gray-500">No events hosted yet</p>
              ) : (
                <div className="space-y-3">
                  {user.hostedEvents.map((event: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{event.name}</h4>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Joined Events */}
          <Card>
            <CardHeader>
              <CardTitle>Joined Events</CardTitle>
              <CardDescription>Events {user.fullName} is attending</CardDescription>
            </CardHeader>
            <CardContent>
              {user.joinedEvents.length === 0 ? (
                <p className="text-gray-500">No events joined yet</p>
              ) : (
                <div className="space-y-3">
                  {user.joinedEvents.map((event: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{event.name}</h4>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}