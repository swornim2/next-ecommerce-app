"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  imagePath: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  quantity: number;
};

export async function getCart(): Promise<CartItem[]> {
  try {
    const cartId = cookies().get("cartId")?.value;
    if (!cartId) return [];

    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cookies().delete("cartId");
      return [];
    }

    return cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      imagePath: item.product.imagePath,
      price: item.product.price,
      salePrice: item.product.salePrice,
      onSale: item.product.onSale ?? false,
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

export async function createCart(): Promise<string> {
  try {
    const cart = await db.cart.create({
      data: {},
    });

    cookies().set("cartId", cart.id, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return cart.id;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw new Error("Failed to create cart");
  }
}

export async function addToCart(productId: string): Promise<void> {
  try {
    let cartId = cookies().get("cartId")?.value;

    // Verify the product exists and is available
    const product = await db.product.findUnique({
      where: {
        id: productId,
        isAvailableForPurchase: true,
      },
      select: {
        id: true,
        price: true,
        salePrice: true,
        onSale: true,
      },
    });

    if (!product) {
      throw new Error("Product not found or not available for purchase");
    }

    // Create or get cart
    if (!cartId) {
      cartId = await createCart();
    } else {
      // Verify cart exists
      const cart = await db.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        cartId = await createCart();
      }
    }

    // Check for existing cart item
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    });

    if (existingCartItem) {
      await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
      });
    } else {
      await db.cartItem.create({
        data: {
          cart: {
            connect: { id: cartId },
          },
          product: {
            connect: { id: productId },
          },
          quantity: 1,
        },
      });
    }

    revalidatePath("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<void> {
  try {
    const cartId = cookies().get("cartId")?.value;
    if (!cartId) throw new Error("No cart found");

    const cartItem = await db.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      await db.cartItem.delete({
        where: { id: cartItem.id },
      });
    } else {
      await db.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
}

export async function removeFromCart(productId: string): Promise<void> {
  try {
    const cartId = cookies().get("cartId")?.value;
    if (!cartId) return;

    const cartItem = await db.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    });

    if (cartItem) {
      await db.cartItem.delete({
        where: { id: cartItem.id },
      });
      revalidatePath("/cart");
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}
