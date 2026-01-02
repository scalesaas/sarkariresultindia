"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, User, Camera, Phone, Clock, Loader2, Upload } from "lucide-react";
import { useUser } from "@/lib/store/user"; 

// IMPORT YOUR SERVER ACTION HERE
import { onUploadImageAction } from '@/lib/actions/image-upload.action';

interface ProfileData {
  id: string;
  name: string;
  bio: string | null;
  mobile_no: string | null;
  weekly_goal_hours: number | null;
  profile_image: string | null;
}

interface UserProfileProps {
  getProfileAction: (userId: string) => Promise<any>;
  updateProfileAction: (data: any) => Promise<any>;
}

export default function UserProfile({ getProfileAction, updateProfileAction }: UserProfileProps) {
  const logedinuser: any = useUser((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileData>({
    id: '',
    name: '',
    bio: '',
    mobile_no: '',
    weekly_goal_hours: 0,
    profile_image: '',
  });

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      if (logedinuser?.id) {
        setIsLoading(true);
        try {
          const { data } = await getProfileAction(logedinuser.id);
          
          if (data) {
            setFormData({
              id: data.id,
              name: data.name || logedinuser.user_metadata?.full_name || '',
              bio: data.bio || '',
              mobile_no: data.mobile_no || '',
              weekly_goal_hours: data.weekly_goal_hours || 0,
              profile_image: data.profile_image || '',
            });
            setImagePreview(data.profile_image);
            setIsEditing(false); 
          } else {
            // New profile
            setFormData(prev => ({ ...prev, id: logedinuser.id }));
            setIsEditing(true);
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [logedinuser, getProfileAction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- UPDATED IMAGE UPLOAD LOGIC ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Basic Client-Side Validation (Optional, since Server also checks)
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      // 2. Prepare FormData
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      // 3. Call Server Action
      const response = await onUploadImageAction(uploadFormData);

      // 4. Handle Response
      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      // 5. Update State with new URL
      const publicUrl = response.data?.path;
      
      if (publicUrl) {
        setFormData(prev => ({ ...prev, profile_image: publicUrl }));
        setImagePreview(publicUrl);
      }
      
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.message || 'Failed to upload image.');
      
      // Reset input if failed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const { error } = await updateProfileAction({
        id: logedinuser.id,
        name: formData.name,
        bio: formData.bio,
        mobile_no: formData.mobile_no,
        weekly_goal_hours: Number(formData.weekly_goal_hours),
        profile_image: formData.profile_image,
      });

      if (error) throw error;

      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err.message);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  // --- View Mode ---
  if (!isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                {formData.profile_image ? (
                  <img
                    src={formData.profile_image}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-3xl font-bold">{formData.name}</CardTitle>
                  <div className="flex flex-wrap gap-4 mt-2 text-blue-100 text-sm">
                    {formData.mobile_no && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {formData.mobile_no}
                      </span>
                    )}
                    {formData.weekly_goal_hours ? (
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                        <Clock className="w-4 h-4" /> Goal: {formData.weekly_goal_hours} hrs/week
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {formData.bio || 'No bio provided yet.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Edit Mode ---
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{formData.id ? 'Edit Profile' : 'Create Profile'}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <div 
                className={`relative group cursor-pointer ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`} 
                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} className="w-32 h-32 rounded-full object-cover border-4 border-gray-100" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay for uploading state or hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                     {isUploadingImage ? 'Uploading...' : 'Change'}
                  </span>
                </div>
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading image...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile No.</Label>
                <Input name="mobile_no" value={formData.mobile_no || ''} onChange={handleInputChange} type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Weekly Goal (Hours)</Label>
                <Input name="weekly_goal_hours" value={formData.weekly_goal_hours || ''} onChange={handleInputChange} type="number" min="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} className="min-h-[120px]" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSaving || isUploadingImage}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}