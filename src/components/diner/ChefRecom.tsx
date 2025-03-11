"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample Chef Recommendations Data
const chefRecommendations = [
  {
    title: "Vegetarian Breakfast Service",
    imageUrl: "/images/chef-recom.jpg",
    description: "A delicious vegetarian breakfast with fresh ingredients.",
  },
  {
    title: "Authentic Italian Pasta",
    imageUrl: "/images/italian-cuisine.jpg",
    description: "Handmade pasta with rich Italian flavors.",
  },
  {
    title: "Indian Curry Special",
    imageUrl: "/images/american-cuisine.jpg",
    description: "Aromatic spices blended into a traditional Indian curry.",
  },
];

export default function ChefRecommendations() {
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
          {chefRecommendations.map((item, index) => (
            <SwiperSlide key={index} className="flex flex-col items-center">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={250}
                className="w-[600px] h-[207px] object-cover border rounded-xl mx-auto"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
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