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
// Sample Data
const orderHistory = [
  {
    itemName: "Biryani",
    chefName: "Mohammed",
    quantity: 1,
    imageUrl: "/images/order-history.jpg",
  },
  {
    itemName: "Breakfast Service",
    chefName: "Mohammed",
    quantity: 1,
    imageUrl: "/images/chef-recom.jpg",
  },
];

interface Dish {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  // Add other properties relevant to your dish
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    role: string;
    name: string;
  } | null>(null);

  const [favoriteDishes, setFavoriteDishes] = useState<any[]>([]);

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
    fetchUser();
    fetchFavorites();
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
          <Card className="overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Image Container - Makes it Responsive */}
              <div className="w-full lg:w-2/5 relative">
                <div className="w-full h-full">
                  <Image
                    src="/images/sub-plan.jpg"
                    alt="Indian Food"
                    width={200}
                    height={200}
                    className=" w-full h-[200px] md:h-full object-cover border rounded-xl"
                  />
                </div>
              </div>

              {/* Subscription Details */}
              <div className="p-4 flex-1">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Chef Name:</span> Prasanth
                    Food Services
                  </div>
                  <div>
                    <span className="font-semibold">Subscription type:</span>{" "}
                    Weekly
                  </div>
                  <div>
                    <span className="font-semibold">Subscription details:</span>{" "}
                    (Mon - Fri) included
                  </div>
                  <div>15 Rotis & Paneer or Dal of your choice.</div>
                  <div>
                    <span className="font-semibold">Price:</span> 38$ (weekly)
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button className="w-full text-xs sm:text-sm bg-[#F39C12] hover:bg-[#E67E22] text-white">
                      View Subscription
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm border-[#F39C12] text-[#F39C12] hover:bg-[#FFF8EF] hover:text-[#E67E22]"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chef Recommendations */}
        <ChefRecommendations />
      </div>

      {/* Order History & Favorite Chefs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          <Card className="p-4 max-h-72 sm:max-h-80 overflow-y-auto">
            {orderHistory.map((order, index) => (
              <HistoryCard key={index} {...order} />
            ))}
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Favourite Dish</h2>
          <Card className="p-4 max-h-72 sm:max-h-80 overflow-y-auto">
            {favoriteDishes.length === 0 ? (
              <p>No favorite dishes yet</p>
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
