"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/chefcard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/cheftabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ChefDashboard() {

  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    role: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/session");
        console.log(res)
        setUser(res.data);
      } catch (error) {
        console.error("Session fetch error:", error);
        router.push("/auth/login");
      }
    };
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <div className="min-h-screen bg-[#FFF8EF] px-6 md:px-12 lg:px-24 py-6">
        {/* Welcome Section */}
        <div className="mb-8 border-b border-gray-200 pb-4 text-center sm:text-right">
          <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user?.name}</h1>
        </div>
  
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-6">
            <Card>
              <CardHeader>Total No of Orders Received</CardHeader>
              <CardContent className="text-lg sm:text-2xl font-bold">10</CardContent>
            </Card>
            <Card>
              <CardHeader>Total No of Subscribers</CardHeader>
              <CardContent className="text-lg sm:text-2xl font-bold">10</CardContent>
            </Card>
          </div>
          <div className="flex flex-col space-y-6">
            <Card className="h-full">
              <CardHeader>Total Earnings</CardHeader>
              <CardContent className="text-lg border-b-2 mb-3">
                <p className="text-lg sm:text-2xl font-bold mb-3">$5000</p>
              </CardContent>
              <CardHeader>Last Payment Received</CardHeader>
              <CardContent className="text-lg">
                <p className="text-lg sm:text-2xl font-bold">$500</p>
              </CardContent>
            </Card>
          </div>
        </div>
  
        {/* Orders Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold my-5">Your Orders</h2>
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="flex flex-wrap justify-start gap-2 sm:gap-4">
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="inpreparation">In Preparation</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
  
            {/* Incoming Orders */}
            <TabsContent value="incoming">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded p-5">
                {[1].map((_, index) => (
                  <Card key={index} className="p-3 space-y-3">
                    <Image
                      src="/images/order-history.jpg"
                      alt="Dish Image"
                      width={150}
                      height={100}
                      className="rounded-lg w-full"
                    />
                    <CardHeader>Biryani</CardHeader>
                    <CardContent className="text-gray-600 text-sm sm:text-base">
                      Spicy and flavorful chicken biryani.
                    </CardContent>
                    <Button className="w-full text-xs sm:text-sm bg-orange-500 hover:bg-orange-600">
                      View More
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
  
            {/* In Preparation Orders */}
            <TabsContent value="inpreparation">
              <div className="flex items-center justify-center h-40 text-gray-500">
                No In Preparation Orders
              </div>
            </TabsContent>
  
            {/* Completed Orders */}
            <TabsContent value="completed">
              <div className="flex items-center justify-center h-40 text-gray-500">
                No Completed Orders
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
