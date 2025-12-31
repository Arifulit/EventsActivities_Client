# Profile Image Upload Setup Guide

## Current Status ✅
The profile image upload functionality is now working with **base64 encoding** for immediate use. Users can:
- Click the camera icon on their profile
- Select an image from their device
- Preview the image before uploading
- Upload and save the image to their profile

## For Production Use 🚀

To set up proper image hosting with Cloudinary (recommended for production):

### 1. Install Cloudinary Package
```bash
npm install cloudinary
```

### 2. Set Up Environment Variables
Create `.env.local` file and add:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Create Cloudinary Upload API
The API route is already created at `app/api/upload/profile-image/route.ts`

### 4. Update Frontend Code
In `app/(main)/profile/[id]/page.tsx`, replace the `uploadImageAsBase64` function with `uploadImageToBackend`.

## Current Features
- ✅ Image preview before upload
- ✅ File validation (type and size)
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Base64 encoding (for demo)

## File Validation
- **File Types**: Only images allowed
- **Max Size**: 5MB limit
- **Supported Formats**: JPG, PNG, GIF, WebP

## Next Steps
1. Set up Cloudinary account (free tier available)
2. Configure environment variables
3. Install cloudinary package
4. Update the upload function to use backend API

## Alternative Solutions
- **AWS S3**: For AWS users
- **Firebase Storage**: For Firebase projects
- **ImageKit**: Another image optimization service
- **Self-hosted**: For full control over infrastructure

## Security Notes
- Always validate file types on the backend
- Implement rate limiting for uploads
- Consider virus scanning for production
- Use CDN for better performance
