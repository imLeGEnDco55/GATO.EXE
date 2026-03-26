import { CustomHackData, validateCustomHack } from './hackCard';

const SIGNATURE = new TextEncoder().encode("GATO_HACK_V1:");

/**
 * Embeds JSON hack data into a Base64 PNG image by appending it after the IEND chunk.
 */
export async function encodeHackToPng(base64Image: string, hackData: CustomHackData): Promise<string> {
  const res = await fetch(base64Image);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();

  const dataStr = JSON.stringify(hackData);
  const dataBytes = new TextEncoder().encode(dataStr);

  const finalSize = buffer.byteLength + SIGNATURE.byteLength + dataBytes.byteLength;
  const finalBuffer = new Uint8Array(finalSize);
  
  finalBuffer.set(new Uint8Array(buffer), 0);
  finalBuffer.set(SIGNATURE, buffer.byteLength);
  finalBuffer.set(dataBytes, buffer.byteLength + SIGNATURE.byteLength);

  const finalBlob = new Blob([finalBuffer], { type: 'image/png' });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(finalBlob);
  });
}

/**
 * Extracts and validates hack data from a PNG file if present.
 */
export async function decodeHackFromPng(file: File | Blob): Promise<CustomHackData | null> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  const sig = SIGNATURE;
  let matchIdx = -1;
  
  // Search for SIGNATURE from the end (since it's appended)
  for (let i = bytes.length - sig.length; i >= 0; i--) {
    let match = true;
    for (let j = 0; j < sig.length; j++) {
      if (bytes[i + j] !== sig[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      matchIdx = i;
      break;
    }
  }

  if (matchIdx === -1) return null;

  const dataBytes = bytes.slice(matchIdx + sig.length);
  const dataStr = new TextDecoder().decode(dataBytes);
  try {
    const data = JSON.parse(dataStr);
    if (validateCustomHack(data)) {
      return data;
    }
  } catch (e) {
    console.error('Failed to parse hack data from PNG', e);
  }
  return null;
}
