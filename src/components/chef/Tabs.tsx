"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/cheftabs";
import DishCard from "@/components/chef/DishCard";

export default function OrdersTabs() {
  return (
    <div className="w-full p-6 bg-white shadow-md rounded-xl">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200 rounded-lg">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="inpreparation">In Preparation</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Incoming Orders */}
        <TabsContent value="incoming">
          <div className="mt-4">
            <DishCard
              imageUrl="/images/order-history.jpg"
              foodName="Biriyani"
              description="Spicy and flavorful chicken biriyani."
              price="$12.99"
            />
          </div>
        </TabsContent>

        {/* In Preparation - No Data */}
        <TabsContent value="inpreparation">
          <div className="flex items-center justify-center h-40 text-gray-500">
            No In Preparation Orders
          </div>
        </TabsContent>

        {/* Completed - No Data */}
        <TabsContent value="completed">
          <div className="flex items-center justify-center h-40 text-gray-500">
            No Completed Orders
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}