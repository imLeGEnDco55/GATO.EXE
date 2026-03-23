import type { GatoCard } from './gatoCard';
import { CARD_CHUNK_KEY, validateCard } from './gatoCard';

/**
 * PNG Steganography Codec
 * Embeds/extracts GatoCard JSON in PNG tEXt chunks.
 *
 * PNG structure: [signature][chunks...]
 * We inject a tEXt chunk with keyword "GatoCard" before IEND.
 *
 * tEXt chunk format:
 *   4 bytes: data length
 *   4 bytes: "tEXt"
 *   N bytes: keyword\0value
 *   4 bytes: CRC32
 */

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

/** CRC32 lookup table */
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function textEncoder(): TextEncoder { return new TextEncoder(); }
function textDecoder(): TextDecoder { return new TextDecoder(); }

/**
 * Build a PNG tEXt chunk with keyword and value
 */
function buildTextChunk(keyword: string, value: string): Uint8Array {
  const enc = textEncoder();
  const keyBytes = enc.encode(keyword);
  const valBytes = enc.encode(value);
  // data = keyword + null separator + value
  const dataLen = keyBytes.length + 1 + valBytes.length;

  const chunk = new Uint8Array(4 + 4 + dataLen + 4); // length + type + data + crc
  const view = new DataView(chunk.buffer);

  // Length (4 bytes, big-endian)
  view.setUint32(0, dataLen, false);

  // Chunk type: "tEXt"
  chunk[4] = 0x74; // t
  chunk[5] = 0x45; // E
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t

  // Data: keyword\0value
  chunk.set(keyBytes, 8);
  chunk[8 + keyBytes.length] = 0; // null separator
  chunk.set(valBytes, 8 + keyBytes.length + 1);

  // CRC32 over type + data
  const crcData = chunk.slice(4, 8 + dataLen);
  const checksum = crc32(crcData);
  view.setUint32(8 + dataLen, checksum, false);

  return chunk;
}

/**
 * Find the position of IEND chunk in PNG data
 */
function findIEND(data: Uint8Array): number {
  // Search for "IEND" (0x49454E44) backwards for efficiency
  for (let i = data.length - 12; i >= 8; i--) {
    if (data[i + 4] === 0x49 && data[i + 5] === 0x45 &&
        data[i + 6] === 0x4E && data[i + 7] === 0x44) {
      return i;
    }
  }
  return -1;
}

/**
 * Encode a GatoCard into a PNG blob by injecting tEXt chunk before IEND
 */
export async function encodeCardToPng(
  imageBlob: Blob,
  card: GatoCard
): Promise<Blob> {
  const buffer = await imageBlob.arrayBuffer();
  const pngData = new Uint8Array(buffer);

  // Verify PNG signature
  for (let i = 0; i < 8; i++) {
    if (pngData[i] !== PNG_SIGNATURE[i]) {
      throw new Error('Not a valid PNG file');
    }
  }

  // Find IEND position
  const iendPos = findIEND(pngData);
  if (iendPos === -1) throw new Error('No IEND chunk found');

  // Build our tEXt chunk
  const cardJson = JSON.stringify(card);
  const textChunk = buildTextChunk(CARD_CHUNK_KEY, cardJson);

  // Assemble: [before IEND] + [tEXt chunk] + [IEND chunk]
  const before = pngData.slice(0, iendPos);
  const iend = pngData.slice(iendPos); // includes IEND + anything after

  const result = new Uint8Array(before.length + textChunk.length + iend.length);
  result.set(before, 0);
  result.set(textChunk, before.length);
  result.set(iend, before.length + textChunk.length);

  return new Blob([result], { type: 'image/png' });
}

/**
 * Decode a GatoCard from a PNG file by reading tEXt chunks
 */
export async function decodeCardFromPng(file: File | Blob): Promise<GatoCard | null> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Verify PNG
  for (let i = 0; i < 8; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) return null;
  }

  // Walk through chunks
  let offset = 8; // skip signature
  const dec = textDecoder();

  while (offset < data.length - 8) {
    const view = new DataView(data.buffer, offset);
    const chunkLen = view.getUint32(0, false);
    const chunkType = dec.decode(data.slice(offset + 4, offset + 8));

    if (chunkType === 'tEXt') {
      // Parse keyword\0value
      const chunkData = data.slice(offset + 8, offset + 8 + chunkLen);
      const nullIdx = chunkData.indexOf(0);
      if (nullIdx > 0) {
        const keyword = dec.decode(chunkData.slice(0, nullIdx));
        if (keyword === CARD_CHUNK_KEY) {
          const value = dec.decode(chunkData.slice(nullIdx + 1));
          try {
            const parsed = JSON.parse(value);
            if (validateCard(parsed)) return parsed;
          } catch { /* corrupted */ }
        }
      }
    }

    if (chunkType === 'IEND') break;
    offset += 4 + 4 + chunkLen + 4; // length + type + data + crc
  }

  return null;
}

/**
 * Quick check if a file might contain a GatoCard
 */
export async function hasGatoCard(file: File): Promise<boolean> {
  const card = await decodeCardFromPng(file);
  return card !== null;
}
