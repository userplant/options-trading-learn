# Trading Lab — เรียนรู้การเทรดแบบ Interactive

เว็บสำหรับเรียนรู้การเทรดและ Options ด้วยการลงมือเล่นจริง แต่ละบทเรียนมี 3 ส่วน:
**อ่านสั้นๆ → ลองเล่นกับเครื่องมือจำลอง → ทำแบบทดสอบ** เนื้อหาเป็นภาษาไทยปนศัพท์อังกฤษ ยกตัวอย่างจากตลาดสหรัฐ

> ⚠️ เนื้อหาทั้งหมดเป็นสื่อการเรียนรู้ ไม่ใช่คำแนะนำการลงทุน

## เนื้อหา

| โมดูล | สถานะ |
|---|---|
| 1. พื้นฐานตลาด — สินทรัพย์, Bid/Ask, ประเภทคำสั่ง, Leverage | ✅ Phase 1 |
| 2. รูปแบบการเทรดตามกรอบเวลา | 🔜 Phase 2 |
| 3. การวิเคราะห์ (Technical / Fundamental) | 🔜 Phase 2 |
| 4. กลยุทธ์การเทรดทั่วไป + Backtest Playground | 🔜 Phase 3 |
| 5. Options — Call/Put, IV, Greeks, Time Decay, กลยุทธ์ 16 แบบ | ✅ Phase 1 |
| 6. การบริหารความเสี่ยง — Position Sizing, Expectancy, Drawdown | ✅ Phase 1 |
| 7. จิตวิทยาและวินัยการเทรด | 🔜 Phase 2 |

## เครื่องมือ Interactive

- **Payoff Builder** — สร้างสถานะ options หลาย leg (รวมหุ้นและ calendar) ดูกราฟ P/L ณ วันหมดอายุและก่อนหมดอายุ, จุดคุ้มทุน, กำไร/ขาดทุนสูงสุด, โอกาสกำไร และ Greeks ของสถานะ
- **Strategy Finder** — เลือกมุมมองตลาด/IV/ความเสี่ยง แล้วรับกลยุทธ์ที่เหมาะ
- **Greeks Visualizer**, **Time Decay**, **ITM/ATM/OTM Explorer**
- **Position Size Calculator**, **Expectancy Simulator**, **Drawdown & Recovery**
- **Order Book Simulator**, **Leverage Calculator**, **Spread Cost Calculator**

ราคา option คำนวณด้วย Black-Scholes (European, ไม่มีปันผล) — สูตรอยู่ใน `src/lib/blackScholes.ts`

## พัฒนา

```bash
npm install
npm run dev       # เปิด dev server
npm test          # unit test ของสูตรคำนวณ
npm run build     # typecheck + build ไปที่ dist/
```

Stack: Vite + React + TypeScript + Tailwind CSS v4 + Recharts ทำงานฝั่ง client ทั้งหมด
ความคืบหน้าการเรียนเก็บใน `localStorage` ของเบราว์เซอร์

### โครงสร้าง

```
src/
  lib/         สูตรคำนวณ (Black-Scholes, payoff, risk) + theme/progress
  data/        กลยุทธ์ options สำเร็จรูป, อภิธานศัพท์
  content/     เนื้อหาบทเรียนแต่ละโมดูล + course.ts (สารบัญ)
  components/  UI, Quiz, Term (tooltip ศัพท์), tools/ (เครื่องมือ interactive)
  pages/       หน้า Home, Module, Lesson, Tools, Glossary
```

เพิ่มบทเรียนใหม่: สร้าง component ใน `src/content/` แล้วเพิ่มลงใน `lessons` ของโมดูลใน `src/content/course.ts`

## Deploy

`.github/workflows/deploy.yml` จะ build และ deploy ขึ้น GitHub Pages เมื่อ push เข้า `main`
(ต้องเปิด Settings → Pages → Source: **GitHub Actions** ก่อน) ใช้ HashRouter จึงไม่ต้องตั้งค่า rewrite
