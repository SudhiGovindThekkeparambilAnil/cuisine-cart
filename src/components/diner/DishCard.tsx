// components/diner/DishCard.tsx

"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface DishCardProps {
  dish: {
    _id: string;
    name: string;
    cuisine: string;
    price: number;
    photoUrl?: string;
  };
}

export default function DishCard({ dish }: DishCardProps) {
  return (
    <div className="flex border-b mb-4 pb-4">
      <div className="w-20 h-20 flex-shrink-0">
        <Image
          src={dish.photoUrl || "/placeholder.jpg"}
          alt={dish.name}
          width={80}
          height={80}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="space-y-1">
          <div>
            <span className="font-semibold">Dish Name:</span> {dish.name}
          </div>
          <div>
            <span className="font-semibold">Cuisine type:</span> {dish.cuisine}
          </div>
          <div>
            <span className="font-semibold">Price:</span> $
            {dish.price.toFixed(2)}
          </div>
        </div>
        <div className="mt-2">
          {/* <Button className="bg-[#F39C12] hover:bg-[#E67E22] text-white text-sm">
            View more
          </Button> */}
          <Link href={`/diner/dishes/${dish._id}`}>
            <Button className="text-sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
