// Client-side Cloudinary utilities
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;



export function getCloudinaryUrl(publicId: string): string {
  if (!publicId) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL, return as is
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  // If it's a local path starting with '/', return as is
  if (publicId.startsWith('/')) {
    return publicId;
  }

  if (!CLOUD_NAME) {
    console.error('Cannot construct Cloudinary URL: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    return '/placeholder-image.jpg';
  }

  // Remove any leading slashes from the public ID
  const cleanPublicId = publicId.replace(/^\/+/, '');

  // Construct the full Cloudinary URL with the correct structure:
  // 1. Transformations (f_auto,q_auto) come before version
  // 2. Use v1 as base version
  // 3. Include the folder structure
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v1/${cleanPublicId}`;
}
