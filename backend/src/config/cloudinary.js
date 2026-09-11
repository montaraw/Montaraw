import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || 'mzhlmxy6').trim();
const api_key = (process.env.CLOUDINARY_API_KEY || '648923424881567').trim();
const api_secret = (process.env.CLOUDINARY_API_SECRET || '0Ef-S_ZnEQslFwu1M7n_-24UyWs').trim();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

export default cloudinary;

