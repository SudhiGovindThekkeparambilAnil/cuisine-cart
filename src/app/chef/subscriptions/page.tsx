// src/app/chef/subscriptions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

type Status = "pending" | "active" | "paused" | "cancelled";
const ALL: Status | "all" = "all";

interface SubscriptionSummary {
  _id: string;
  status: Status;
  weeks: number;
  totalPrice: number;
  nextDelivery: string;
  mealPlan: {
    _id: string;
    planName: string;
    planImage?: string;
  };
  diner: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

export default function ChefSubscriptionListPage() {
  const [subs, setSubs] = useState<SubscriptionSummary[]>([]);
  const [filter, setFilter] = useState<Status | "all">(ALL);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    axios
      .get<SubscriptionSummary[]>("/api/chef/subscriptions")
      .then((res) => setSubs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // combine status & search filtering
  const filtered = subs
    .filter((s) => (filter === ALL ? true : s.status === filter))
    .filter(
      (s) =>
        s.mealPlan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.diner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Subscriptions</h1>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by plan or diner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring"
        />

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "active", "paused", "cancelled"] as (Status | "all")[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition 
                ${
                  filter === st
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 ? (
        <p className="text-gray-600">No subscriptions match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((s) => (
            <div key={s._id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
              {/* Cover Image */}
              {s.mealPlan.planImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={s.mealPlan.planImage}
                    alt={s.mealPlan.planName}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col">
                {/* Title & Diner */}
                <h2 className="text-lg font-semibold">{s.mealPlan.planName}</h2>
                <div className="flex items-center space-x-2 mt-1 text-gray-500">
                  {s.diner.profileImage && (
                    <Image
                      src={s.diner.profileImage}
                      alt={s.diner.name}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm">Diner: {s.diner.name}</span>
                </div>

                {/* Stats */}
                <div className="mt-4 space-y-1 flex-1 text-gray-700 text-sm">
                  <p>
                    <strong>Weeks:</strong> {s.weeks}
                  </p>
                  <p>
                    <strong>Next Delivery:</strong> {new Date(s.nextDelivery).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Total:</strong> ${s.totalPrice.toFixed(2)} CAD
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <Button onClick={() => router.push(`/chef/subscriptions/${s._id}`)}>View</Button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      {
                        pending: "bg-yellow-100 text-yellow-800",
                        active: "bg-green-100 text-green-800",
                        paused: "bg-blue-100 text-blue-800",
                        cancelled: "bg-red-100 text-red-800",
                      }[s.status]
                    }`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
