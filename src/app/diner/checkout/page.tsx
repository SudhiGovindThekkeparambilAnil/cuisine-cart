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
    if (!selectedAddress) {
      toast.error("Please select an address.");
      return;
    }

    try {
      await axios.post(
        "/api/order",
        {
          address: {
            ...selectedAddress,
            type:
              selectedAddress.type.charAt(0).toUpperCase() +
              selectedAddress.type.slice(1).toLowerCase(),
          },
          paymentMethod,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      localStorage.removeItem("totalAmount");
      toast.success("Order placed successfully!");
      router.push("/diner/dishes");
    } catch (error) {
      console.error(error);
      toast.error("Could not place order. Try again.");
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
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Display Total Amount */}
          <div className="flex justify-between font-semibold text-lg mt-4">
            <span>Total:</span>
            <span>${totalAmount}</span>
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
