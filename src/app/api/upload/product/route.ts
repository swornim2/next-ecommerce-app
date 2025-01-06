import prisma from "@/db/db";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("Starting product image upload process...");

    const formData = await request.formData();
    const file = formData.get("file");
    const productId = formData.get("productId");

    if (!file || !(file instanceof Blob)) {
      console.error("No file or invalid file received");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!productId || typeof productId !== "string") {
      console.error("Invalid product ID:", productId);
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Upload to Cloudinary using our server function
      const result = await uploadToCloudinary(buffer, {
        folder: "products",
        public_id: `product_${productId}`,
      });

      // Update product with image URL
      await prisma.product.update({
        where: { id: productId },
        data: {
          imagePath: (result as any).public_id,
        },
      });

      return NextResponse.json({ 
        success: true,
        url: (result as any).secure_url,
        publicId: (result as any).public_id
      });
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in product image upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
