// src/app/chef/subscriptions/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "pending" | "active" | "paused" | "cancelled";

interface SlotData {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: { [title: string]: { title: string; price: number }[] };
  specialInstructions?: string;
  quantity?: number;
  days?: string[];
}

interface SubscriptionDetail {
  _id: string;
  status: Status;
  weeks: number;
  totalPrice: number;
  deliveryTime: string;
  mealPlan: {
    _id: string;
    planName: string;
    planImage?: string;
    slots: {
      breakfast?: SlotData;
      lunch?: SlotData;
      evening?: SlotData;
      dinner?: SlotData;
    };
  };
  diner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  address: {
    _id?: string;
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

export default function ChefSubscriptionDetailPage() {
  const { id } = useParams() as { id: string };
  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [newStatus, setNewStatus] = useState<Status>("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get<SubscriptionDetail>(`/api/chef/subscriptions/${id}`)
      .then((res) => {
        setSub(res.data);
        setNewStatus(res.data.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading…</div>;
  if (!sub) return <div className="p-4 text-red-600 text-center">Subscription not found</div>;

  const updateStatus = async () => {
    if (newStatus === sub.status) return;
    await axios.patch(`/api/chef/subscriptions/${id}`, { status: newStatus });
    router.refresh();
    toast.success(`Subscription Status Updated!`);
  };

  const renderSlot = (key: keyof SubscriptionDetail["mealPlan"]["slots"]) => {
    const slot = sub.mealPlan.slots[key];
    if (!slot || !slot.dish) return null;
    return (
      <div key={key} className="bg-white rounded-lg shadow p-6 space-y-3">
        <h3 className="text-lg font-semibold capitalize">{key}</h3>
        <div className="flex items-center space-x-4">
          <Image
            src={slot.dish.photoUrl || "/placeholder.jpg"}
            alt={slot.dish.name}
            width={96}
            height={96}
            className="rounded-lg object-cover object-center"
          />
          <div>
            <p className="text-lg font-medium">{slot.dish.name}</p>
            <p className="text-md text-gray-600">${slot.dish.price.toFixed(2)}</p>
          </div>
        </div>
        {slot.days && (
          <p className="text-sm text-gray-700">
            <strong>Days:</strong> {slot.days.join(", ")}
          </p>
        )}
        {slot.quantity && (
          <p className="text-sm text-gray-700">
            <strong>Qty/day:</strong> {slot.quantity}
          </p>
        )}
        {slot.modifiers &&
          Object.entries(slot.modifiers).map(([title, items]) => (
            <div key={title} className="text-sm text-gray-700">
              <p className="font-medium">{title}:</p>
              <ul className="list-disc list-inside ml-4">
                {items.map((it, i) => (
                  <li key={i}>
                    {it.title} (+${it.price.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {slot.specialInstructions && (
          <p className="text-sm text-gray-700">
            <strong>Notes:</strong> {slot.specialInstructions}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="pt-16 p-4 sm:p-8 max-w-4xl mx-auto space-y-8 bg-gray-50">
      {/* ← Back */}
      <Button variant="outline" onClick={() => router.back()}>
        ← Back
      </Button>

      {/* Hero */}
      {sub.mealPlan.planImage && (
        <div className="relative w-full h-56 sm:h-80 rounded-lg overflow-hidden shadow mb-4">
          <Image
            src={sub.mealPlan.planImage}
            alt={sub.mealPlan.planName}
            fill
            className="object-cover object-center"
          />
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
        {sub.mealPlan.planName}
      </h1>

      {/* Diner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-3 sm:space-y-0">
        {sub.diner.profileImage && (
          <Image
            src={sub.diner.profileImage}
            alt={sub.diner.name}
            width={72}
            height={72}
            className="rounded-full shadow"
          />
        )}
        <div className="text-center sm:text-left">
          <p className="text-xl font-semibold">{sub.diner.name}</p>
          <p className="text-sm text-gray-600">{sub.diner.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white rounded-lg shadow p-6 text-center">
        <div>
          <p className="text-gray-500 uppercase text-sm">Weeks</p>
          <p className="text-2xl font-semibold">{sub.weeks}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase text-sm">Next Delivery</p>
          <p className="text-2xl font-semibold">
            {new Date(sub.deliveryTime).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div>
          <p className="text-gray-500 uppercase text-sm">Total (CAD)</p>
          <p className="text-2xl font-semibold">${sub.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
        <div className="space-y-1 text-gray-700">
          <p className="capitalize font-medium">{sub.address.type} Address</p>
          <p>
            {sub.address.buildingNumber ? `${sub.address.buildingNumber}, ` : ""}
            {sub.address.street}
          </p>
          <p>
            {sub.address.city}, {sub.address.state} {sub.address.postalCode}
          </p>
          <p>{sub.address.country}</p>
          {sub.address.phoneNumber && <p>☎ {sub.address.phoneNumber}</p>}
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Meal Details</h2>
        {(
          ["breakfast", "lunch", "evening", "dinner"] as Array<
            keyof SubscriptionDetail["mealPlan"]["slots"]
          >
        ).map(renderSlot)}
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
        <div className="flex-1 flex items-center">
          <label htmlFor="statusSelect" className="mr-3 font-medium">
            Change Status:
          </label>
          <select
            id="statusSelect"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Status)}
            className="border rounded p-2 w-full sm:w-auto">
            {(["pending", "active", "paused", "cancelled"] as Status[]).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={updateStatus}>Save</Button>
      </div>
    </div>
  );
}
