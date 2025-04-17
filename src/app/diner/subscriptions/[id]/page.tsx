"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function SubscriptionDetail() {
  const { id } = useParams();
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/subscriptions/${id}`).then(({ data }) => setSub(data));
  }, [id]);

  if (!sub) return <div>Loading…</div>;
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Subscription {sub._id}</h1>
      <p>Status: {sub.status}</p>
      <p>Meal Plan: {sub.mealPlanId.planName}</p>
      <p>Weeks: {sub.weeks}</p>
      <p>Delivery Time: {sub.deliveryTime}</p>

      <Button
        variant="destructive"
        onClick={() => {
          axios.delete(`/api/subscriptions/${id}`).then(() => window.location.reload());
        }}>
        Cancel Subscription
      </Button>
    </div>
  );
}
