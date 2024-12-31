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
}) {
  try {
    console.log("Creating order with data:", orderData);

    // Create a mock user for now
    const userEmail = `${orderData.phoneNumber}@example.com`;
    console.log("Creating/finding user with email:", userEmail);

    const user = await db.user.upsert({
      where: {
        email: userEmail,
      },
      update: {},
      create: {
        email: userEmail,
      },
    });

    console.log("User created/found:", user);

    // Create orders for each item
    const orderPromises = orderData.items.map(async (item) => {
      console.log("Creating order for item:", item);

      // Verify product exists
      const product = await db.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        console.error("Product not found:", item.id);
        throw new Error(`Product not found: ${item.id}`);
      }

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
          price: item.price * item.quantity,
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
      console.log("Clearing cart:", cartId);
      await db.cartItem.deleteMany({
        where: {
          cartId,
        },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, orders };
  } catch (error) {
    console.error("Error creating order:", error);
    // Return more detailed error information
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
