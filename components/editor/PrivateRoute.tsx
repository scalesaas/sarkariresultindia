// components/PrivateRoute.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/store/user";
import PublicLanding from "../PublicLanding";

// 1. Explicitly define children in the interface
interface PrivateRouteProps {
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}

// 2. Use the interface to type the component
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, fallback }) => {
  const user = useUser((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not logged in, show the landing page
  if (!user?.id) {
    return fallback ? <>{fallback}</> : <PublicLanding />;
  }

  return <>{children}</>;
};

export default PrivateRoute;