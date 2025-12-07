// components/PrivateRoute.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/store/user";
import { PersonIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivateRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, fallback }) => {
  const user = useUser((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for the user state to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show fallback or default login prompt
  if (!user?.id) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
              <LockClosedIcon className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Access Restricted
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              You need to be signed in to access this page
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <PersonIcon className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="text-gray-600">Please sign in to continue</p>
            </div>
            
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors duration-200">
                  Sign In
                </Button>
              </Link>
              
              <Link href="/" className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg transition-colors duration-200"
                >
                  Go to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default PrivateRoute;