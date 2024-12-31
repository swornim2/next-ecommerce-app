"use server";

import { cookies } from "next/headers";
import db from "@/db/db";
import { revalidatePath } from "next/cache";

export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  imagePath: string;
  price: number;
  quantity: number;
};

export async function getCart(): Promise<CartItem[]> {
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

  if (!cart) return [];

  return cart.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    description: item.product.description,
    imagePath: item.product.imagePath,
    price: item.product.price,
    quantity: item.quantity,
  }));
}

export async function createCart(): Promise<string> {
  const cart = await db.cart.create({
    data: {},
  });

  // Set the cookie with a 30-day expiration
  cookies().set("cartId", cart.id, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
  });

  return cart.id;
}

export async function addToCart(productId: string): Promise<void> {
  try {
    // First, verify that the product exists and is available for purchase
    const product = await db.product.findUnique({
      where: { 
        id: productId,
        isAvailableForPurchase: true,
      },
    });

    if (!product) {
      throw new Error("Product not found or not available for purchase");
    }

    // Get or create cart
    let cartId = cookies().get("cartId")?.value;
    
    if (!cartId) {
      // If no cart exists, create one
      cartId = await createCart();
    } else {
      // Verify the cart exists
      const cart = await db.cart.findUnique({
        where: { id: cartId },
      });
      
      // If cart not found, create a new one
      if (!cart) {
        cartId = await createCart();
      }
    }

    // Use a transaction to ensure consistency
    await db.$transaction(async (tx) => {
      // Check for existing cart item
      const existingCartItem = await tx.cartItem.findFirst({
        where: {
          cartId,
          productId,
        },
      });

      if (existingCartItem) {
        // Update existing cart item
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        });
      } else {
        // Create new cart item
        await tx.cartItem.create({
          data: {
            cartId,
            productId,
            quantity: 1,
          },
        });
      }
    });

    // Revalidate the cart page and any other pages that show cart information
    revalidatePath('/cart');
    revalidatePath('/');
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<void> {
  const cartId = cookies().get("cartId")?.value;
  if (!cartId) throw new Error("No cart found");

  const cartItem = await db.cartItem.findFirst({
    where: { cartId, productId },
  });

  if (!cartItem) throw new Error("Item not found in cart");

  if (quantity === 0) {
    await db.cartItem.delete({
      where: { id: cartItem.id },
    });
  } else {
    await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  revalidatePath('/cart');
  revalidatePath('/');
}
