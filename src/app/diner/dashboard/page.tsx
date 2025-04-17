"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HistoryCard from "@/components/diner/HistoryCard";
import ChefRecommendations from "@/components/diner/ChefRecom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DishCard from "@/components/diner/DishCard";
import jwt from "jsonwebtoken";

interface OrderItem {
  itemName: string;
  chefName: string;
  quantity: number;
  imageUrl: string;
  orderId: string;
}
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    role: string;
    name: string;
  } | null>(null);

  const [favoriteDishes, setFavoriteDishes] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderItem[]>([]);
  const [subs, setSubs] = useState<SubscriptionSummary[] | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/session");

        console.log(res);
        setUser(res.data);
      } catch (error) {
        console.error("Session fetch error:", error);
        router.push("/auth/login");
      }
    };

    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken: any = jwt.decode(token);

        const res = await axios.get<SubscriptionSummary[]>(
          "/api/subscriptions"
        );
        setSubs(res.data);
      } catch (err) {
        console.error("Failed to load subscription:", err);
      }
    };

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        // Check if token is not null
        if (token) {
          const decodedToken: any = jwt.decode(token); // Decode token to get the user id
          const userId = decodedToken.id;

          // Make the request with the userId in the URL
          const res = await axios.get(`/api/diner-dishes/${userId}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFavoriteDishes(res.data.dishes || []);
        } else {
          console.error("No token found. Please log in.");
          router.push("/auth/login"); // Redirect if token is missing
        }
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      }
    };
    const fetchOrderHistory = async () => {
      try {
        const res = await axios.get("/api/order");
        const data = res.data;

        // Flatten and transform orders to match HistoryCard props
        const transformed = data.flatMap((order: any) =>
          order.items.map((item: any) => ({
            itemName: item.name,
            chefName: item.chefId?.name || "Unknown Chef",
            quantity: item.quantity,
            imageUrl: item.photoUrl || "/placeholder.jpg",
            orderId: order._id,
          }))
        );

        setOrderHistory(transformed);
      } catch (error) {
        console.error("Error loading order history:", error);
      }
    };
    fetchUser();
    fetchSubscription();
    fetchFavorites();
    fetchOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8EF] p-6 md:px-12 lg:px-24 py-6">
      {/* Welcome Section */}
      <div className="mb-8 border-b border-gray-200 pb-4 text-right">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Subscription Plan */}
        <div>
          <h2 className="text-xl font-bold mb-4">Subscription Plan</h2>
          <Card className="h-80 sm:max-h-96 overflow-y-auto">
            {subs && subs.length > 0 ? (
              subs?.map((s) => (
                <div key={s._id} className="flex flex-col lg:flex-row">
                  {s.mealPlanId.planImage && (
                    <div className="w-full lg:w-2/5 relative">
                      <div className="w-full h-full">
                        <Image
                          src={s.mealPlanId.planImage}
                          alt={s.mealPlanId.planName}
                          width={200}
                          height={200}
                          className=" w-full h-[200px] md:h-full object-cover border rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  {/* Subscription Details */}
                  <div className="p-4 flex-1">
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Meal Plan: </span>
                        {s.mealPlanId.planName}
                      </div>
                      <div>
                        <span className="font-semibold">Status: </span>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            {
                              pending: "bg-yellow-100 text-yellow-800",
                              active: "bg-green-100 text-green-800",
                              paused: "bg-blue-100 text-blue-800",
                              cancelled: "bg-red-100 text-red-800",
                            }[s.status]
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Weeks: </span>
                        {s.weeks}
                      </div>
                      <div>
                        <span className="font-semibold">Next Delivery: </span>

                        {new Date(s.nextDelivery).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Total:</span> $
                        {s.totalPrice.toFixed(2)} CAD
                      </div>
                      <div className="pt-2 space-y-2">
                        <Button
                          className="w-full text-xs sm:text-sm"
                          variant="default"
                          onClick={() =>
                            router.push(`/diner/subscriptions/${s._id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          className="w-full text-xs sm:text-sm"
                          variant="outline"
                          onClick={async () => {
                            if (!confirm("Cancel this subscription?")) return;
                            await axios.delete(`/api/subscriptions/${s._id}`);
                            setSubs(
                              (prev) =>
                                prev?.filter((x) => x._id !== s._id) || null
                            );
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                You have no subscription.
              </div>
            )}{" "}
          </Card>
        </div>
        {/* Chef Recommendations */}
        <ChefRecommendations />
      </div>

      {/* Order History & Favorite Chefs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          <Card className="p-4 h-48 sm:max-h-80 overflow-y-auto">
            {orderHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                No order history found
              </div>
            ) : (
              orderHistory.map((order, index) => (
                <HistoryCard key={index} {...order} />
              ))
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Favourite Dish</h2>
          <Card className="p-4 h-48 sm:max-h-80 overflow-y-auto">
            {favoriteDishes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                No favorite dishes yet
              </div>
            ) : (
              favoriteDishes.map((dish, index) => (
                <DishCard key={index} dish={dish} />
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
