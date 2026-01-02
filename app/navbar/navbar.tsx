"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/store/user";
import Logout from "@/components/logout";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation'
import logo from "../../public/logoashish.png";
import Image from "next/image";
import { Menu, X, Bell, Briefcase, Newspaper, FileText } from "lucide-react";
import { getProfile } from "@/lib/actions/blog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const user = useUser((state) => state.user);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State to hold the fetched profile data (image, name, etc.)
  const [profile, setProfile] = useState<any>(null);

  // 1. Fetch Profile Data when User ID is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data } = await getProfile(user.id);
          console.log("Navbar profile data:", data);
          if (data) {
            setProfile(data);
          }
        } catch (error) {
          console.error("Error fetching navbar profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Scroll detection
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) setIsVisible(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 100) setIsVisible(false);
      else if (currentScrollY < lastScrollY) setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const navigation = [
    { name: "Articles", href: "/articles", icon: <FileText className="w-4 h-4" /> },
    { name: "News", href: "/news", icon: <Newspaper className="w-4 h-4" /> },
    { name: "Jobs", href: "/jobs", icon: <Briefcase className="w-4 h-4" /> },
  ];

  // 2. Updated Logic: Prioritize Profile Table Image -> Auth Image -> Initials
  const renderProfileImage = () => {
    // Check Profile Table Image first
    if (profile?.profile_image) {
      return (
        <img 
          src={profile.profile_image} 
          alt="Profile" 
          className="h-full w-full object-cover"
        />
      );
    }
    
    // // Fallback to Auth Image (e.g., Google Auth)
    // if (user?.image) {
    //   return (
    //     <img 
    //       src={user.image} 
    //       alt="Profile" 
    //       className="h-full w-full object-cover"
    //     />
    //   );
    // }

    // Fallback: Initials
    const displayName = profile?.name  || user?.email || "U";
    const initial = displayName.charAt(0).toUpperCase();
    
    return (
      <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold uppercase">
        {initial}
      </div>
    );
  };

  return (
    <div className={`z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 w-full fixed transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full shadow-lg'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src={logo}
                alt="Preparely Logo"
                height={50}
                width={150}
                className="h-10 w-auto md:h-12 invert"
              />
            </Link>

            {/* Desktop Center Navigation */}
            <div className="hidden md:flex items-center ml-10 space-x-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    pathname.startsWith(item.href) 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-5">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>

            {user?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-blue-50 shadow-sm hover:ring-4 hover:ring-blue-100 transition-all">
                    {renderProfileImage()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 p-2" align="end">
                  <DropdownMenuLabel className="px-2 py-3">
                    {/* Show Profile Name if available, otherwise fallback */}
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {profile?.name || user?.email || "Student"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard">Study Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 rounded-lg cursor-pointer">
                    <Logout />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-full shadow-lg shadow-blue-100">
                  Join Free
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 gap-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              {!user?.id && (
                <div className="pt-4 px-4">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 py-6 text-lg font-bold">Sign In to Start</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}