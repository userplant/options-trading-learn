export interface PatternLine {
  t1: number;
  p1: number;
  t2: number;
  p2: number;
  label?: string;
}

export interface ChartPattern {
  id: string;
  name: string;
  thai: string;
  bias: 'bullish' | 'bearish';
  kind: 'reversal' | 'continuation';
  /** จุดสำคัญ [เวลา 0–1, ราคาเทียบฐาน] */
  keypoints: [number, number][];
  lines: PatternLine[];
  description: string;
  trade: string;
}

type Base = Omit<ChartPattern, 'id' | 'name' | 'thai' | 'bias' | 'description' | 'trade'>;

const MIRROR_LABEL: Record<string, string> = {
  Resistance: 'Support',
  Support: 'Resistance',
  'Rising support': 'Falling resistance',
};

/** กลับด้านรูปแบบ (ขาขึ้น ↔ ขาลง) รอบราคา 1.0 */
const mirror = (b: Base): Base => ({
  ...b,
  keypoints: b.keypoints.map(([t, p]) => [t, 2 - p]),
  lines: b.lines.map((l) => ({ ...l, p1: 2 - l.p1, p2: 2 - l.p2, label: l.label && (MIRROR_LABEL[l.label] ?? l.label) })),
});

const HS: Base = {
  kind: 'reversal',
  keypoints: [
    [0, 0.85], [0.22, 1.05], [0.32, 0.97], [0.45, 1.12], [0.58, 0.97], [0.7, 1.05], [0.8, 0.97], [1, 0.87],
  ],
  lines: [{ t1: 0.32, p1: 0.97, t2: 0.9, p2: 0.97, label: 'Neckline' }],
};

const DT: Base = {
  kind: 'reversal',
  keypoints: [
    [0, 0.85], [0.3, 1.08], [0.48, 0.98], [0.66, 1.08], [0.78, 0.98], [1, 0.89],
  ],
  lines: [
    { t1: 0.3, p1: 1.08, t2: 0.66, p2: 1.08, label: 'Resistance' },
    { t1: 0.48, p1: 0.98, t2: 0.9, p2: 0.98, label: 'Neckline' },
  ],
};

const AT: Base = {
  kind: 'continuation',
  keypoints: [
    [0, 0.86], [0.15, 1.05], [0.27, 0.93], [0.42, 1.05], [0.53, 0.97], [0.65, 1.05], [0.73, 1.0], [0.81, 1.05], [0.9, 1.1], [1, 1.15],
  ],
  lines: [
    { t1: 0.15, p1: 1.05, t2: 0.85, p2: 1.05, label: 'Resistance' },
    { t1: 0.27, p1: 0.93, t2: 0.78, p2: 1.015, label: 'Rising support' },
  ],
};

const FLAG: Base = {
  kind: 'continuation',
  keypoints: [
    [0, 0.85], [0.35, 1.08], [0.45, 1.03], [0.53, 1.06], [0.62, 1.01], [0.7, 1.04], [0.78, 1.0], [0.88, 1.1], [1, 1.18],
  ],
  lines: [
    { t1: 0.35, p1: 1.08, t2: 0.78, p2: 1.03, label: 'Flag' },
    { t1: 0.45, p1: 1.03, t2: 0.82, p2: 0.99 },
  ],
};

export const CHART_PATTERNS: ChartPattern[] = [
  {
    id: 'head-shoulders',
    name: 'Head & Shoulders',
    thai: 'หัวและไหล่',
    bias: 'bearish',
    ...HS,
    description: 'ยอด 3 ยอด ยอดกลาง (หัว) สูงสุด สองข้าง (ไหล่) ใกล้เคียงกัน บ่งบอกว่าแรงซื้อเริ่มหมดหลังขาขึ้น',
    trade: 'ขาย/Short เมื่อราคาปิดหลุด Neckline · Stop เหนือไหล่ขวา · เป้าหมาย ≈ ความสูงจากหัวถึง Neckline',
  },
  {
    id: 'inverse-head-shoulders',
    name: 'Inverse Head & Shoulders',
    thai: 'หัวและไหล่กลับหัว',
    bias: 'bullish',
    ...mirror(HS),
    description: 'กลับด้านของ Head & Shoulders เกิดหลังขาลง บ่งบอกว่าแรงขายหมดและอาจกลับเป็นขาขึ้น',
    trade: 'ซื้อเมื่อราคาปิดทะลุ Neckline · Stop ใต้ไหล่ขวา · เป้าหมาย ≈ ความลึกจากหัวถึง Neckline',
  },
  {
    id: 'double-top',
    name: 'Double Top',
    thai: 'สองยอด',
    bias: 'bearish',
    ...DT,
    description: 'ราคาขึ้นไปทดสอบแนวต้านเดิม 2 ครั้งแต่ผ่านไม่ได้ เป็นรูปตัว M',
    trade: 'ขายเมื่อหลุด Neckline (จุดต่ำระหว่างสองยอด) · Stop เหนือยอด · เป้าหมาย ≈ ความสูงของรูปแบบ',
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom',
    thai: 'สองก้น',
    bias: 'bullish',
    ...mirror(DT),
    description: 'ราคาลงมาทดสอบแนวรับเดิม 2 ครั้งแต่ไม่หลุด เป็นรูปตัว W',
    trade: 'ซื้อเมื่อทะลุ Neckline · Stop ใต้ก้น · เป้าหมาย ≈ ความลึกของรูปแบบ',
  },
  {
    id: 'ascending-triangle',
    name: 'Ascending Triangle',
    thai: 'สามเหลี่ยมขาขึ้น',
    bias: 'bullish',
    ...AT,
    description: 'แนวต้านแนวนอน + จุดต่ำที่ยกตัวสูงขึ้นเรื่อยๆ ผู้ซื้อเข้ามาเร็วขึ้นทุกครั้ง มักทะลุขึ้น',
    trade: 'ซื้อเมื่อปิดทะลุแนวต้านพร้อม volume · Stop ใต้จุดต่ำล่าสุด · เป้าหมาย ≈ ความสูงฐานสามเหลี่ยม',
  },
  {
    id: 'descending-triangle',
    name: 'Descending Triangle',
    thai: 'สามเหลี่ยมขาลง',
    bias: 'bearish',
    ...mirror(AT),
    description: 'แนวรับแนวนอน + จุดสูงที่ต่ำลงเรื่อยๆ ผู้ขายกดดันมากขึ้น มักหลุดลง',
    trade: 'ขายเมื่อปิดหลุดแนวรับ · Stop เหนือจุดสูงล่าสุด · เป้าหมาย ≈ ความสูงฐานสามเหลี่ยม',
  },
  {
    id: 'bull-flag',
    name: 'Bull Flag',
    thai: 'ธงขาขึ้น',
    bias: 'bullish',
    ...FLAG,
    description: 'ราคาพุ่งแรง (เสาธง) แล้วพักตัวลงในกรอบแคบเอียงลงเล็กน้อย (ผืนธง) ก่อนวิ่งต่อ',
    trade: 'ซื้อเมื่อทะลุขอบบนของธง · Stop ใต้ธง · เป้าหมาย ≈ ความยาวเสาธง',
  },
  {
    id: 'bear-flag',
    name: 'Bear Flag',
    thai: 'ธงขาลง',
    bias: 'bearish',
    ...mirror(FLAG),
    description: 'ราคาร่วงแรงแล้วเด้งขึ้นในกรอบแคบ ก่อนลงต่อ',
    trade: 'ขายเมื่อหลุดขอบล่างของธง · Stop เหนือธง · เป้าหมาย ≈ ความยาวเสาธง',
  },
];
