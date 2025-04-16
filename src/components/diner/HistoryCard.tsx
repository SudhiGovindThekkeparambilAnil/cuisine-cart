import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HistoryCardProps {
  itemName: string;
  chefName: string;
  quantity: number;
  imageUrl: string;
  orderId: string;
}

export default function HistoryCard({
  itemName,
  chefName,
  quantity,
  imageUrl,
  orderId,
}: HistoryCardProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row border-b mb-4 pb-4 items-center sm:items-start gap-4 w-full">
      {/* Image Section */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={itemName}
          width={100}
          height={100}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Info & Buttons */}
      <div className="flex-1 w-full">
        {/* Item Details */}
        <div className="space-y-1 text-center sm:text-left">
          <div>
            <span className="font-semibold">Item Name:</span> {itemName}
          </div>
          <div>
            <span className="font-semibold">Chef Name:</span> {chefName}
          </div>
          <div>
            <span className="font-semibold">Qty:</span> {quantity}
          </div>
        </div>

        {/* Buttons - Inline & Responsive */}
        <div className="flex justify-center sm:justify-start gap-2 mt-3 flex-wrap">
          <Button
            className="bg-[#F39C12] hover:bg-[#E67E22] text-white text-sm"
            onClick={() => router.push(`/diner/order/${orderId}`)}
          >
            View more
          </Button>
        </div>
      </div>
    </div>
  );
}
