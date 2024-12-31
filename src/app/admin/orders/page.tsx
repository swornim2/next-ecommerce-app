"use client";

import {
  deleteOrder,
  getOrders,
  orderStatusType,
  updateOrderStatus,
} from "@/app/_actions/orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../_components/PageHeader";

type Order = {
  id: string;
  price: number;
  status: string;
  shippingDetails: string | null;
  createdAt: string | Date;
  product: {
    name: string;
    imagePath: string;
  };
  user: {
    email: string;
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const fetchedOrders = await getOrders();
    setOrders(fetchedOrders);
  }

  async function handleStatusUpdate(
    orderId: string,
    newStatus: orderStatusType
  ) {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      toast.success("Order status updated");
      loadOrders();
    } else {
      toast.error("Failed to update order status");
    }
  }

  async function handleDelete(orderId: string) {
    if (confirm("Are you sure you want to delete this order?")) {
      const result = await deleteOrder(orderId);
      if (result.success) {
        toast.success("Order deleted");
        loadOrders();
      } else {
        toast.error("Failed to delete order");
      }
    }
  }

  function formatDate(dateString: string | Date) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>Orders</PageHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const shippingInfo = JSON.parse(order.shippingDetails || "{}");
            return (
              <TableRow key={order.id}>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>
                  {shippingInfo.fullName}
                  <br />
                  <span className="text-sm text-gray-500">
                    {shippingInfo.phoneNumber}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(order.price)}</TableCell>
                <TableCell>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        order.id,
                        e.target.value as orderStatusType
                      )
                    }
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Product Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">
                      Product Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-16 h-16">
                          <Image
                            src={selectedOrder.product.imagePath}
                            alt={selectedOrder.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedOrder.product.name}
                          </p>
                          <p className="text-gray-600">
                            {formatCurrency(selectedOrder.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Order Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Status:</span>
                        <span className="capitalize font-medium px-3 py-1 bg-gray-100 rounded-full">
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Order Date:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="mt-3">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              selectedOrder.id,
                              e.target.value as orderStatusType
                            )
                          }
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Customer & Shipping Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">
                      Customer Information
                    </h3>
                    {(() => {
                      const shipping = JSON.parse(
                        selectedOrder.shippingDetails || "{}"
                      );
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">
                              {shipping.fullName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">
                              {shipping.phoneNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">
                              {selectedOrder.user.email}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">
                      Shipping Details
                    </h3>
                    {(() => {
                      const shipping = JSON.parse(
                        selectedOrder.shippingDetails || "{}"
                      );
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Street Address:
                            </span>
                            <span className="font-medium text-right">
                              {shipping.streetAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{shipping.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Province:</span>
                            <span className="font-medium">
                              {shipping.province}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">
                              {shipping.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedOrder.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  Delete Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
