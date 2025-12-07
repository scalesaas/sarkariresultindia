"use client"
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../navbar/navbar';
import { Button } from '@/components/ui/button';
import supabase from '@/utils/supabase/supabase';
import { useUser } from "@/lib/store/user";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Github, Instagram, Linkedin, User, Mail, Upload, Camera, X } from "lucide-react";
// Define interface for instructor data
interface InstructorData {
  Name: string;
  Bio: string;
  instagram?: string;
  github?: string;
  linkdin?: string;
  author?: string;
  twiter?: string;
  profile?: string;
}

export default function Page() {
  const user: any = useUser((state) => state.user);
  const [isInstructor, setIsInstructor] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<InstructorData>({
    Name: '',
    Bio: '',
    instagram: '',
    github: '',
    linkdin: '',
    profile: '',
  });
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);

  useEffect(() => {
    if (user) {
      checkIfInstructor(user);
    }
  }, [user]);

  const checkIfInstructor = async (user: any) => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('instructor')
      .select('*')
      .eq('id', user.id);

    if (error) {
      console.error('Error checking if user is instructor:', error.message);
      setError('Failed to load instructor data');
      setIsLoading(false);
      return;
    }

    if (data.length > 0) {
      setIsInstructor(true);
      setInstructorData(data[0]);
      setFormData(data[0]); // Pre-populate form for editing
      if (data[0].profile) {
        setImagePreview(data[0].profile);
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // const result = await onUploadImageAction(formData);

      // if (result.success) {
      //   const imageUrl = result.data?.path;
      //   setFormData(prev => ({ ...prev, profile: imageUrl }));
      //   setImagePreview(imageUrl ?? null);
      // } else {
      //   throw new Error(result.message || 'Failed to upload image');
      // }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profile: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Update existing instructor
        const { error } = await supabase
          .from('instructor')
          .update(formData)
          .eq('id', user.id);

        if (error) throw error;

        setInstructorData(formData);
        setIsEditing(false);
      } else {
        // Insert new instructor
        const {data , error } = await supabase.from('instructor').insert([
          {
            id: user.id,
            ...formData,
          },
        ]);
        console.log("data", data)

        if (error) throw error;

        setIsInstructor(true);
        setInstructorData(formData);
      }

      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving instructor details:', error.message);
      setError('Failed to save instructor details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setError(null);
    setImagePreview(null);
    if (!showForm) {
      // Reset form when opening
      setFormData({
        Name: '',
        Bio: '',
        instagram: '',
        github: '',
        linkdin: '',
        profile: '',
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
    setError(null);
    // Form data is already populated from instructorData
    if (instructorData?.profile) {
      setImagePreview(instructorData.profile);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setError(null);
    setImagePreview(null);
    if (instructorData) {
      setFormData(instructorData); // Reset to original data
      if (instructorData.profile) {
        setImagePreview(instructorData.profile);
      }
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSocialLink = (platform: string, username?: string) => {
    if (!username) return '';
    
    switch (platform) {
      case 'github':
        return username.startsWith('http') ? username : `https://github.com/${username}`;
      case 'instagram':
        return username.startsWith('http') ? username : `https://instagram.com/${username}`;
      case 'linkedin':
        return username.startsWith('http') ? username : `https://linkedin.com/in/${username}`;
      default:
        return username;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isInstructor && instructorData && !showForm ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {instructorData.profile ? (
                      <img
                        src={instructorData.profile}
                        alt={instructorData.Name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {instructorData.Name}
                      </CardTitle>
                      <p className="text-blue-100 mt-1">Instructor Profile</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {instructorData.Bio || 'No bio provided'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['github', 'instagram', 'linkdin'] as const).map((platform) => {
                        const value = instructorData[platform];
                        if (!value) return null;

                        return (
                          <a
                            key={platform}
                            href={getSocialLink(platform, value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {getSocialIcon(platform)}
                            <span className="text-gray-700 capitalize">{platform}</span>
                            <span className="text-gray-500 text-sm truncate ml-auto">
                              {value}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                    
                    {!instructorData.github && !instructorData.instagram && !instructorData.linkdin && (
                      <p className="text-gray-500 text-center py-4">
                        No social links provided
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {!showForm ? (
              <Card className="text-center shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Become an Instructor
                    </h2>
                    <p className="text-gray-600">
                      Share your knowledge and expertise with students around the world
                    </p>
                  </div>
                  <Button onClick={toggleForm} size="lg" className="px-8">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {isEditing ? 'Edit Profile' : 'Create Instructor Profile'}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Upload Section */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Profile Image</Label>
                      <div className="flex flex-col items-center gap-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                              disabled={isUploadingImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        <p className="text-sm text-gray-500 text-center">
                          Upload a profile picture (max 5MB, JPG/PNG)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Name">Full Name *</Label>
                      <Input
                        type="text"
                        id="Name"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Bio">Bio *</Label>
                      <Textarea
                        id="Bio"
                        name="Bio"
                        value={formData.Bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself, your experience, and expertise..."
                        required
                        className="w-full min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Social Links (Optional)</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="github" className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub
                        </Label>
                        <Input
                          type="text"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          placeholder="username or full URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </Label>
                        <Input
                          type="text"
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          placeholder="username or full URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </Label>
                        <Input
                          type="text"
                          id="linkdin"
                          name="linkdin"
                          value={formData.linkdin}
                          onChange={handleInputChange}
                          placeholder="username or full URL"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading || isUploadingImage}
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading || isUploadingImage}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}