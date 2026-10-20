import { seededRandom } from './risk';

/** แปลงข้อความเป็นตัวเลข (FNV-1a) ใช้เป็น seed */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** ลำดับ index ที่สลับแบบคงที่ตาม key (ได้ลำดับเดิมทุกครั้งที่ใช้ key เดิม) */
export function stableOrder(length: number, key: string): number[] {
  const rand = seededRandom(hashString(key));
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
