import fs from 'fs';
import path from 'path';

const logoPath = path.join(process.cwd(), 'public', 'logo.png');
const b64 = fs.readFileSync(logoPath).toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#181818" />
      <stop offset="100%" stop-color="#050505" />
    </radialGradient>
    <linearGradient id="borderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e63946" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#2a2a2a" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#c5a880" stop-opacity="0.7" />
    </linearGradient>
  </defs>
  
  <!-- Solid Luxury Black Background with Rounded Corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGlow)" />
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="url(#borderGlow)" stroke-width="8" />
  
  <!-- Centered Crisp Montaraw Brand Emblem -->
  <image href="data:image/png;base64,${b64}" x="40" y="40" width="432" height="432" preserveAspectRatio="xMidYMid meet" />
</svg>`;

const faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
fs.writeFileSync(faviconPath, svgContent.trim());
console.log('✅ Generated luxury black public/favicon.svg successfully!');
