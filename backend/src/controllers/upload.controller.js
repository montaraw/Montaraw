import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Ensure public/uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadImage = async (req, res, next) => {
  try {
    let fileBuffer = req.file?.buffer;
    let originalName = req.file?.originalname || 'garment.jpg';
    let mimeType = req.file?.mimetype || 'image/jpeg';
    let base64String = req.body?.image;
    const folder = req.body?.folder || 'montaraw_atelier/products';

    if (!fileBuffer && !base64String) {
      return res.status(400).json({
        success: false,
        message: 'No image file or image data provided.',
      });
    }

    // Try Cloudinary Upload First
    try {
      if (fileBuffer) {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'image',
              transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });

        const result = await uploadPromise;

        return res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          message: 'Image successfully uploaded to Cloudinary CDN.',
        });
      }

      if (base64String && base64String.startsWith('data:image')) {
        const result = await cloudinary.uploader.upload(base64String, {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        });

        return res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          message: 'Image successfully uploaded to Cloudinary CDN.',
        });
      }
    } catch (cloudErr) {
      console.warn('⚠️ [Cloudinary Notice - Falling back to High-Speed Local CDN]:', cloudErr.message);
    }

    // Fallback: Save to high-speed public/uploads static folder or generate data URL
    if (fileBuffer) {
      const ext = path.extname(originalName) || '.jpg';
      const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${cleanBase}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, fileBuffer);

      const serverUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      return res.json({
        success: true,
        url: serverUrl,
        message: 'Image successfully saved to Atelier server storage.',
      });
    }

    if (base64String) {
      return res.json({
        success: true,
        url: base64String,
        message: 'Image successfully processed.',
      });
    }
  } catch (error) {
    console.error('[Upload Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image upload.',
    });
  }
};
