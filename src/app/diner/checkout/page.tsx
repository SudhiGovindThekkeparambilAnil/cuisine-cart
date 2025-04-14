"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Address {
  type: string;
  buildingNumber?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export default function CheckoutForm() {
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [totalAmount, settotalAmount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get("/api/auth/session");
        if (data?.addresses?.length) {
          setUserAddresses(data.addresses);
          setSelectedAddress(data.addresses[0]); // Default to first address
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("You are not authorized to access this page");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    const totalAmount = localStorage.getItem("totalAmount") || "";
    if (totalAmount) {
      settotalAmount(JSON.parse(totalAmount));
    }
    fetchUserData();
  }, [router]);

  const handleAddressChange = (selectedType: string) => {
    const address = userAddresses.find((addr) => addr.type === selectedType);
    setSelectedAddress(address || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem("orderCreated");
    if (!selectedAddress) {
      toast.error("Please select an address.");
      return;
    }

    const formattedAddress = {
      ...selectedAddress,
      type:
        selectedAddress.type.charAt(0).toUpperCase() +
        selectedAddress.type.slice(1).toLowerCase(),
    };

    try {
      // Save selected address
      localStorage.setItem("selectedAddress", JSON.stringify(formattedAddress));

      // Fetch cart to get items & total amount
      const { data: cartData } = await axios.get("/api/cart");

      const orderItems = cartData?.items || [];
      const totalAmount = orderItems.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      );

      // Save cart info for Stripe success redirect
      localStorage.setItem("orderItems", JSON.stringify(orderItems));
      localStorage.setItem("totalAmount", JSON.stringify(totalAmount));

      if (paymentMethod === "card") {
        const { data } = await axios.post("/api/create-payment", {
          address: formattedAddress,
          paymentMethod: "stripe",
        });

        if (data?.url) {
          window.location.href = data.url;
        } else {
          toast.error("Stripe session failed");
        }
      } else {
        // Cash on Delivery
        await axios.post("/api/order", {
          address: formattedAddress,
          paymentMethod: "cod",
          items: orderItems,
          totalAmount,
        });

        localStorage.removeItem("selectedAddress");
        localStorage.removeItem("totalAmount");
        localStorage.removeItem("orderItems");

        toast.success("Order placed with Cash on Delivery!");
        router.push("/diner/dashboard");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Could not place order. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 max-w-[90%] sm:max-w-lg lg:max-w-2xl  my-4 sm:my-6max-w-4xl mx-auto p-6 bg-white border rounded-lg shadow-lg space-y-6"
    >
      <h3 className="font-semibold text-2xl text-gray-800">Checkout</h3>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          {/* Address Selection Dropdown */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Select Delivery Address
            </label>
            <Select
              onValueChange={handleAddressChange}
              value={selectedAddress?.type || ""}
            >
              <SelectTrigger className="w-full p-3 border rounded-lg bg-gray-50 text-gray-700">
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {userAddresses.map((address, index) => (
                  <SelectItem key={index} value={address.type}>
                    {address.type} ({address.street}, {address.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Selected Address */}
          {selectedAddress && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
              <p className="font-semibold text-gray-800">
                {selectedAddress.type} Address
              </p>
              <p className="text-gray-600">
                {selectedAddress.buildingNumber
                  ? `${selectedAddress.buildingNumber}, `
                  : ""}
                {selectedAddress.street}, {selectedAddress.city}
              </p>
              <p className="text-gray-600">
                {selectedAddress.state}, {selectedAddress.postalCode},{" "}
                {selectedAddress.country}
              </p>
              {selectedAddress.phoneNumber && (
                <p className="text-gray-600">
                  Phone: {selectedAddress.phoneNumber}
                </p>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-gray-50 text-gray-700">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Display Total Amount */}
          <div className="flex justify-between font-semibold text-lg mt-4">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <Button type="submit" className="w-[80%]  font-semibold py-3">
              Place Order
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
