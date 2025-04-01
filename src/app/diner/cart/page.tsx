"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MAX_QUANTITY = 8;

interface CartItem {
  _id: string;
  dishId: string;
  name: string;
  photoUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth/login");
      toast.error("You are not authorized to access the requested page");
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart");
      setCartItems(res.data.items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity > MAX_QUANTITY) {
      toast.error(`You can only add up to ${MAX_QUANTITY} of a single item.`);
      return;
    }

    try {
      await axios.put(`/api/cart/${id}`, { quantity: newQuantity });
      toast.success("Cart updated successfully");
      fetchCart(); // Refresh cart
    } catch (error) {
      toast.error("Failed to update quantity.");
      console.error(error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await axios.delete(`/api/cart/${id}`);
      localStorage.setItem(
        "updatedCartCount",
        JSON.stringify(cartItems.length - 1)
      );
      setCartItems(cartItems.filter((item) => item._id !== id));
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item.");
      console.error(error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    localStorage.setItem("totalAmount", totalAmount.toFixed(2));
    router.push("/diner/checkout");
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Card className="p-6 space-y-4 max-w-[90%] sm:max-w-lg lg:max-w-2xl mx-auto my-4 sm:my-6">
      <h3 className="text-lg font-semibold text-gray-800">Your Cart</h3>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col items-start md:items-center justify-between border-b pb-4 mb-4 md:flex-row"
            >
              <div className="flex items-center space-x-6">
                <Image
                  src={item.photoUrl}
                  alt={item.name}
                  width={100} // Slightly bigger image size
                  height={100}
                  className="rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} each
                  </p>
                  <div className="flex items-center mt-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-sm"
                    >
                      -
                    </Button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      disabled={item.quantity >= MAX_QUANTITY}
                      className="px-3 py-1 text-sm"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex  items-center space-x-4 ">
                <p className="font-semibold text-gray-800">
                  ${item.totalPrice.toFixed(2)}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => removeItem(item._id)}
                  className="px-3 py-2"
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
          ))}

          {/* Total Price */}
          <div className="flex justify-between font-semibold text-lg mt-4">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleCheckout}
              className="w-full sm:w-[70%] lg:w-[50%] font-semibold py-3  mt-6 mx-auto  sm:mx-0"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
