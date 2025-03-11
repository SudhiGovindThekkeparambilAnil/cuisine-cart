import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ChefCardProps {
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
}

export default function ChefCard({ name, cuisine, rating, imageUrl }: ChefCardProps) {
  return (
    <div className="flex border-b mb-4 pb-4">
      <div className="w-20 h-20 flex-shrink-0">
        <Image src={imageUrl} alt={name} width={80} height={80} className="w-full h-full object-cover rounded-md" />
      </div>
      <div className="ml-4 flex-1">
        <div className="space-y-1">
          <div><span className="font-semibold">Chef Name:</span> {name}</div>
          <div><span className="font-semibold">Cuisine type:</span> {cuisine}</div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Rating:</span>
            <div className="flex text-[#F39C12]">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < rating ? "text-[#F39C12]" : "text-gray-300"}>★</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <Button className="bg-[#F39C12] hover:bg-[#E67E22] text-white text-sm">View more</Button>
        </div>
      </div>
    </div>
  );
}