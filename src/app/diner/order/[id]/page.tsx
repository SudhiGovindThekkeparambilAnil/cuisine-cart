"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`/api/order/${id}`);
        setOrder(res.data.order || res.data);
        setUserEmail(res.data.userEmail || res.data?.userId?.email || "");
        setPhoneNumber(
          res.data.phoneNumber ||
            res.data?.userId?.addresses?.[0]?.phoneNumber ||
            "Not provided"
        );
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <p className="p-4 text-red-600">Order not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/diner/order")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Order Details</h1>
      <Card className="p-4 space-y-6">
        {/* Top Flex Container */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          {/* Order Info (Left) */}
          <div className="space-y-2 flex-1">
            <h2 className="text-lg font-semibold">Order Info</h2>
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Placed On:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
          </div>

          {/* Customer + Address Info (Right) */}
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-lg font-semibold">Customer Info</h2>
              <p>
                <strong>Email:</strong> {userEmail}
              </p>
              <p>
                <strong>Phone:</strong> {phoneNumber}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <p>{order.address?.type}</p>
              <p>
                {order.address?.street}, {order.address?.city}
              </p>
              <p>
                {order.address?.country} - {order.address?.postalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div>
          <h2 className="text-lg font-semibold mt-4">Ordered Items</h2>
          <ul className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <li key={i} className="flex items-start gap-4">
                <Image
                  src={item.photoUrl || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md border"
                  width={80}
                  height={80}
                />
                <div>
                  <p className="font-semibold">
                    {item.name} x {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.totalPrice.toFixed(2)}
                  </p>

                  {/* Chef Name */}
                  {item.chefId?.name && (
                    <p className="text-sm text-gray-800 mt-1">
                      <strong>Chef:</strong> {item.chefId.name}
                    </p>
                  )}

                  {/* Modifiers */}
                  {item.modifiers?.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">Modifiers:</p>
                      <ul className="list-disc pl-5">
                        {item.modifiers.map((mod: any, j: number) => (
                          <li key={j}>
                            {mod.modifierTitle}:{" "}
                            {mod.items
                              .map(
                                (mItem: any) =>
                                  `${mItem.title} (+$${mItem.price})`
                              )
                              .join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <p className="text-sm mt-2 text-blue-700">
                      <strong>Instructions:</strong> {item.specialInstructions}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cancel Button */}
        {/* Cancel Button or Delivered Message */}
        {order.status === "delivered" ? (
          <h2 className="text-lg font-semibold mt-4 text-green-600">
            Order Delivered Successfully!
          </h2>
        ) : order.status !== "cancelled" ? (
          <>
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Order
            </Button>

            {/* Cancel Confirmation Modal */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to cancel this order?</p>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    No
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await axios.patch("/api/order", { orderId: order._id });
                        setCancelDialogOpen(false);
                        window.location.href = "/diner/order";
                      } catch (err) {
                        console.error("Cancel failed", err);
                      }
                    }}
                  >
                    Yes, Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </Card>
    </div>
  );
}
