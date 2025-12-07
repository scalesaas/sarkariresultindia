"use client"
import React from 'react'
import { useUser } from '@/lib/store/user'
import Image from  "next/image"
export default function profile() {
    const user = useUser((state) => state.user);

    if (!user || !user.user_metadata) {
        return <div>Loading...</div>; // Handle loading state or error if user data is not available
      }
  return (
   <Image
   src={user?.user_metadata.avatar_url}
   alt ={user?.user_metadata.user_name}
   width={60}
   height={60}
   className='rounded-full flex ring-2 justify-center items-center md:mr-10 ring-slate-500'
   />
  )
}
