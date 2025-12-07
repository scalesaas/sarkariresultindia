// app/dashboard/layout.tsx
"use client";
import React from "react";
import Navbar from "../navbar/navbar";
import PrivateRoute from "@/components/editor/PrivateRoute";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <section>
        <Navbar />
        {children}
      </section>
    </PrivateRoute>
  );
}