import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function processLogoToBlackTransparent() {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const buffer = fs.readFileSync(logoPath);

  let pos = 8;
  let width, height;
  const idatChunks = [];

  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(pos + 8);
      height = buffer.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const compressedData = Buffer.concat(idatChunks);
  const uncompressed = zlib.inflateSync(compressedData);

  const bytesPerPixel = 4; // RGBA
  const rowSize = 1 + width * bytesPerPixel;

  // Process rows with unfiltering
  const reconstructed = Buffer.alloc(height * width * 4);
  const prevRow = Buffer.alloc(width * bytesPerPixel);
  const curRow = Buffer.alloc(width * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const filterType = uncompressed[y * rowSize];
    const rowOffset = y * rowSize + 1;

    for (let x = 0; x < width * bytesPerPixel; x++) {
      const byte = uncompressed[rowOffset + x];
      const prevX = x >= bytesPerPixel ? curRow[x - bytesPerPixel] : 0;
      const prevY = prevRow[x];

      let rawByte = byte;
      if (filterType === 1) rawByte = (byte + prevX) & 0xff;
      else if (filterType === 2) rawByte = (byte + prevY) & 0xff;
      else if (filterType === 3) rawByte = (byte + Math.floor((prevX + prevY) / 2)) & 0xff;
      else if (filterType === 4) {
        const a = prevX;
        const b = prevY;
        const c = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        rawByte = (byte + pr) & 0xff;
      }

      curRow[x] = rawByte;
    }

    // Transform pixels: White/gray -> Solid Black (#000000), Red -> Pure Red
    for (let x = 0; x < width; x++) {
      const idx = x * 4;
      let r = curRow[idx];
      let g = curRow[idx + 1];
      let b = curRow[idx + 2];
      let a = curRow[idx + 3];

      const isRed = r > 140 && g < 90 && b < 90;

      if (!isRed && a > 10) {
        r = 0;
        g = 0;
        b = 0;
      }

      const outIdx = (y * width + x) * 4;
      reconstructed[outIdx] = r;
      reconstructed[outIdx + 1] = g;
      reconstructed[outIdx + 2] = b;
      reconstructed[outIdx + 3] = a;
    }

    curRow.copy(prevRow);
  }

  // Helper: Bilinear resize RGBA buffer to target width & height
  function resizeImage(srcBuf, srcW, srcH, dstW, dstH) {
    const dstBuf = Buffer.alloc(dstW * dstH * 4);
    const xRatio = (srcW - 1) / dstW;
    const yRatio = (srcH - 1) / dstH;

    for (let y = 0; y < dstH; y++) {
      const srcY = y * yRatio;
      const yFloor = Math.floor(srcY);
      const yCeil = Math.min(srcH - 1, Math.ceil(srcY));
      const yLerp = srcY - yFloor;

      for (let x = 0; x < dstW; x++) {
        const srcX = x * xRatio;
        const xFloor = Math.floor(srcX);
        const xCeil = Math.min(srcW - 1, Math.ceil(srcX));
        const xLerp = srcX - xFloor;

        const idxTL = (yFloor * srcW + xFloor) * 4;
        const idxTR = (yFloor * srcW + xCeil) * 4;
        const idxBL = (yCeil * srcW + xFloor) * 4;
        const idxBR = (yCeil * srcW + xCeil) * 4;

        const outIdx = (y * dstW + x) * 4;
        for (let c = 0; c < 4; c++) {
          const top = srcBuf[idxTL + c] * (1 - xLerp) + srcBuf[idxTR + c] * xLerp;
          const bottom = srcBuf[idxBL + c] * (1 - xLerp) + srcBuf[idxBR + c] * xLerp;
          dstBuf[outIdx + c] = Math.round(top * (1 - yLerp) + bottom * yLerp);
        }
      }
    }
    return dstBuf;
  }

  // Helper: Encode RGBA buffer into PNG buffer
  function encodePNG(rawBuf, w, h) {
    const outData = Buffer.alloc(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
      outData[y * (1 + w * 4)] = 0; // Filter 0 (None)
      rawBuf.copy(outData, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
    }
    const newIdat = zlib.deflateSync(outData);

    function crc32(buf) {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let j = 0; j < 8; j++) {
          c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
        }
      }
      return (c ^ 0xffffffff) >>> 0;
    }

    function makeChunk(type, data) {
      const len = data.length;
      const chunk = Buffer.alloc(12 + len);
      chunk.writeUInt32BE(len, 0);
      chunk.write(type, 4, 4, 'ascii');
      data.copy(chunk, 8);
      const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
      const crc = crc32(typeAndData);
      chunk.writeUInt32BE(crc, 8 + len);
      return chunk;
    }

    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(w, 0);
    ihdrData.writeUInt32BE(h, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;

    const ihdrChunk = makeChunk('IHDR', ihdrData);
    const idatChunk = makeChunk('IDAT', newIdat);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  }

  // 1. Generate full-res (512x512) black logo
  const masterPng = encodePNG(reconstructed, width, height);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.png'), masterPng);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-512x512.png'), masterPng);

  // 2. Generate 192x192
  const buf192 = resizeImage(reconstructed, width, height, 192, 192);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-192x192.png'), encodePNG(buf192, 192, 192));

  // 3. Generate 180x180 for apple touch icon
  const buf180 = resizeImage(reconstructed, width, height, 180, 180);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-touch-icon.png'), encodePNG(buf180, 180, 180));

  // 4. Generate 96x96
  const buf96 = resizeImage(reconstructed, width, height, 96, 96);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-96x96.png'), encodePNG(buf96, 96, 96));

  // 5. Generate 48x48
  const buf48 = resizeImage(reconstructed, width, height, 48, 48);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon-48x48.png'), encodePNG(buf48, 48, 48));

  // 6. Generate favicon.ico (using 48x48 PNG container in ICO format)
  const png48 = encodePNG(buf48, 48, 48);
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // ICO type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(48, 0); // width
  icoEntry.writeUInt8(48, 1); // height
  icoEntry.writeUInt8(0, 2); // color palette
  icoEntry.writeUInt8(0, 3); // reserved
  icoEntry.writeUInt16LE(1, 4); // color planes
  icoEntry.writeUInt16LE(32, 6); // bits per pixel
  icoEntry.writeUInt32LE(png48.length, 8); // image size
  icoEntry.writeUInt32LE(6 + 16, 12); // image offset

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, png48]);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), icoBuffer);

  // 7. Generate clean SVG
  const b64 = masterPng.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Montaraw Black Logo (Transparent Background) -->
  <image href="data:image/png;base64,${b64}" width="${width}" height="${height}" />
</svg>`;
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.svg'), svgContent.trim());

  console.log('✅ All black favicon files (favicon.ico, favicon.png, favicon.svg, 48x48, 96x96, 192x192, 512x512, apple-touch-icon) updated successfully!');
}

processLogoToBlackTransparent();
