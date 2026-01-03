"use client";

import React, { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createRazorpayOrder, verifyPayment } from "@/lib/actions/payment"; // Make sure this path is correct
import { toast } from "sonner";
import { 
  Check, 
  ShieldCheck, 
  Mic, 
  BookOpen, 
  Briefcase, 
  Newspaper, 
  CalendarDays,
  Loader2
} from "lucide-react";

interface PricingCardProps {
  user: any; // Or type 'User' from @supabase/supabase-js
}

export default function PricingCard({ user }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Auth Check
      if (!user) {
        toast.error("Please login to upgrade to Premium");
        router.push("/login?next=/pricing");
        return;
      }

      // 2. Create Order on Server
      const result = await createRazorpayOrder();
      
      if (!result.success || !result.order) {
        toast.error(result.error || "Failed to initiate payment");
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "Steno Academy",
        description: "Premium Monthly Subscription",
        order_id: result.order.id,
        prefill: {
            email: user.email,
            contact: user.phone, // Optional: if you have it
        },
        theme: {
            color: "#2563EB"
        },
        handler: async function (response: any) {
          // 4. Verify Payment on Server
          const verifyResult = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyResult.success) {
            toast.success("Payment Successful! Welcome to Premium.");
            router.push("/steno");
          } else {
            toast.error("Payment verification failed.");
          }
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Script only where needed */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="w-full max-w-md mx-auto lg:mx-0 bg-white rounded-2xl shadow-xl border-2 border-blue-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          MONTHLY PLAN
        </div>

        <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-blue-50/50 to-white">
          <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-2">All-Access Pass</h3>
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-4xl font-bold text-slate-900">₹300</span>
            <span className="text-gray-500 self-end mb-1">/ month</span>
          </div>
          <p className="text-sm text-blue-700 font-medium bg-blue-100 inline-block px-3 py-1 rounded-full">
            Just ₹10 per day
          </p>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            {[
              { icon: Mic, text: "Unlimited Steno Dictations" },
              { icon: BookOpen, text: "Access to All Premium Courses" },
              { icon: Briefcase, text: "Priority Job Alerts" },
              { icon: Newspaper, text: "Daily Editorial Analysis" },
              { icon: CalendarDays, text: "Cancel Anytime" },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700">
                <div className="mt-0.5 p-1 bg-blue-100 text-blue-600 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
                "Start Premium Now"
            )}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure Payment via UPI / Card
          </p>
        </div>
      </div>
    </>
  );
}