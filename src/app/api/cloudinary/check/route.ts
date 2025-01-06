import { NextResponse } from 'next/server';
import { checkCloudinaryFile, listCloudinaryFiles } from '@/lib/cloudinary.server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get('publicId');
  const listFiles = searchParams.get('list') === 'true';

  try {
    if (listFiles) {
      const files = await listCloudinaryFiles();
      return NextResponse.json({ success: true, files });
    }

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const exists = await checkCloudinaryFile(publicId);
    return NextResponse.json({ success: true, exists });
  } catch (error) {
    console.error('Error in Cloudinary check API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check Cloudinary file' },
      { status: 500 }
    );
  }
}
