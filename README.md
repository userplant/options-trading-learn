# Trading Lab — เรียนรู้การเทรดแบบ Interactive

เว็บสำหรับเรียนรู้การเทรดและ Options ด้วยการลงมือเล่นจริง แต่ละบทเรียนมี 3 ส่วน:
**อ่านสั้นๆ → ลองเล่นกับเครื่องมือจำลอง → ทำแบบทดสอบ** เนื้อหาเป็นภาษาไทยปนศัพท์อังกฤษ ยกตัวอย่างจากตลาดสหรัฐ

> ⚠️ เนื้อหาทั้งหมดเป็นสื่อการเรียนรู้ ไม่ใช่คำแนะนำการลงทุน

## เนื้อหา

| โมดูล | บทเรียน |
|---|---|
| 1. พื้นฐานตลาด — สินทรัพย์, Bid/Ask, ประเภทคำสั่ง, Leverage | 4 |
| 2. รูปแบบการเทรด — Scalping ถึงลงทุนระยะยาว, ต้นทุน, กฎ PDT | 3 |
| 3. การวิเคราะห์ — แท่งเทียน, เทรนด์/แนวรับแนวต้าน, Chart Patterns, Indicators, Fundamental | 5 |
| 4. กลยุทธ์การเทรด — Trend, Breakout/Pullback, Mean Reversion, Backtest, Overfitting | 5 |
| 5. Options — Call/Put, IV, Greeks, Time Decay, กลยุทธ์ 16 แบบ | 11 |
| 6. การบริหารความเสี่ยง — Position Sizing, Expectancy, Drawdown | 4 |
| 7. จิตวิทยา — อคติ, สถานการณ์จำลอง, Trading Journal, Trading Plan | 3 |

## เครื่องมือ Interactive

- **Payoff Builder** — สร้างสถานะ options หลาย leg (รวมหุ้นและ calendar) ดูกราฟ P/L ณ วันหมดอายุและก่อนหมดอายุ, จุดคุ้มทุน, กำไร/ขาดทุนสูงสุด, โอกาสกำไร และ Greeks ของสถานะ
- **Strategy Finder** — เลือกมุมมองตลาด/IV/ความเสี่ยง แล้วรับกลยุทธ์ที่เหมาะ
- **Greeks Visualizer**, **Time Decay**, **ITM/ATM/OTM Explorer**
- **Position Size Calculator**, **Expectancy Simulator**, **Drawdown & Recovery**
- **Order Book Simulator**, **Leverage Calculator**, **Spread Cost Calculator**
- **Backtest Playground** — 6 กลยุทธ์ (MA Crossover, Momentum, Donchian Breakout, Pullback, RSI/Bollinger Reversion) บนข้อมูลราคาจำลอง 5 สภาพตลาด พร้อม stop loss, position sizing, ต้นทุน และ Monte Carlo
- **Overfitting Demo** — หาพารามิเตอร์ที่ดีที่สุดแบบ in-sample แล้วทดสอบ out-of-sample
- **Indicator Lab** (SMA/EMA/Bollinger/RSI/MACD), **Trend Structure**, **Candle Anatomy**, **เกมทาย Chart Pattern**, **Valuation Calculator**
- **Trading Journal** (บันทึก + วิเคราะห์ตาม setup/อารมณ์ + Export CSV), **Trading Plan Builder**, **สถานการณ์จำลองด้านจิตวิทยา**
- **Timeframe Zoom**, **ต้นทุนตามสไตล์การเทรด**, **แบบทดสอบสไตล์การเทรด**

ราคา option คำนวณด้วย Black-Scholes (European, ไม่มีปันผล) — สูตรอยู่ใน `src/lib/blackScholes.ts`
ข้อมูลราคาสำหรับกราฟและ backtest เป็นข้อมูลจำลองแบบ seeded (`src/lib/marketData.ts`) ไม่ใช่ราคาจริง
กราฟแท่งเทียนเป็น SVG ที่เขียนเอง (`src/components/charts/CandleChart.tsx`)

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
  lib/         สูตรคำนวณ (Black-Scholes, payoff, risk, indicators, backtest, ข้อมูลจำลอง) + theme/progress
  data/        กลยุทธ์ options สำเร็จรูป, chart patterns, อภิธานศัพท์
  content/     เนื้อหาบทเรียนแต่ละโมดูล + course.ts (สารบัญ)
  components/  UI, Quiz, Term (tooltip ศัพท์), tools/ (เครื่องมือ interactive)
  pages/       หน้า Home, Module, Lesson, Tools, Glossary
```

เพิ่มบทเรียนใหม่: สร้าง component ใน `src/content/` แล้วเพิ่มลงใน `lessons` ของโมดูลใน `src/content/course.ts`

## Deploy

`.github/workflows/deploy.yml` จะ build และ deploy ขึ้น GitHub Pages เมื่อ push เข้า `main`
(ต้องเปิด Settings → Pages → Source: **GitHub Actions** ก่อน) ใช้ HashRouter จึงไม่ต้องตั้งค่า rewrite
