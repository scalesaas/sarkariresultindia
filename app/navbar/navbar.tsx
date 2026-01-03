"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/store/user";
import Logout from "@/components/logout";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Bell, 
  Briefcase, 
  Newspaper, 
  BookOpen, 
  Mic, 
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
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
  const [profile, setProfile] = useState<any>(null);

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data } = await getProfile(user.id);
          if (data) setProfile(data);
        } catch (error) {
          console.error("Error fetching navbar profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user?.id]);

  // 2. Smart Scroll Detection (Hides navbar on scroll down, shows on scroll up)
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

  // Navigation Items
  const navigation = [
    { name: "Articles", href: "/articles", icon: <BookOpen className="w-4 h-4" /> },
    { name: "News", href: "/news", icon: <Newspaper className="w-4 h-4" /> },
    { name: "Stenography", href: "/stenography", icon: <Mic className="w-4 h-4" /> },
    { name: "Jobs", href: "/jobs", icon: <Briefcase className="w-4 h-4" /> },
  ];

  // 3. Render Profile Image Helper
  const renderProfileImage = () => {
    if (profile?.profile_image) {
      return (
        <img 
          src={profile.profile_image} 
          alt="Profile" 
          className="h-full w-full object-cover"
        />
      );
    }
    
    // Fallback: Initials with Amber Theme
    const displayName = profile?.name  || user?.email || "U";
    const initial = displayName.charAt(0).toUpperCase();
    
    return (
      <div className="h-full w-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white text-lg font-bold">
        {initial}
      </div>
    );
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 md:h-20">
            
            {/* --- 1. BRAND LOGO (Text Based) --- */}
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center group">
                <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-black transition-colors">
                  Preparely
                  <span className="text-amber-500 text-3xl leading-none">.</span>
                </span>
              </Link>

              {/* --- 2. DESKTOP NAVIGATION --- */}
              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link 
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? "bg-amber-50 text-amber-700 font-semibold" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}
                      `}
                    >
                      {/* Icon colored only when active or hovered */}
                      <span className={isActive ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* --- 3. RIGHT ACTIONS --- */}
            <div className="flex items-center gap-3 md:gap-4">
              
              {/* Notifications */}
              <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all hidden sm:block relative group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </button>

              {user?.id ? (
                /* --- LOGGED IN USER --- */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 md:h-11 md:w-11 rounded-full overflow-hidden border-2 border-white ring-2 ring-gray-100 hover:ring-amber-200 transition-all shadow-sm">
                      {renderProfileImage()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 shadow-xl border-slate-100 rounded-xl" align="end">
                    <DropdownMenuLabel className="px-3 py-3 bg-slate-50 rounded-lg mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {profile?.name || user?.email?.split('@')[0] || "Learner"}
                      </p>
                      <p className="text-xs text-slate-500 truncate font-normal">{user.email}</p>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-amber-50 focus:text-amber-700 py-2.5">
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-amber-50 focus:text-amber-700 py-2.5">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Study Dashboard
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    
                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg cursor-pointer py-2.5">
                       <div className="flex items-center gap-2 w-full">
                         <LogOut className="w-4 h-4" />
                         <Logout /> {/* Assuming Logout is a component that handles the action */}
                       </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* --- GUEST USER --- */
                <Link href="/login">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-full h-10 shadow-md shadow-slate-200 transition-transform active:scale-95">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* --- MOBILE NAVIGATION DRAWER --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-2 shadow-xl absolute w-full">
            <div className="flex flex-col p-4 space-y-1">
              {navigation.map((item) => {
                 const isActive = pathname.startsWith(item.href);
                 return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 text-base font-medium rounded-xl transition-colors
                      ${isActive ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                    `}
                  >
                    <div className={`${isActive ? "text-amber-600" : "text-slate-400"}`}>
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                 );
              })}
              
              {!user?.id && (
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg font-bold shadow-lg shadow-amber-100">
                      Join Preparely Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-20" /> 
    </>
  );
}