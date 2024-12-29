import { NextResponse } from 'next/server';
import db from '@/db/db';

export async function GET() {
  try {
    console.log("[Server] Testing database connection...");
    const products = await db.product.findMany();
    console.log("[Server] Database connection successful. Products:", products);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[Server] Database connection error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
