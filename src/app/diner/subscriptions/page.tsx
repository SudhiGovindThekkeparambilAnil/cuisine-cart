// src/app/diner/subscriptions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionSummary {
  _id: string;
  status: "pending" | "active" | "paused" | "cancelled";
  weeks: number;
  totalPrice: number;
  nextDelivery: string; // you’ll need to populate this in your API
  mealPlanId: {
    _id: string;
    planName: string;
    planImage?: string;
  };
}

export default function SubscriptionListPage() {
  const [subs, setSubs] = useState<SubscriptionSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get<SubscriptionSummary[]>("/api/subscriptions")
      .then((res) => setSubs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
      </div>
    );
  }

  if (!subs || subs.length === 0) {
    return <div className="p-6 text-center text-gray-600">You have no active subscriptions.</div>;
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {subs.map((s) => (
        <Card key={s._id} className="flex flex-col">
          {s.mealPlanId.planImage && (
            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
              <Image
                src={s.mealPlanId.planImage}
                alt={s.mealPlanId.planName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <h2 className="text-xl font-semibold">{s.mealPlanId.planName}</h2>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                {
                  pending: "bg-yellow-100 text-yellow-800",
                  active: "bg-green-100 text-green-800",
                  paused: "bg-blue-100 text-blue-800",
                  cancelled: "bg-red-100 text-red-800",
                }[s.status]
              }`}>
              {s.status.toUpperCase()}
            </span>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <p>
              <strong>Weeks:</strong> {s.weeks}
            </p>
            <p>
              <strong>Next Delivery:</strong> {new Date(s.nextDelivery).toLocaleDateString()}
            </p>
            <p>
              <strong>Total:</strong> ${s.totalPrice.toFixed(2)} CAD
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/diner/subscriptions/${s._id}`)}>
              View
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm("Cancel this subscription?")) return;
                await axios.delete(`/api/subscriptions/${s._id}`);
                setSubs((prev) => prev?.filter((x) => x._id !== s._id) || null);
              }}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
