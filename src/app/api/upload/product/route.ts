import prisma from "@/db/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        { error: "Valid product ID is required" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.error("Product not found:", productId);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = require('stream').Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    const uploadResult = await uploadPromise as any;
    const imageUrl = uploadResult.secure_url;

    // Update product with Cloudinary URL
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { imagePath: imageUrl },
      });
      console.log("Product updated with image path");

      return NextResponse.json({
        success: true,
        product: updatedProduct,
        imagePath: imageUrl,
      });
    } catch (dbError) {
      // If database update fails, clean up the file
      console.error("Error updating product:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
