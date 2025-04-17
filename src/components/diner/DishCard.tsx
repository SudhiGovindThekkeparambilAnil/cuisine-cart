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
    <div className="flex flex-col sm:flex-row border-b mb-4 pb-4 items-center sm:items-start gap-4 w-full">
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src={dish.photoUrl || "/placeholder.jpg"}
          alt={dish.name}
          width={80}
          height={80}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex-1 w-full">
        <div className="space-y-1 text-center sm:text-left">
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
        <div className="flex justify-center sm:justify-start gap-2 mt-3 flex-wrap">
          <Link href={`/diner/dishes/${dish._id}`}>
            <Button className="text-sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
