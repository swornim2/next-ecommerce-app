import prisma from "@/db/db";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs"; // or 'edge' depending on your runtime requirements

export async function POST(request: Request) {
  try {
    // Log the start of the request
    console.log("Starting file upload process...");

    const formData = await request.formData();
    const file = formData.get("file");
    const categoryId = formData.get("categoryId");

    if (!file || !(file instanceof Blob)) {
      console.error("No file or invalid file received");
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

    // Determine file extension
    const fileType = file.type;
    const fileExtension = fileType === "image/png" ? ".png" : ".jpg";

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${category.slug}-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "categories");
    const filePath = path.join(uploadDir, filename);

    console.log("File will be saved to:", filePath);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      await fs.writeFile(filePath, buffer as any);
      console.log("File written successfully");
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      throw new Error("Failed to write file to disk");
    }

    // Update category with image path (using the correct format for Next.js Image component)
    const imagePath = `/categories/${filename}`; // Store path without 'public' prefix

    try {
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { imagePath },
      });
      console.log("Category updated with image path");

      return NextResponse.json({
        success: true,
        category: updatedCategory,
        imagePath,
      });
    } catch (dbError) {
      // If database update fails, try to clean up the file
      await fs.unlink(filePath).catch(console.error);
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
