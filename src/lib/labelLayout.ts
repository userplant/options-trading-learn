/**
 * จัดตำแหน่งป้ายตามแกนตั้งไม่ให้ซ้อนกัน: ป้ายแต่ละอันห่างกันอย่างน้อย minGap
 * และอยู่ในช่วง [top, bottom] โดยขยับจากตำแหน่งที่ต้องการให้น้อยที่สุด
 * คืนค่าตำแหน่งใหม่ตามลำดับเดิมของ ys
 */
export function spreadLabels(ys: number[], minGap: number, top: number, bottom: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const placed = order.map((o) => o.y);
  // ดันลงจากบนลงล่าง
  for (let k = 0; k < placed.length; k++) {
    placed[k] = Math.max(placed[k], k === 0 ? top : placed[k - 1] + minGap);
  }
  // ถ้าล้นขอบล่าง ดันขึ้นจากล่างขึ้นบน
  for (let k = placed.length - 1; k >= 0; k--) {
    placed[k] = Math.min(placed[k], k === placed.length - 1 ? bottom : placed[k + 1] - minGap);
  }
  const out = new Array<number>(ys.length);
  order.forEach((o, k) => (out[o.i] = placed[k]));
  return out;
}
