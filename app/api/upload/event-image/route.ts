import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Configure Cloudinary if credentials are available
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️ Cloudinary credentials not found - image upload will use fallback placeholder');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file') || formData.get('image');
    
    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      );
    }

    const file = fileEntry as File;
    
    console.log('📤 Uploading event image:', {
      name: file.name,
      size: file.size,
      type: file.type,
      cloudinaryConfigured: isCloudinaryConfigured
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for event images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Image size should be less than 10MB' },
        { status: 400 }
      );
    }

    // If Cloudinary is not configured, use a proper placeholder image
    if (!isCloudinaryConfigured) {
      console.warn('⚠️ Cloudinary not configured - returning placeholder URL');
      
      // Use a proper free image service with better quality placeholder
      const placeholderUrl = `https://placehold.co/1200x630/4F46E5/white/png?text=Event+Image`;
      
      return NextResponse.json({
        success: true,
        message: 'Event image uploaded (using placeholder - configure Cloudinary for real uploads)',
        data: {
          imageUrl: placeholderUrl
        },
        imageUrl: placeholderUrl,
        warning: 'Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local file for actual image uploads.'
      });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('☁️ Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'event-images',
          public_id: `event-${Date.now()}`,
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error: unknown, result: unknown) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful');
            resolve(result as { secure_url: string });
          }
        }
      ).end(buffer);
    });

    console.log('✅ Image uploaded successfully:', result.secure_url);

    return NextResponse.json({
      message: 'Event image uploaded successfully',
      url: result.secure_url,
      imageUrl: result.secure_url
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Event image upload error:', {
      error,
      message: errorMessage,
      cloudinaryConfigured: isCloudinaryConfigured
    });
    
    // Provide helpful error messages
    let userMessage = errorMessage || 'Failed to upload event image';
    if (!isCloudinaryConfigured) {
      userMessage = 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.';
    } else if (errorMessage.includes('Invalid API Key')) {
      userMessage = 'Invalid Cloudinary API credentials. Please check your .env configuration.';
    } else if (errorMessage.includes('timeout')) {
      userMessage = 'Upload timed out. Please try again with a smaller image.';
    }
    
    return NextResponse.json(
      { 
        message: userMessage,
        error: errorMessage,
        debug: {
          cloudinaryConfigured: isCloudinaryConfigured
        }
      },
      { status: 500 }
    );
  }
}
