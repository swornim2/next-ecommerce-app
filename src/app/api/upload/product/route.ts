import prisma from "@/db/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

export const runtime = "nodejs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    console.log("Starting file upload process...");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId");

    if (!file) {
      console.error("No file received");
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

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'auto',
          public_id: `product-${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to stream and pipe to cloudinary
      const Readable = require('stream').Readable;
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });

    const uploadResult = await uploadPromise as any;

    // Update product with new image URL
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        imagePath: uploadResult.secure_url
      }
    });

    console.log("File upload successful:", uploadResult.secure_url);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
