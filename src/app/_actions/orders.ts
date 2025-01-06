"use server";

import db from "@/db/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type orderStatusType =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderResponse = {
  success: boolean;
  orders?: any[];
  error?: string;
  details?: any;
};

export async function getOrders() {
  const orders = await db.order.findMany({
    include: {
      product: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

export async function createOrder(orderData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  province: string;
  city: string;
  streetAddress: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}): Promise<OrderResponse> {
  try {
    console.log("Creating order with data:", orderData);

    const user = await db.user.upsert({
      where: {
        email: orderData.email,
      },
      update: {},
      create: {
        email: orderData.email,
      },
    });

    console.log("User created/found:", user);

    // Create orders for each item
    const orderPromises = orderData.items.map(async (item) => {
      console.log("Creating order for item:", item);

      // Verify product exists and get current price
      const product = await db.product.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          price: true,
          salePrice: true,
          onSale: true,
        },
      });

      if (!product) {
        console.error("Product not found:", item.id);
        throw new Error(`Product not found: ${item.id}`);
      }

      // Calculate the actual price (use sale price if on sale)
      const actualPrice = product.onSale && product.salePrice ? product.salePrice : product.price;

      const shippingDetails = {
        fullName: orderData.fullName,
        phoneNumber: orderData.phoneNumber,
        province: orderData.province,
        city: orderData.city,
        streetAddress: orderData.streetAddress,
        quantity: item.quantity,
      };

      const order = await db.order.create({
        data: {
          price: actualPrice * item.quantity,
          userId: user.id,
          productId: item.id,
          shippingDetails: JSON.stringify(shippingDetails),
        },
        include: {
          product: true,
          user: true,
        },
      });

      console.log("Order created:", order);
      return order;
    });

    const orders = await Promise.all(orderPromises);
    console.log("All orders created:", orders);

    // Clear the cart after successful order
    const cartId = cookies().get("cartId")?.value;
    if (cartId) {
      await db.cart.delete({
        where: { id: cartId },
      });
      cookies().delete("cartId");
    }

    revalidatePath("/orders");
    return { success: true, orders };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
      details: error,
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: orderStatusType
) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: {
        status: status,
      },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await db.order.delete({
      where: { id: orderId },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}
