// src/app/diner/subscriptions/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Accordion from "@/components/ui/Accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface ModifierItem {
  title: string;
  price: number;
}

interface SlotData {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: Record<string, ModifierItem[]>;
  specialInstructions?: string;
  quantity: number;
  days: string[];
}

interface Subscription {
  _id: string;
  status: "pending" | "active" | "paused" | "cancelled";
  weeks: number;
  totalPrice: number;
  deliveryTime: string;
  stripeSessionId?: string;
  mealPlanId: {
    planName: string;
    planImage?: string;
    slots: Record<"breakfast" | "lunch" | "evening" | "dinner", SlotData>;
    totalPrice: number;
  };
  addressId: {
    type: string;
    buildingNumber?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };
}

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Subscription>(`/api/subscriptions/${id}`)
      .then(({ data }) => setSub(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/2" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (!sub) return <div className="p-6 text-center">Subscription not found.</div>;

  const { mealPlanId: plan, addressId: addr, status, weeks, totalPrice, deliveryTime } = sub;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{plan.planName}</h1>
        <span
          className={`px-3 py-1 rounded-full ${
            {
              pending: "bg-yellow-100 text-yellow-800",
              active: "bg-green-100 text-green-800",
              paused: "bg-blue-100 text-blue-800",
              cancelled: "bg-red-100 text-red-800",
            }[status]
          }`}>
          {status.toUpperCase()}
        </span>
      </div>

      {plan.planImage && (
        <div className="rounded-lg overflow-hidden">
          <Image
            src={plan.planImage}
            alt={plan.planName}
            width={800}
            height={400}
            className="w-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Subscription Details</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Weeks:</strong> {weeks}
          </p>
          <p>
            <strong>Delivery Time:</strong>{" "}
            {new Date(deliveryTime).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p>
            <strong>Total Price:</strong> ${totalPrice.toFixed(2)} CAD
          </p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Delivery Address</h2>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>
            <strong>{addr.type}:</strong>{" "}
            {[
              addr.buildingNumber,
              addr.street,
              addr.city,
              addr.state,
              addr.postalCode,
              addr.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          {addr.phoneNumber && (
            <p>
              <strong>Phone:</strong> {addr.phoneNumber}
            </p>
          )}
        </CardContent>
      </Card> */}

      <Accordion title="What’s in your plan?">
        {(["breakfast", "lunch", "evening", "dinner"] as const).map((key) => {
          const slot = plan.slots[key];
          if (!slot?.dish) return null;

          // calculate per-slot subtotal
          let addonTotal = 0;
          Object.values(slot.modifiers || {}).forEach((items) =>
            items.forEach((it) => (addonTotal += it.price))
          );
          const slotCost = (slot.dish.price + addonTotal) * slot.quantity * slot.days.length;

          return (
            <Card key={key} className="mb-4">
              <CardHeader>
                <h3 className="text-lg font-medium capitalize">{key}</h3>
                <p className="text-sm text-gray-500">Delivered on: {slot.days.join(", ")}</p>
              </CardHeader>
              <CardContent className="flex space-x-4">
                <div className="w-24 h-16 relative flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={slot.dish.photoUrl || "/placeholder.jpg"}
                    alt={slot.dish.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{slot.dish.name}</p>
                  <p className="text-sm text-gray-600">
                    ${slot.dish.price.toFixed(2)} × {slot.quantity} × {slot.days.length} days
                  </p>
                  {slot.modifiers && (
                    <div className="mt-2">
                      {Object.entries(slot.modifiers).map(([title, items]) => (
                        <div key={title}>
                          <p className="text-sm font-medium">{title}:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {items.map((it, i) => (
                              <li key={i}>
                                {it.title} (+${it.price.toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {slot.specialInstructions && (
                    <p className="mt-2 text-sm">
                      <em>Notes:</em> {slot.specialInstructions}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <p className="font-semibold">Subtotal: ${slotCost.toFixed(2)} CAD</p>
              </CardFooter>
            </Card>
          );
        })}
      </Accordion>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            axios.delete(`/api/subscriptions/${id}`).then(() => router.push("/diner/dashboard"))
          }>
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
}
