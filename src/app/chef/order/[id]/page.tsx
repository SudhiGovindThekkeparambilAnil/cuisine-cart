"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "@/components/Loader";
import { ArrowLeft } from "lucide-react";

export default function ChefOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`/api/chef-order/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await axios.patch("/api/chef-order", {
        orderId: order._id,
        status: nextStatus,
      });
      setOrder((prev: any) => ({ ...prev, status: nextStatus }));
      setDialogOpen(false);
      setNextStatus("");
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getNextAction = () => {
    switch (order?.status) {
      case "pending":
        return { label: "Accept", status: "in progress" };
      case "in progress":
        return { label: "Confirm", status: "out for delivery" };
      case "out for delivery":
        return { label: "Mark as Delivered", status: "delivered" };
      default:
        return null;
    }
  };

  if (loading) return <Loader />;
  if (!order) return <p className="p-4 text-red-600">Order not found.</p>;

  const action = getNextAction();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/chef/order")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Chef Order Details</h1>
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
          </div>

          {/* Customer + Address Info (Right) */}
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-lg font-semibold">Customer Info</h2>
              <p>
                <strong>Name:</strong> {order.userId?.name}
              </p>
              <p>
                <strong>Email:</strong> {order.userId?.email}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {order.userId?.addresses?.[0]?.phoneNumber || "Not Provided"}
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
            {order.items.map((item: any, idx: number) => (
              <li key={idx}>
                <div className="flex items-start gap-4">
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
                    <p>${item.totalPrice.toFixed(2)}</p>
                    {item.modifiers?.length > 0 && (
                      <ul className="text-sm text-gray-700 list-disc pl-4 mt-1">
                        {item.modifiers.map((mod: any, mIdx: number) => (
                          <li key={mIdx}>
                            {mod.modifierTitle}:{" "}
                            {mod.items
                              .map((i: any) => `${i.title} (+$${i.price})`)
                              .join(", ")}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Instructions:</strong>{" "}
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Update Buttons */}
        <div className="pt-4 flex gap-3">
          {action && (
            <Button
              onClick={() => {
                setNextStatus(action.status);
                setDialogOpen(true);
              }}
            >
              {action.label}
            </Button>
          )}

          {order.status === "pending" && (
            <Button
              variant="destructive"
              onClick={() => {
                setNextStatus("cancelled");
                setDialogOpen(true);
              }}
            >
              Refuse
            </Button>
          )}

          {order.status === "delivered" && (
            <h2 className="text-lg font-semibold mt-4 text-green-600">
              Order Delivered Successfully!!!
            </h2>
          )}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to update the status to{" "}
            <strong>{nextStatus}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
