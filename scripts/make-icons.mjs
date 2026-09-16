import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function png(size) {
  const rows = [];
  const cx = size / 2;
  const cy = size / 2;
  const rMark = size * 0.28;
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const i = 1 + x * 4;
      row[i] = 0;
      row[i + 1] = 102;
      row[i + 2] = 255;
      row[i + 3] = 255;
      if (d < rMark && Math.abs(dx) < size * 0.07) {
        row[i] = 255;
        row[i + 1] = 255;
        row[i + 2] = 255;
      }
      if (d < rMark && dy > 0 && Math.abs(dx - dy * 0.35) < size * 0.06) {
        row[i] = 255;
        row[i + 1] = 255;
        row[i + 2] = 255;
      }
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [180, 192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), png(size));
}
console.log('icons written');
