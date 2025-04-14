// app/diner/checkout-success/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CheckoutSuccessClient = dynamic(() => import("./checkoutSuccessClient"), {
  ssr: false,
});

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
