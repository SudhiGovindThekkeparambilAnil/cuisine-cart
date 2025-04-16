"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeSessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const placeOrder = async () => {
      const isOrderCreated = localStorage.getItem("orderCreated");
      if (isOrderCreated === "true") {
        setLoading(false); // Prevent resubmission
        return;
      }

      try {
        const storedAddress = localStorage.getItem("selectedAddress");
        const storedItems = localStorage.getItem("orderItems");
        const totalAmount = localStorage.getItem("totalAmount");

        if (
          !storedAddress ||
          !storedItems ||
          !totalAmount ||
          !stripeSessionId
        ) {
          toast.error("Missing order details. Redirecting...");
          router.push("/diner/checkout");
          return;
        }

        localStorage.setItem("orderCreated", "true");

        const address = JSON.parse(storedAddress);
        const items = JSON.parse(storedItems);

        const res = await axios.post("/api/order", {
          address,
          paymentMethod: "card",
          items,
          totalAmount: JSON.parse(totalAmount),
        });

        if (res.status === 200) {
          toast.success("Payment successful! Order placed.");
          localStorage.removeItem("selectedAddress");
          localStorage.removeItem("orderItems");
          localStorage.removeItem("totalAmount");
        }
      } catch (err) {
        console.error("Order creation failed:", err);
        toast.error("Order creation failed.");
        // ❗ Optional: Roll back the flag if needed
        localStorage.removeItem("orderCreated");
      } finally {
        setLoading(false);
      }
    };

    placeOrder();
  }, [router, stripeSessionId]);

  return (
    <div className="max-w-xl mx-auto p-8 text-center bg-white border shadow-md mt-10 rounded-lg mb-8">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-green-600">
            Payment Successful
          </h1>
          <p className="mt-4 text-gray-700">
            Your order has been placed and is pending confirmation by the chef.
          </p>
          <button
            onClick={() => router.push("/diner/dashboard")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  );
}
