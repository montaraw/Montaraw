import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Ensure public/uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Verify genuine image file signatures (Magic Bytes)
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;

  return false;
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

    // Binary Signature (Magic Byte) Inspection
    if (fileBuffer && !validateImageMagicBytes(fileBuffer)) {
      return res.status(400).json({
        success: false,
        message: 'File content does not match genuine image binary signature.',
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

    // Fallback: If Cloudinary is unavailable or not configured,
    // convert fileBuffer to a persistent base64 Data URL so that when saved to PostgreSQL
    // it is PERMANENTLY stored in Supabase without depending on ephemeral server disk!
    if (fileBuffer) {
      const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      return res.json({
        success: true,
        url: dataUri,
        message: 'Image processed and prepared for persistent storage.',
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
