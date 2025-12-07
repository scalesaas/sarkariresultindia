"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/store/user";
import Profile from "./profile";
import Logout from "@/components/logout";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation'
import logo from "../../public/logoashish.png";
import Image from "next/image";
import { Menu, X } from "lucide-react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useUser((state) => state.user);

  useEffect(() => {
    const userLoggedIn = user?.id ? true : false; // Fixed logic - if user has id, they're logged in
    setIsLoggedIn(userLoggedIn); 
  }, [user]);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show navbar at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 w-full fixed transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex md:ml-0  ml-14 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="logo"
                  height={120}
                  width={120}
                  className="h-14 invert w-16 md:h-14 md:w-28"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/courses" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-lg font-medium transition-colors duration-200"
              >
                Courses
              </Link>
              <Link 
                href="/blogs" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-lg font-medium transition-colors duration-200"
              >
                Blogs
              </Link>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center">
              {user?.id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button  className=" h-14 w-14 rounded-full">
                      <Profile  />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={pathname === '/profile' ? '/dashboard' : '/profile'} className="w-full">
                        {pathname === '/profile' ? 'Dashboard' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={pathname === '/' ? '/dashboard' : '/'} className="w-full">
                        {pathname === '/' ? 'Dashboard' : 'Home'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/login" className="w-full text-red-600">
                        <Logout />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="text-gray-700 hover:text-blue-600 hover:border-blue-600">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile User Profile (if logged in) */}
              {user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button   className="h-8 w-8 rounded-full">
                      <Profile />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={pathname === '/profile' ? '/dashboard' : '/profile'} className="w-full">
                        {pathname === '/profile' ? 'Dashboard' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={pathname === '/' ? '/dashboard' : '/'} className="w-full">
                        {pathname === '/' ? 'Dashboard' : 'Home'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/login" className="w-full text-red-600">
                        <Logout />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMobileMenu}
                className="h-8 w-8 p-0"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link 
                href="/courses" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Courses
              </Link>
              <Link 
                href="/blogs" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Blogs
              </Link>
              
              {/* Mobile Login Button (if not logged in) */}
              {!user?.id && (
                <div className="pt-2 border-t border-gray-200">
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-base font-medium text-orange-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    Login
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