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
  const rawPixels = Buffer.alloc(height * width * 4);

  // Reconstruct uncompressed filtered scanlines
  const unfilter = (type, current, prev, bpp) => {
    switch (type) {
      case 0: return current; // None
      case 1: return (current + prev) & 0xff; // Sub
      case 2: return (current + prev) & 0xff; // Up
      case 3: return (current + Math.floor(prev / 2)) & 0xff; // Average
      case 4: return (current + prev) & 0xff; // Paeth approx
      default: return current;
    }
  };

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

    // Transform pixels: White -> Solid Black, Red -> Vibrant Red, Transparent -> 0 Alpha
    for (let x = 0; x < width; x++) {
      const idx = x * 4;
      let r = curRow[idx];
      let g = curRow[idx + 1];
      let b = curRow[idx + 2];
      let a = curRow[idx + 3];

      // Check if it's the red eye accent
      const isRed = r > 140 && g < 90 && b < 90;

      if (!isRed && a > 10) {
        // Change white/gray logo shape to solid BLACK (#000000)
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

  // Create clean uncompressed output with filter type 0 (None)
  const outputData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    outputData[y * (1 + width * 4)] = 0; // Filter None
    reconstructed.copy(outputData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const newIdat = zlib.deflateSync(outputData);

  // Helper to build PNG chunks with CRC32
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
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', newIdat);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const finalPng = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

  // Write black transparent PNG
  const outPngPath = path.join(process.cwd(), 'public', 'favicon.png');
  fs.writeFileSync(outPngPath, finalPng);

  // Also build clean transparent SVG with black logo
  const b64 = finalPng.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Montaraw Black Logo (Transparent Background) -->
  <image href="data:image/png;base64,${b64}" width="${width}" height="${height}" />
</svg>`;

  const outSvgPath = path.join(process.cwd(), 'public', 'favicon.svg');
  fs.writeFileSync(outSvgPath, svgContent.trim());

  console.log('✅ Generated transparent black logo favicon (favicon.png and favicon.svg) successfully!');
}

processLogoToBlackTransparent();
