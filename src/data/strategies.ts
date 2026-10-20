import type { Leg } from '../lib/payoff';

export type Outlook = 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'own-stock';
export type IvView = 'high' | 'low' | 'any';

export interface Strategy {
  id: string;
  name: string;
  /** คำอธิบายสั้นภาษาไทย */
  summary: string;
  outlook: Outlook;
  /** เหมาะเมื่อ IV สูง (ขาย premium) หรือต่ำ (ซื้อ premium) */
  ivView: IvView;
  /** ความเสี่ยงจำกัด (defined risk) หรือไม่ */
  definedRisk: boolean;
  /** Debit = จ่ายเงินตอนเปิด, Credit = รับเงินตอนเปิด */
  flow: 'debit' | 'credit' | 'stock';
  legs: Omit<Leg, 'id'>[];
  howTo: string;
  whenToUse: string;
  risk: string;
}

const D = 30;

export const STRATEGIES: Strategy[] = [
  {
    id: 'long-call',
    name: 'Long Call',
    summary: 'ซื้อ Call เพื่อเก็งราคาขึ้น ขาดทุนสูงสุดเท่ากับ premium ที่จ่าย',
    outlook: 'bullish',
    ivView: 'low',
    definedRisk: true,
    flow: 'debit',
    legs: [{ type: 'call', side: 1, qty: 1, strike: 100, days: D }],
    howTo: 'Buy 1 Call ATM หรือ OTM เล็กน้อย',
    whenToUse: 'มั่นใจว่าราคาจะขึ้นแรงพอและเร็วพอภายในอายุสัญญา และ IV ยังไม่แพง',
    risk: 'ถ้าราคาไม่ขึ้นเกิน breakeven ก่อนหมดอายุ จะเสีย premium ทั้งหมด และโดน time decay ทุกวัน',
  },
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    summary: 'ซื้อ Call strike ต่ำ + ขาย Call strike สูง ลดต้นทุนแลกกับจำกัดกำไร',
    outlook: 'bullish',
    ivView: 'any',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'call', side: 1, qty: 1, strike: 100, days: D },
      { type: 'call', side: -1, qty: 1, strike: 110, days: D },
    ],
    howTo: 'Buy Call strike A + Sell Call strike B (B > A) วันหมดอายุเดียวกัน',
    whenToUse: 'คาดว่าราคาขึ้นปานกลางถึงระดับเป้าหมาย ต้องการต้นทุนต่ำกว่า Long Call',
    risk: 'กำไรสูงสุด = ส่วนต่าง strike − ต้นทุน, ขาดทุนสูงสุด = ต้นทุนที่จ่าย',
  },
  {
    id: 'bull-put-spread',
    name: 'Bull Put Spread',
    summary: 'ขาย Put strike สูง + ซื้อ Put strike ต่ำ รับ credit ถ้าราคาไม่ลง',
    outlook: 'bullish',
    ivView: 'high',
    definedRisk: true,
    flow: 'credit',
    legs: [
      { type: 'put', side: -1, qty: 1, strike: 95, days: D },
      { type: 'put', side: 1, qty: 1, strike: 90, days: D },
    ],
    howTo: 'Sell Put strike B + Buy Put strike A (A < B) วันหมดอายุเดียวกัน',
    whenToUse: 'คาดว่าราคาจะไม่ลงต่ำกว่า strike ที่ขาย และ IV สูง (premium แพง)',
    risk: 'กำไรสูงสุด = credit ที่ได้รับ, ขาดทุนสูงสุด = ส่วนต่าง strike − credit',
  },
  {
    id: 'cash-secured-put',
    name: 'Cash-Secured Put',
    summary: 'ขาย Put โดยกันเงินสดไว้ซื้อหุ้น ได้ premium หรือได้หุ้นในราคาที่ต้องการ',
    outlook: 'bullish',
    ivView: 'high',
    definedRisk: false,
    flow: 'credit',
    legs: [{ type: 'put', side: -1, qty: 1, strike: 95, days: D }],
    howTo: 'Sell 1 Put ที่ strike ที่อยากซื้อหุ้น และกันเงินสด strike × 100 ไว้',
    whenToUse: 'อยากได้หุ้นตัวนี้อยู่แล้วแต่อยากได้ราคาต่ำกว่าตอนนี้',
    risk: 'ถ้าหุ้นร่วงหนัก ต้องซื้อหุ้นที่ strike ทั้งที่ราคาตลาดต่ำกว่ามาก (ขาดทุนเหมือนถือหุ้น)',
  },
  {
    id: 'long-put',
    name: 'Long Put',
    summary: 'ซื้อ Put เพื่อเก็งราคาลง ขาดทุนสูงสุดเท่ากับ premium',
    outlook: 'bearish',
    ivView: 'low',
    definedRisk: true,
    flow: 'debit',
    legs: [{ type: 'put', side: 1, qty: 1, strike: 100, days: D }],
    howTo: 'Buy 1 Put ATM หรือ OTM เล็กน้อย',
    whenToUse: 'มั่นใจว่าราคาจะลงแรงภายในอายุสัญญา ใช้แทนการ Short หุ้นที่ความเสี่ยงไม่จำกัด',
    risk: 'ถ้าราคาไม่ลงต่ำกว่า breakeven จะเสีย premium ทั้งหมด',
  },
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    summary: 'ซื้อ Put strike สูง + ขาย Put strike ต่ำ เก็งลงด้วยต้นทุนที่ต่ำลง',
    outlook: 'bearish',
    ivView: 'any',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'put', side: 1, qty: 1, strike: 100, days: D },
      { type: 'put', side: -1, qty: 1, strike: 90, days: D },
    ],
    howTo: 'Buy Put strike B + Sell Put strike A (A < B)',
    whenToUse: 'คาดว่าราคาลงปานกลางถึงเป้าหมาย',
    risk: 'กำไรสูงสุด = ส่วนต่าง strike − ต้นทุน, ขาดทุนสูงสุด = ต้นทุนที่จ่าย',
  },
  {
    id: 'bear-call-spread',
    name: 'Bear Call Spread',
    summary: 'ขาย Call strike ต่ำ + ซื้อ Call strike สูง รับ credit ถ้าราคาไม่ขึ้น',
    outlook: 'bearish',
    ivView: 'high',
    definedRisk: true,
    flow: 'credit',
    legs: [
      { type: 'call', side: -1, qty: 1, strike: 105, days: D },
      { type: 'call', side: 1, qty: 1, strike: 110, days: D },
    ],
    howTo: 'Sell Call strike A + Buy Call strike B (B > A)',
    whenToUse: 'คาดว่าราคาจะไม่ขึ้นเกิน strike ที่ขาย และ IV สูง',
    risk: 'กำไรสูงสุด = credit, ขาดทุนสูงสุด = ส่วนต่าง strike − credit',
  },
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    summary: 'Bull Put Spread + Bear Call Spread ทำกำไรเมื่อราคาอยู่ในกรอบ',
    outlook: 'neutral',
    ivView: 'high',
    definedRisk: true,
    flow: 'credit',
    legs: [
      { type: 'put', side: 1, qty: 1, strike: 85, days: D },
      { type: 'put', side: -1, qty: 1, strike: 90, days: D },
      { type: 'call', side: -1, qty: 1, strike: 110, days: D },
      { type: 'call', side: 1, qty: 1, strike: 115, days: D },
    ],
    howTo: 'Buy Put A, Sell Put B, Sell Call C, Buy Call D (A < B < C < D)',
    whenToUse: 'คาดว่าราคาจะแกว่งในกรอบ B–C จนหมดอายุ และ IV สูงที่มีแนวโน้มจะลดลง',
    risk: 'ถ้าราคาหลุดกรอบแรง ขาดทุนสูงสุด = ความกว้างปีก − credit',
  },
  {
    id: 'long-butterfly',
    name: 'Long Call Butterfly',
    summary: 'ต้นทุนต่ำ กำไรสูงสุดเมื่อราคาปิดที่ strike กลางพอดี',
    outlook: 'neutral',
    ivView: 'high',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'call', side: 1, qty: 1, strike: 90, days: D },
      { type: 'call', side: -1, qty: 2, strike: 100, days: D },
      { type: 'call', side: 1, qty: 1, strike: 110, days: D },
    ],
    howTo: 'Buy 1 Call A, Sell 2 Call B, Buy 1 Call C (ระยะห่างเท่ากัน)',
    whenToUse: 'มีเป้าราคาชัดเจนว่าราคาจะปิดใกล้ strike กลาง',
    risk: 'ขาดทุนสูงสุด = ต้นทุนที่จ่าย (มักจะต่ำ) แต่โอกาสได้กำไรสูงสุดก็ต่ำเช่นกัน',
  },
  {
    id: 'short-strangle',
    name: 'Short Strangle',
    summary: 'ขาย Call OTM + ขาย Put OTM รับ premium สูง แต่ความเสี่ยงไม่จำกัด',
    outlook: 'neutral',
    ivView: 'high',
    definedRisk: false,
    flow: 'credit',
    legs: [
      { type: 'put', side: -1, qty: 1, strike: 90, days: D },
      { type: 'call', side: -1, qty: 1, strike: 110, days: D },
    ],
    howTo: 'Sell Put OTM + Sell Call OTM วันหมดอายุเดียวกัน',
    whenToUse: 'สำหรับผู้มีประสบการณ์ คาดว่าราคานิ่งและ IV สูงเกินจริง',
    risk: 'ขาดทุนไม่จำกัดถ้าราคาวิ่งแรงด้านใดด้านหนึ่ง ต้องใช้ margin สูง',
  },
  {
    id: 'calendar-spread',
    name: 'Calendar Spread',
    summary: 'ขาย option ระยะสั้น + ซื้อ option ระยะยาว strike เดียวกัน กิน time decay ส่วนต่าง',
    outlook: 'neutral',
    ivView: 'low',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'call', side: -1, qty: 1, strike: 100, days: 30 },
      { type: 'call', side: 1, qty: 1, strike: 100, days: 60 },
    ],
    howTo: 'Sell Call เดือนใกล้ + Buy Call เดือนไกล strike เดียวกัน',
    whenToUse: 'คาดว่าราคาอยู่ใกล้ strike ในระยะสั้น และ IV อาจเพิ่มขึ้น',
    risk: 'ขาดทุนถ้าราคาวิ่งห่างจาก strike มาก ขาดทุนสูงสุดประมาณต้นทุนที่จ่าย',
  },
  {
    id: 'long-straddle',
    name: 'Long Straddle',
    summary: 'ซื้อ Call + Put strike เดียวกัน ได้กำไรเมื่อราคาวิ่งแรงไม่ว่าทางไหน',
    outlook: 'volatile',
    ivView: 'low',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'call', side: 1, qty: 1, strike: 100, days: D },
      { type: 'put', side: 1, qty: 1, strike: 100, days: D },
    ],
    howTo: 'Buy Call ATM + Buy Put ATM strike และวันหมดอายุเดียวกัน',
    whenToUse: 'ก่อนเหตุการณ์ใหญ่ (เช่น งบการเงิน, FDA approval) ที่คาดว่าราคาจะวิ่งแรง แต่ไม่รู้ทิศ',
    risk: 'ต้นทุนสูง ถ้าราคานิ่งจะเสียทั้งสองขา และ IV มักลดลงหลังเหตุการณ์ (IV crush)',
  },
  {
    id: 'long-strangle',
    name: 'Long Strangle',
    summary: 'ซื้อ Call OTM + Put OTM ถูกกว่า Straddle แต่ต้องวิ่งแรงกว่า',
    outlook: 'volatile',
    ivView: 'low',
    definedRisk: true,
    flow: 'debit',
    legs: [
      { type: 'call', side: 1, qty: 1, strike: 110, days: D },
      { type: 'put', side: 1, qty: 1, strike: 90, days: D },
    ],
    howTo: 'Buy Call OTM + Buy Put OTM วันหมดอายุเดียวกัน',
    whenToUse: 'คาดว่าราคาจะวิ่งแรงมาก ต้องการต้นทุนต่ำกว่า Straddle',
    risk: 'ราคาต้องวิ่งผ่าน strike + premium ถึงจะกำไร มิฉะนั้นเสีย premium ทั้งหมด',
  },
  {
    id: 'covered-call',
    name: 'Covered Call',
    summary: 'ถือหุ้น 100 หุ้น + ขาย Call OTM รับ premium เป็นรายได้เพิ่ม',
    outlook: 'own-stock',
    ivView: 'high',
    definedRisk: false,
    flow: 'stock',
    legs: [
      { type: 'stock', side: 1, qty: 1, strike: 0, days: 0 },
      { type: 'call', side: -1, qty: 1, strike: 105, days: D },
    ],
    howTo: 'ถือหุ้น 100 หุ้น + Sell 1 Call OTM',
    whenToUse: 'ถือหุ้นระยะยาวและคาดว่าราคาจะขึ้นช้าๆ หรือทรงตัว อยากได้รายได้เพิ่ม',
    risk: 'จำกัดกำไรส่วนที่เกิน strike และยังรับความเสี่ยงขาลงของหุ้นเกือบเต็มๆ',
  },
  {
    id: 'protective-put',
    name: 'Protective Put',
    summary: 'ถือหุ้น + ซื้อ Put เป็นประกันภัยขาลง',
    outlook: 'own-stock',
    ivView: 'low',
    definedRisk: true,
    flow: 'stock',
    legs: [
      { type: 'stock', side: 1, qty: 1, strike: 0, days: 0 },
      { type: 'put', side: 1, qty: 1, strike: 95, days: D },
    ],
    howTo: 'ถือหุ้น 100 หุ้น + Buy 1 Put',
    whenToUse: 'กังวลว่าจะเกิดขาลงแรงในช่วงสั้นๆ แต่ยังไม่อยากขายหุ้น',
    risk: 'ต้องจ่าย premium เป็นค่าประกัน ถ้าหุ้นไม่ลงก็เสียค่าประกันนั้นไป',
  },
  {
    id: 'collar',
    name: 'Collar',
    summary: 'ถือหุ้น + ซื้อ Put + ขาย Call ป้องกันขาลงแบบแทบไม่มีต้นทุน',
    outlook: 'own-stock',
    ivView: 'any',
    definedRisk: true,
    flow: 'stock',
    legs: [
      { type: 'stock', side: 1, qty: 1, strike: 0, days: 0 },
      { type: 'put', side: 1, qty: 1, strike: 95, days: D },
      { type: 'call', side: -1, qty: 1, strike: 105, days: D },
    ],
    howTo: 'ถือหุ้น 100 หุ้น + Buy Put OTM + Sell Call OTM',
    whenToUse: 'อยากล็อกกำไรของหุ้นที่ขึ้นมามากแล้ว โดยไม่อยากจ่ายค่าประกันเพิ่ม',
    risk: 'จำกัดทั้งกำไรและขาดทุนในกรอบ Put strike ถึง Call strike',
  },
];

export const STRATEGY_MAP: Record<string, Strategy> = Object.fromEntries(STRATEGIES.map((s) => [s.id, s]));

export const OUTLOOK_LABEL: Record<Outlook, string> = {
  bullish: 'ขาขึ้น (Bullish)',
  bearish: 'ขาลง (Bearish)',
  neutral: 'ออกข้าง (Neutral)',
  volatile: 'ผันผวนแรง (Volatile)',
  'own-stock': 'ถือหุ้นอยู่แล้ว',
};
