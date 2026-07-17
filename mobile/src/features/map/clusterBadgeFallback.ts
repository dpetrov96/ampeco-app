/**
 * Pixel fallback used in Jest / when native ClusterBadgeModule is unavailable.
 * Production iOS uses Core Text via ClusterBadgeModule (readable system font).
 */

const AMPECO = [14, 96, 195, 255] as const;
const HALO = [14, 96, 195, 72] as const;
const BLACK = [17, 17, 17, 255] as const;
const WHITE = [255, 255, 255, 255] as const;

const DIGITS: Record<string, string[]> = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  k: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00100', '00100'],
};

function setPixel(
  px: Uint8Array,
  size: number,
  x: number,
  y: number,
  color: readonly [number, number, number, number],
) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }
  const i = (y * size + x) * 4;
  px[i] = color[0];
  px[i + 1] = color[1];
  px[i + 2] = color[2];
  px[i + 3] = color[3];
}

function fillCircle(
  px: Uint8Array,
  size: number,
  cx: number,
  cy: number,
  r: number,
  color: readonly [number, number, number, number],
) {
  const r2 = r * r;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(px, size, x, y, color);
      }
    }
  }
}

function blitText(
  px: Uint8Array,
  size: number,
  text: string,
  scale: number,
  color: readonly [number, number, number, number],
) {
  const glyphs = [...text].map(c => DIGITS[c]).filter(Boolean);
  const gw = 5;
  const gh = 7;
  const tw = glyphs.length * (gw + 1) - 1;
  const ox = Math.floor((size - tw * scale) / 2);
  const oy = Math.floor((size - gh * scale) / 2);
  glyphs.forEach((glyph, gi) => {
    glyph.forEach((bits, row) => {
      for (let col = 0; col < bits.length; col += 1) {
        if (bits[col] !== '1') {
          continue;
        }
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            setPixel(
              px,
              size,
              ox + (gi * (gw + 1) + col) * scale + sx,
              oy + row * scale + sy,
              color,
            );
          }
        }
      }
    });
  });
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = Uint8Array.from(type, ch => ch.charCodeAt(0));
  const len = u32(data.length);
  const body = new Uint8Array(typeBytes.length + data.length);
  body.set(typeBytes, 0);
  body.set(data, typeBytes.length);
  const crc = u32(crc32(body));
  const out = new Uint8Array(4 + body.length + 4);
  out.set(len, 0);
  out.set(body, 4);
  out.set(crc, 4 + body.length);
  return out;
}

function deflateStore(data: Uint8Array): Uint8Array {
  const maxBlock = 65535;
  const blocks: Uint8Array[] = [];
  for (let offset = 0; offset < data.length; offset += maxBlock) {
    const slice = data.subarray(offset, Math.min(offset + maxBlock, data.length));
    const isLast = offset + maxBlock >= data.length ? 1 : 0;
    const header = new Uint8Array(5);
    header[0] = isLast;
    header[1] = slice.length & 255;
    header[2] = (slice.length >> 8) & 255;
    const nlen = ~slice.length & 0xffff;
    header[3] = nlen & 255;
    header[4] = (nlen >> 8) & 255;
    const block = new Uint8Array(5 + slice.length);
    block.set(header, 0);
    block.set(slice, 5);
    blocks.push(block);
  }
  const rawLen = blocks.reduce((n, b) => n + b.length, 0);
  const raw = new Uint8Array(rawLen);
  let o = 0;
  for (const b of blocks) {
    raw.set(b, o);
    o += b.length;
  }
  const cmfFlg = new Uint8Array([0x78, 0x01]);
  let a1 = 1;
  let a2 = 0;
  for (let i = 0; i < data.length; i += 1) {
    a1 = (a1 + data[i]) % 65521;
    a2 = (a2 + a1) % 65521;
  }
  const adler = u32(((a2 << 16) | a1) >>> 0);
  const out = new Uint8Array(cmfFlg.length + raw.length + adler.length);
  out.set(cmfFlg, 0);
  out.set(raw, cmfFlg.length);
  out.set(adler, cmfFlg.length + raw.length);
  return out;
}

function encodePng(size: number, rgba: Uint8Array): Uint8Array {
  const raw = new Uint8Array((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    raw.set(rgba.subarray(y * size * 4, (y + 1) * size * 4), rowStart + 1);
  }
  const signature = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
  const ihdr = new Uint8Array(13);
  ihdr.set(u32(size), 0);
  ihdr.set(u32(size), 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateStore(raw)),
    chunk('IEND', new Uint8Array(0)),
  ];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += alphabet[(triplet >> 18) & 63];
    result += alphabet[(triplet >> 12) & 63];
    result += i + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }
  return result;
}

export function renderClusterBadgeDataUriFallback(count: number): string {
  const size = count >= 100 ? 144 : count >= 10 ? 120 : 108;
  const label =
    count >= 1000
      ? `${Math.round(count / 100) / 10}k`
      : String(count);
  const scale = count < 10 ? 4 : 3;
  const px = new Uint8Array(size * size * 4);
  const c = size / 2;
  fillCircle(px, size, c, c, size / 2 - 2, HALO);
  fillCircle(px, size, c, c, size / 2 - 8, BLACK);
  fillCircle(px, size, c, c, size / 2 - 12, AMPECO);
  blitText(px, size, label, scale, WHITE);
  return `data:image/png;base64,${bytesToBase64(encodePng(size, px))}`;
}
