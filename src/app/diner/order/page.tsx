"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  items: {
    name: string;
    chefId?: {
      name: string;
    };
  }[];
  userId: {
    name: string;
    profileImage: string;
  };
}

export default function OrderSummaryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("/api/order");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await axios.patch("/api/order", { orderId: cancelId });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === cancelId ? { ...o, status: "cancelled" } : o
        )
      );
      setCancelId(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/order/${deleteId}`);
      setOrders((prev) => prev.filter((o) => o._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-24 ml-auto" />
                  <div className="flex gap-2 justify-end">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-semibold text-lg">
                    Customer: {order.userId?.name}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Dishes: {order.items.map((item) => item.name).join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Chef(s):{" "}
                    {Array.from(
                      new Set(order.items.map((item) => item.chefId?.name))
                    ).join(", ")}
                  </p>

                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {order.status}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-xl font-bold">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      onClick={() => router.push(`/diner/order/${order._id}`)}
                    >
                      View Details
                    </Button>
                    {order.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        onClick={() => setCancelId(order._id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.status === "cancelled" && (
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteId(order._id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogHeader>
          <DialogTitle>Cancel Order?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>Are you sure you want to cancel this order?</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setCancelId(null)}>
            No
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            Yes, Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogHeader>
          <DialogTitle>Remove Order?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>This will permanently delete the order. Are you sure?</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            No
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
