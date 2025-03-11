import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/chefcard";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DishCardProps {
  imageUrl: string;
  foodName: string;
  description: string;
  price: string;
}

export default function DishCard({ imageUrl, foodName, description, price }: DishCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <Image
        src={imageUrl}
        alt={foodName}
        width={300}
        height={200}
        className="w-full h-40 object-cover rounded-t-xl"
      />
      <CardHeader>
        <h3 className="text-lg font-semibold">{foodName}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
        <p className="font-bold text-orange-600 mt-2">{price}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-orange-500 hover:bg-orange-600">View More</Button>
      </CardFooter>
    </Card>
  );
}