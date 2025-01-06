'use server'

import cloudinary from './cloudinary.config';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
}

export async function checkCloudinaryFile(publicId: string): Promise<boolean> {
  try {
    // Extract public ID from URL if full URL is provided
    if (publicId.startsWith('http')) {
      const urlParts = publicId.split('/');
      publicId = urlParts[urlParts.length - 1].split('.')[0];
    }

    await cloudinary.api.resource(publicId);
    return true;
  } catch (error) {
    console.error('Error checking Cloudinary file:', error);
    return false;
  }
}

export async function listCloudinaryFiles(folder: string = 'products'): Promise<Array<{publicId: string, url: string, createdAt: string}>> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500
    });

    return result.resources.map((resource: CloudinaryResource) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      createdAt: resource.created_at
    }));
  } catch (error) {
    console.error('Error listing Cloudinary files:', error);
    return [];
  }
}

export async function uploadToCloudinary(buffer: Buffer, options: any = {}): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Ensure the folder exists in options
    const folder = options.folder || 'products';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        unique_filename: true,
        transformation: [
          { quality: "auto:best" },
          { fetch_format: "auto" }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          // Log successful upload
          console.log('Successfully uploaded to Cloudinary:', {
            folder: result?.folder,
            public_id: result?.public_id,
            secure_url: result?.secure_url
          });
          resolve(result as unknown as CloudinaryUploadResult);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<any> {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
