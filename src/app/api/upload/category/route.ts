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
    const categoryId = formData.get("categoryId");

    if (!file) {
      console.error("No file received");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!categoryId || typeof categoryId !== "string") {
      console.error("Invalid category ID:", categoryId);
      return NextResponse.json(
        { error: "Valid category ID is required" },
        { status: 400 }
      );
    }

    // Find the category
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      console.error("Category not found:", categoryId);
      return NextResponse.json(
        { error: "Category not found" },
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
          folder: 'categories',
          resource_type: 'auto',
          public_id: `${category.slug}-${Date.now()}`
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

    // Update category with new image URL
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        imagePath: uploadResult.secure_url
      }
    });

    console.log("File upload successful:", uploadResult.secure_url);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
