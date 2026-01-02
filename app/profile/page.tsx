import React from 'react';
import Navbar from '../navbar/navbar';
import { getProfile , updateProfile } from '@/lib/actions/blog';
import UserProfile from '@/components/ProfileComponent';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* We pass the server actions as props to the client component */}
        <UserProfile 
          getProfileAction={getProfile} 
          updateProfileAction={updateProfile} 
        />
      </div>
    </div>
  );
}