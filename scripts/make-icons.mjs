// Generates simple, original PNG app icons (no external dependencies).
import fs from "node:fs";
import zlib from "node:zlib";

function crc32(buf) {
  let c, crc = ~0;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return ~crc >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const NAVY = [6, 10, 22], NAVY2 = [26, 38, 72], GOLD = [217, 173, 75], BLUE = [67, 176, 255];

function icon(maskable) {
  const pad = maskable ? 0.0 : 0.0;
  return (u, v) => {
    const bg = mix(NAVY, NAVY2, Math.min(1, (u + v) / 2));
    const dx = u - 0.5, dy = v - 0.5, d = Math.hypot(dx, dy);
    const ringR = maskable ? 0.30 : 0.38;
    // ring
    if (Math.abs(d - ringR) < 0.018) return [...GOLD, 255];
    // open book: two pages as chevrons
    const s = maskable ? 0.8 : 1;
    const bx = dx / s, by = dy / s;
    const inBook = Math.abs(bx) < 0.20 && by > -0.12 && by < 0.16;
    const spine = Math.abs(bx) < 0.008 && by > -0.12 && by < 0.17;
    const top = by > -0.12 - 0.0 && by < -0.095 + Math.abs(bx) * 0.25 && Math.abs(bx) < 0.20;
    if (spine) return [...GOLD, 255];
    if (inBook && (top || Math.abs(Math.abs(bx) - 0.20) < 0.012 || by > 0.145)) return [...GOLD, 255];
    // blue spark
    if (Math.hypot(u - 0.66, v - 0.30) < 0.03) return [...BLUE, 255];
    return [...bg, 255];
  };
}
fs.mkdirSync("public/icons", { recursive: true });
fs.writeFileSync("public/icons/icon-192.png", png(192, icon(false)));
fs.writeFileSync("public/icons/icon-512.png", png(512, icon(false)));
fs.writeFileSync("public/icons/maskable-512.png", png(512, icon(true)));
fs.writeFileSync("public/icons/icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a1124"/><circle cx="32" cy="32" r="24" fill="none" stroke="#d9ad4b" stroke-width="2.6"/><path d="M17 41V22c6-2.6 11-2 15 1.500 4-3.500 9-4.100 15-1.500v19c-6-2.400-11-1.700-15 1.700C28 39.300 23 38.600 17 41Z" fill="none" stroke="#d9ad4b" stroke-width="2.4" stroke-linejoin="round"/><circle cx="46" cy="15" r="3.200" fill="#43b0ff"/></svg>`);
console.log("icons written");
