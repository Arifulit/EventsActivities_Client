'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Mail, 
  Calendar, 
  Star, 
  Edit, 
  Save, 
  X, 
  Camera,
  Award,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Shield,
  Crown,
  CheckCircle,
  Globe,
  Briefcase,
  Target
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';
import { getUserProfile, updateUserProfile, UserProfile } from '@/app/lib/users';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }
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

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      const userData = response.data;
      
      setUser(userData);
      setEditForm({
        fullName: userData.fullName,
        bio: userData.bio || '',
        location: userData.location?.city || '',
        interests: userData.interests || [],
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

  const handleSave = async () => {
    try {
      const response = await updateUserProfile(userId, {
        fullName: editForm.fullName,
        bio: editForm.bio,
        location: {
          city: editForm.location
        },
        interests: editForm.interests
      });
      
      setUser(response.data);
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

  const handleAddInterest = addInterest; // Alias for consistency

  const removeInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter(i => i !== interest),
    });
  };

  const handleCancel = () => {
    if (!user) return;
    
    setEditForm({
      fullName: user.fullName,
      bio: user.bio || '',
      location: user.location?.city || '',
      interests: user.interests || [],
    });
    setIsEditing(false);
    setNewInterest('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB to prevent request entity too large)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB for optimal performance');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImageSimple = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        
        // Simple compression by reducing quality
        const img = new Image();
        img.onload = () => {
          // Create a smaller canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            // Fallback to original base64 if canvas fails
            resolve(result);
            return;
          }

          // Calculate new dimensions (max 300x300 for profile)
          let { width, height } = img;
          const maxSize = 300;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          try {
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with reduced quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressedDataUrl);
          } catch (error) {
            // Fallback to original if compression fails
            console.warn('Canvas compression failed, using original:', error);
            resolve(result);
          }
        };
        
        img.onerror = () => {
          // Fallback to original base64 if image loading fails
          resolve(result);
        };
        
        img.src = result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    try {
      console.log('Starting image upload...');
      
      // Try to compress image, with fallback to original
      let imageUrl: string;
      try {
        imageUrl = await compressImageSimple(selectedImage);
        console.log('Image compressed successfully');
      } catch (compressError) {
        console.warn('Compression failed, using original:', compressError);
        // Fallback to simple base64
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
      }
      
      console.log('Updating user profile with image...');
      
      // Update user profile with image
      const response = await updateUserProfile(userId, {
        profileImage: imageUrl,
      });
      
      console.log('Profile updated successfully');
      
      setUser(response.data);
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Profile image updated successfully!');
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 bg-blue-100 rounded-full animate-ping mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading profile...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we fetch user data</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div className="text-xl font-medium text-gray-900 mb-2">Profile not found</div>
          <div className="text-gray-500 mb-4">The user profile you're looking for doesn't exist</div>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'host':
        return <Crown className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-red-200';
      case 'host':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 shadow-purple-200';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-2xl overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : user.profileImage ? (
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={user.profileImage} alt={user.fullName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl sm:text-3xl font-bold">
                      {user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              {isOwnProfile && (
                <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                  <label className="bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {selectedImage && (
                    <div className="flex gap-1">
                      <button
                        onClick={handleImageUpload}
                        disabled={isUploadingImage}
                        className="bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        title="Upload Image"
                      >
                        {isUploadingImage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {user.isVerified && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-full shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                {isEditing ? (
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="text-2xl sm:text-3xl font-bold bg-white/20 border-white/30 text-white placeholder-white/70 text-center sm:text-left"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white break-words">{user.fullName}</h1>
                )}
                <Badge className={`border ${getRoleColor(user.role)} px-3 py-1 shadow-lg backdrop-blur-sm`}>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(user.role)}
                    <span className="capitalize text-sm font-bold">{user.role}</span>
                  </div>
                </Badge>
              </div>
              
              {/* Role Description */}
              <div className="text-center sm:text-left mb-4">
                <p className="text-white/90 text-sm sm:text-base font-medium">
                  {user.role === 'admin' && '🛡️ System Administrator - Full system access and management'}
                  {user.role === 'host' && '👑 Event Host - Create and manage amazing events'}
                  {user.role === 'user' && '🎯 Event Enthusiast - Discover and join events'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 text-white/80 mb-4 text-sm sm:text-base">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="break-words">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>{user.isVerified ? '✅ Verified' : '⏳ Pending Verification'}</span>
                </div>
              </div>

              {/* Bio */}
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-lg resize-none h-20 text-center sm:text-left"
                />
              ) : (
                user.bio && (
                  <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl">{user.bio}</p>
                )
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              {isOwnProfile ? (
                <>
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                      <Button
                        onClick={handleSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-full sm:w-auto"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg w-full sm:w-auto">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{user.hostedEvents?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Events Hosted</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{user.joinedEvents?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Events Joined</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{user.totalReviews || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">{user.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Privileges Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Role Privileges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.role === 'admin' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Full system administration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Manage all users and events</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Access to analytics and reports</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">System configuration control</span>
                      </div>
                    </>
                  )}
                  {user.role === 'host' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Create and manage events</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">View event analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Manage bookings and attendees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Receive payments from events</span>
                      </div>
                    </>
                  )}
                  {user.role === 'user' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Browse and join events</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Manage personal bookings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Rate and review events</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Upgrade to host anytime</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="City, Country"
                    className="mb-2"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{user.location?.city || 'Location not specified'}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add interest..."
                        className="flex-1"
                      />
                      <Button onClick={handleAddInterest} size="sm" className="w-full sm:w-auto">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => removeInterest(interest)}>
                          {interest} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.interests?.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                        {interest}
                      </Badge>
                    ))}
                    {(!user.interests || user.interests.length === 0) && (
                      <p className="text-gray-500 text-sm sm:text-base">No interests specified</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Hosted Events */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Hosted Events
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Events organized by {user.fullName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.hostedEvents && user.hostedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {user.hostedEvents.map((event: any, index: number) => (
                      <div key={event._id || `hosted-event-${index}`} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-blue-300">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.currentParticipants}/{event.maxParticipants} attendees
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">{event.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No events hosted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Joined Events */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Joined Events
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Events {user.fullName} is attending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.joinedEvents && user.joinedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {user.joinedEvents.map((event: any, index: number) => (
                      <div key={event._id || `joined-event-${index}`} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-green-300">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.currentParticipants}/{event.maxParticipants} attendees
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">{event.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No events joined yet</p>
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