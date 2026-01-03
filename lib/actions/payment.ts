"use server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const options = {
    amount: 300 * 100, // Amount in paise (300 INR)
    currency: "INR",
    receipt: `receipt_${user.id}_${Date.now()}`,
    notes: {
      userId: user.id,
      plan: "monthly_premium"
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order, user }; // Return user details for prefill
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET!;

  // Verify Signature
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return { success: false, error: "Payment verification failed" };
  }

  // Payment is valid, update Supabase
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Update user to premium
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_premium: true,
        premium_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
      })
      .eq("id", user.id);

    if (error) {
      console.error("Database update failed:", error);
      return { success: false, error: "Payment received but database update failed. Contact support." };
    }
  }

  revalidatePath("/steno"); // Refresh pages
  return { success: true };
}