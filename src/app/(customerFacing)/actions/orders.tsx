"use server";

import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));

  if (result.success === false) {
    return { error: "Invalid email address" };
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          price: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    };
  }

  const orders = user.orders.map(
    async (order: {
      id: string;
      price: number;
      createdAt: Date;
      product: {
        id: string;
        name: string;
        imagePath: string;
        description: string;
      };
    }) => {
      return {
        ...order,
        downloadVerificationId: (
          await db.downloadVerification.create({
            data: {
              expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
              productId: order.product.id,
            },
          })
        ).id,
      };
    }
  );

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    react: <OrderHistoryEmail orders={await Promise.all(orders)} />,
  });

  if (data.error) {
    return {
      error: "There was an error sending your email. Please try again.",
    };
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  };
}

export async function createOrder(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  province: string;
  city: string;
  streetAddress: string;
  items: { id: string; quantity: number; price: number }[];
  total: number;
}) {
  try {
    // Validate email
    const emailResult = emailSchema.safeParse(data.email);
    if (!emailResult.success) {
      return { success: false, error: "Invalid email address" };
    }

    // Create or update user with the email
    const user = await db.user.upsert({
      where: { email: data.email },
      create: { email: data.email },
      update: {},
    });

    // Create the order
    const order = await db.order.create({
      data: {
        userId: user.id,
        price: data.total,
        shippingDetails: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          province: data.province,
          city: data.city,
          streetAddress: data.streetAddress,
        }),
        productId: data.items[0].id, // Assuming single product order for now
      },
    });

    return { success: true, order };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Failed to create order",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
