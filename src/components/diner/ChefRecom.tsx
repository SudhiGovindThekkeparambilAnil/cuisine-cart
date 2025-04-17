"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";

interface MealPlan {
  _id: string;
  planName: string;
  planImage?: string;
  totalPrice: number;
}
export default function ChefRecommendations() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMealPlans() {
      try {
        const res = await fetch("/api/meal-plans");
        if (!res.ok) throw new Error("Failed to fetch meal plans");
        const data = await res.json();
        setMealPlans(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error loading meal plans."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMealPlans();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chef Recommendations</h2>
      <Card className="overflow-hidden relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="relative"
        >
          {mealPlans.map((plan) => (
            <SwiperSlide key={plan._id} className="flex flex-col items-center">
              {plan.planImage && (
                <Image
                  src={plan.planImage || "/placeholder.jpg"}
                  alt={plan.planName}
                  width={600}
                  height={250}
                  className="w-[600px] h-[207px] object-cover border rounded-xl mx-auto"
                />
              )}
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold">{plan.planName}</h3>
                <div className="flex justify-center mt-3">
                  <Button>
                    <Link href={`/diner/meal-plans/${plan._id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          className="swiper-button-prev absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-1 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-2" />
        </Button>
        <Button
          variant="ghost"
          className="swiper-button-next absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-1 h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
