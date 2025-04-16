"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  userId: {
    name: string;
    profileImage: string;
  };
  totalAmount: number;
  createdAt: string;
  status: string;
  items: {
    name: string;
    quantity: number;
  }[];
}

export default function ChefOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetOrder, setDeleteTargetOrder] = useState<Order | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    async function fetchChefOrders() {
      try {
        const res = await axios.get("/api/chef-order");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch chef orders", err);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchChefOrders();
  }, []);

  const openConfirmation = (order: Order, status: string) => {
    setSelectedOrder(order);
    setNextStatus(status);
    setDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await axios.patch("/api/chef-order", {
        orderId: selectedOrder._id,
        status: nextStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: nextStatus }
            : order
        )
      );
      toast.success(`Order ${nextStatus}`);
    } catch (err) {
      console.error("Failed to update order status", err);
      toast.error("Failed to update status.");
    } finally {
      setDialogOpen(false);
      setSelectedOrder(null);
      setNextStatus("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetOrder) return;

    try {
      await axios.delete("/api/chef-order", {
        data: { orderId: deleteTargetOrder._id },
      });
      setOrders((prev) =>
        prev.filter((order) => order._id !== deleteTargetOrder._id)
      );
      toast.success("Order deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete order");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetOrder(null);
    }
  };

  const renderActionButton = (order: Order) => {
    return (
      <div className="flex gap-2 flex-wrap">
        {order.status === "pending" && (
          <>
            <Button onClick={() => openConfirmation(order, "in progress")}>
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => openConfirmation(order, "cancelled")}
            >
              Refuse
            </Button>
          </>
        )}

        {order.status === "in progress" && (
          <Button onClick={() => openConfirmation(order, "out for delivery")}>
            Confirm
          </Button>
        )}

        {order.status === "out for delivery" && (
          <Button onClick={() => openConfirmation(order, "delivered")}>
            Mark as Delivered
          </Button>
        )}

        {(order.status === "delivered" || order.status === "cancelled") && (
          <Button
            variant="destructive"
            onClick={() => {
              setDeleteTargetOrder(order);
              setDeleteDialogOpen(true);
            }}
          >
            Delete Order
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Chef Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-1" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders to manage.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 shadow">
              <div className="space-y-2">
                <p className="font-semibold text-lg">
                  Customer: {order.userId?.name}
                </p>
                <p className="text-sm text-gray-700">
                  Dishes:{" "}
                  {order.items
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  Placed on: {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span> {order.status}
                </p>
                <p className="font-bold text-right">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Button onClick={() => router.push(`/chef/order/${order._id}`)}>
                  View Order
                </Button>
                {renderActionButton(order)}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to mark this order as{" "}
            <strong>{nextStatus}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to <strong>permanently delete</strong> this
            order? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
