import { Term } from '../components/Term';
import { DrawdownRecovery, ExpectancySimulator, PositionSizeCalculator, RiskRewardVisual } from '../components/tools/RiskTools';
import { Callout, Formula, Playground } from '../components/ui';
import type { Lesson } from './types';

function RiskPerTrade() {
  return (
    <>
      <p>
        เทรดเดอร์มืออาชีพไม่ได้ถามว่า "ไม้นี้จะได้เท่าไร" แต่ถามว่า "<strong>ถ้าผิด จะเสียเท่าไร</strong>" ก่อนเสมอ
      </p>

      <h2>กฎ 1–2%</h2>
      <p>
        จำกัดขาดทุนต่อไม้ไม่เกิน 1–2% ของพอร์ต ถ้าพอร์ต $10,000 เสี่ยงไม้ละไม่เกิน $100–200 ไม่ได้หมายความว่าซื้อหุ้นแค่ $200
        แต่หมายถึง<strong>ถ้าโดน <Term id="stop-loss" /> จะเสียไม่เกิน $200</strong>
      </p>
      <Callout type="info" title="1R คืออะไร">
        <p>
          นิยามจำนวนเงินที่เสี่ยงต่อไม้ว่า <strong>1R</strong> แล้ววัดผลทุกไม้เป็น <Term id="r-multiple" /> เช่น เสี่ยง $200 กำไร $500 =
          +2.5R วิธีนี้ทำให้เปรียบเทียบไม้ต่างๆ ได้แม้ขนาดสถานะไม่เท่ากัน
        </p>
      </Callout>

      <h2><Term id="risk-reward" /></h2>
      <Formula>R:R = (Target − Entry) / (Entry − Stop)</Formula>
      <p>
        R:R ที่ดีทำให้คุณไม่ต้องชนะบ่อย ถ้า R:R = 1:3 ชนะแค่ 1 ใน 4 ไม้ก็ยังเท่าทุน แต่ R:R สูงมักแลกกับ Win Rate ที่ต่ำลง
        เพราะเป้าไกลกว่า
      </p>

      <Playground title="Risk:Reward Visualizer" hint="ลากจุด Stop และ Target ดูว่า R:R และ Win Rate ขั้นต่ำเปลี่ยนอย่างไร">
        <RiskRewardVisual />
      </Playground>

      <Callout type="warn" title="วาง Stop ตามโครงสร้างราคา ไม่ใช่ตามเงินที่อยากเสีย">
        <p>
          Stop ควรอยู่ที่จุดที่ "ถ้าราคาไปถึง แปลว่าความคิดเราผิด" เช่น ใต้แนวรับ แล้วค่อยใช้ position sizing ปรับจำนวนหุ้นให้ความเสี่ยงเป็น 1R
          อย่าย้าย Stop ให้แคบลงเพื่อจะได้ซื้อหุ้นมากขึ้น
        </p>
      </Callout>
    </>
  );
}

function PositionSizing() {
  return (
    <>
      <p>
        <Term id="position-sizing" /> คือการคำนวณว่าจะซื้อกี่หุ้นหรือกี่สัญญา เพื่อให้ขาดทุนเท่ากับที่กำหนดไว้เมื่อโดน stop
        นี่คือทักษะที่สำคัญที่สุดที่แยกเทรดเดอร์ที่อยู่รอดออกจากคนที่ล้างพอร์ต
      </p>

      <h2>สูตรสำหรับหุ้น</h2>
      <Formula>
        จำนวนหุ้น = (พอร์ต × % ความเสี่ยง) ÷ (ราคาเข้า − Stop Loss)
      </Formula>
      <Callout type="example">
        <p>
          พอร์ต $25,000 เสี่ยง 1% = $250 ซื้อที่ $80 stop ที่ $76 (เสี่ยงหุ้นละ $4) → ซื้อได้ 250 ÷ 4 = <strong>62 หุ้น</strong>{' '}
          (มูลค่า $4,960)
        </p>
      </Callout>

      <h2>สำหรับ Options</h2>
      <p>คำนวณจากขาดทุนสูงสุดต่อสัญญาของกลยุทธ์:</p>
      <ul>
        <li>
          <strong>Long Call/Put หรือ Debit Spread:</strong> ขาดทุนสูงสุด = premium ที่จ่าย × 100
        </li>
        <li>
          <strong>Credit Spread:</strong> ขาดทุนสูงสุด = (ส่วนต่าง strike − credit) × 100
        </li>
        <li>
          <strong>กลยุทธ์ความเสี่ยงไม่จำกัด:</strong> ต้องกำหนดจุดตัดขาดทุนเอง (เช่น ขาดทุน 2 เท่าของ credit) แล้วใช้ค่านั้นคำนวณ
        </li>
      </ul>
      <Callout type="example">
        <p>
          พอร์ต $25,000 เสี่ยง 2% = $500 ซื้อ Bull Call Spread ต้นทุน $3.40 → เสี่ยงสัญญาละ $340 → เปิดได้{' '}
          <strong>1 สัญญา</strong> (2 สัญญา = $680 เกินงบ)
        </p>
      </Callout>

      <Playground title="Position Size Calculator" hint="สลับระหว่างหุ้นและ Options ลองดูว่าระยะ stop ส่งผลต่อจำนวนหุ้นอย่างไร">
        <PositionSizeCalculator />
      </Playground>

      <Callout type="tip">
        <p>
          ถ้าคำนวณแล้วได้ 0 สัญญา แปลว่ากลยุทธ์นั้นเสี่ยงเกินไปสำหรับพอร์ตของคุณ ให้หาทางเลือกที่ขาดทุนสูงสุดน้อยกว่า เช่น
          เปลี่ยนจาก Long Call เป็น Spread ที่แคบลง
        </p>
      </Callout>
    </>
  );
}

function Expectancy() {
  return (
    <>
      <p>
        <Term id="win-rate" /> สูงไม่ได้แปลว่าได้กำไร และ Win Rate ต่ำก็ไม่ได้แปลว่าขาดทุน สิ่งที่สำคัญคือ{' '}
        <Term id="expectancy" />
      </p>
      <Formula>
        Expectancy (R) = (Win% × กำไรเฉลี่ย R) − (Loss% × ขาดทุนเฉลี่ย R)
      </Formula>

      <table>
        <thead>
          <tr>
            <th>ระบบ</th>
            <th>Win Rate</th>
            <th>R:R</th>
            <th>Expectancy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A: ชนะบ่อย กำไรน้อย</td>
            <td>80%</td>
            <td>0.2 : 1</td>
            <td className="text-rose-600 dark:text-rose-400">0.8×0.2 − 0.2×1 = −0.04R</td>
          </tr>
          <tr>
            <td>B: ชนะน้อย กำไรมาก</td>
            <td>35%</td>
            <td>3 : 1</td>
            <td className="text-emerald-600 dark:text-emerald-400">0.35×3 − 0.65×1 = +0.40R</td>
          </tr>
          <tr>
            <td>C: สมดุล</td>
            <td>55%</td>
            <td>1.2 : 1</td>
            <td className="text-emerald-600 dark:text-emerald-400">0.55×1.2 − 0.45×1 = +0.21R</td>
          </tr>
        </tbody>
      </table>

      <p>
        ระบบ A ดูดีเพราะชนะ 8 ใน 10 ไม้ แต่ระยะยาวขาดทุน ซึ่งเป็นกับดักของการขาย option โดยไม่ตัดขาดทุน
      </p>

      <Playground
        title="Expectancy Simulator"
        hint="ตั้ง Win Rate 45% R:R 2:1 แล้วลองเพิ่ม 'เสี่ยงต่อไม้' จาก 2% เป็น 15% ดู drawdown แล้วเพิ่มเป็น 40% — ระบบเดิมที่ expectancy เป็นบวก กลับทำให้พอร์ตหดลง"
      >
        <ExpectancySimulator />
      </Playground>

      <Callout type="warn" title="บทเรียนสำคัญ">
        <p>
          ระบบที่มี expectancy เป็นบวกยังล้างพอร์ตได้ถ้าเสี่ยงต่อไม้มากเกินไป เพราะการแพ้ติดกันเป็นเรื่องปกติทางสถิติ
          Edge (ความได้เปรียบ) + Position Sizing ที่เหมาะสม = อยู่รอดและเติบโต
        </p>
      </Callout>
    </>
  );
}

function DrawdownLesson() {
  return (
    <>
      <p>
        <Term id="drawdown" /> คือการที่พอร์ตลดลงจากจุดสูงสุด ปัญหาคือขาดทุนกับกำไรไม่สมมาตร ยิ่งขาดทุนลึก ยิ่งต้องกำไรมากเป็นทวีคูณเพื่อกลับมา
      </p>
      <Formula>กำไรที่ต้องใช้เพื่อกลับมาเท่าทุน = ขาดทุน% ÷ (100% − ขาดทุน%)</Formula>

      <table>
        <thead>
          <tr>
            <th>ขาดทุน</th>
            <th>ต้องกำไรกลับมา</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>−10%</td><td>+11%</td></tr>
          <tr><td>−25%</td><td>+33%</td></tr>
          <tr><td>−50%</td><td>+100%</td></tr>
          <tr><td>−75%</td><td>+300%</td></tr>
          <tr><td>−90%</td><td>+900%</td></tr>
        </tbody>
      </table>

      <Playground title="Drawdown & Recovery" hint="ลองเสี่ยงไม้ละ 10% แล้วแพ้ติดกัน 8 ไม้ เทียบกับเสี่ยงไม้ละ 1%">
        <DrawdownRecovery />
      </Playground>

      <h2>กฎป้องกันความเสียหายที่นิยมใช้</h2>
      <ul>
        <li>
          <strong>Daily loss limit:</strong> ขาดทุนถึง 3R ในวันเดียว หยุดเทรดวันนั้น
        </li>
        <li>
          <strong>ลดขนาดเมื่อ drawdown:</strong> พอร์ตลดลง 10% → ลดความเสี่ยงต่อไม้ลงครึ่งหนึ่ง จนกว่าจะกลับมา
        </li>
        <li>
          <strong>จำกัดความเสี่ยงรวม:</strong> สถานะที่เปิดอยู่ทั้งหมดรวมกันเสี่ยงไม่เกิน 5–10% ของพอร์ต
        </li>
        <li>
          <strong>ระวัง correlation:</strong> Long Call 5 ตัวในหุ้นเทคโนโลยี ≈ เดิมพันทิศทางเดียวกัน 5 เท่า
        </li>
      </ul>

      <Callout type="tip" title="ข้อคิดสุดท้าย">
        <p>
          เป้าหมายแรกของเทรดเดอร์ไม่ใช่การรวยเร็ว แต่คือ<strong>การอยู่รอดให้นานพอ</strong>ที่จะได้เรียนรู้และใช้ edge ของตัวเองได้
        </p>
      </Callout>
    </>
  );
}

export const MODULE6_LESSONS: Lesson[] = [
  {
    id: 'risk-per-trade',
    title: 'ความเสี่ยงต่อไม้และ Risk:Reward',
    summary: 'กฎ 1–2%, แนวคิด 1R และการวาง Stop Loss',
    minutes: 7,
    Body: RiskPerTrade,
    quiz: [
      {
        q: 'พอร์ต $20,000 ใช้กฎเสี่ยง 1% ต่อไม้ หมายความว่าอย่างไร?',
        choices: ['ซื้อหุ้นได้ไม่เกิน $200', 'ถ้าโดน stop จะขาดทุนไม่เกิน $200', 'กำไรไม่เกิน $200', 'เทรดได้วันละ 1 ไม้'],
        answer: 1,
        explain: '1% คือขาดทุนสูงสุดเมื่อโดน stop ไม่ใช่มูลค่าสถานะ',
      },
      {
        q: 'Entry $40, Stop $38, Target $46 มี R:R เท่าไร?',
        choices: ['1:1', '1:2', '1:3', '3:1'],
        answer: 2,
        explain: 'ความเสี่ยง $2, ผลตอบแทน $6 → 1:3',
      },
      {
        q: 'R:R 1:2 ต้องมี Win Rate ขั้นต่ำเท่าไรถึงจะเท่าทุน?',
        choices: ['50%', '33%', '25%', '66%'],
        answer: 1,
        explain: 'Win Rate ขั้นต่ำ = 1 ÷ (1 + 2) ≈ 33%',
      },
    ],
  },
  {
    id: 'position-sizing',
    title: 'Position Sizing',
    summary: 'คำนวณจำนวนหุ้น/สัญญาให้ความเสี่ยงเท่ากับ 1R',
    minutes: 8,
    Body: PositionSizing,
    quiz: [
      {
        q: 'พอร์ต $10,000 เสี่ยง 2% ซื้อที่ $50 stop $45 ซื้อได้กี่หุ้น?',
        choices: ['20 หุ้น', '40 หุ้น', '200 หุ้น', '400 หุ้น'],
        answer: 1,
        explain: '$200 ÷ $5 = 40 หุ้น',
      },
      {
        q: 'Credit Spread กว้าง $5 ได้ credit $1 ขาดทุนสูงสุดต่อสัญญาเท่าไร?',
        choices: ['$100', '$400', '$500', 'ไม่จำกัด'],
        answer: 1,
        explain: '($5 − $1) × 100 = $400',
      },
      {
        q: 'ถ้าวาง Stop ห่างขึ้น (ความเสี่ยงต่อหุ้นมากขึ้น) แต่ % ความเสี่ยงเท่าเดิม จำนวนหุ้นจะเป็นอย่างไร?',
        choices: ['เพิ่มขึ้น', 'ลดลง', 'เท่าเดิม', 'เป็น 0'],
        answer: 1,
        explain: 'เงินที่เสี่ยงเท่าเดิม หารด้วยความเสี่ยงต่อหุ้นที่มากขึ้น จำนวนหุ้นจึงลดลง',
      },
    ],
  },
  {
    id: 'expectancy',
    title: 'Expectancy: ระบบไหนทำเงินได้จริง',
    summary: 'Win Rate + R:R และการจำลอง equity curve',
    minutes: 8,
    Body: Expectancy,
    quiz: [
      {
        q: 'Win Rate 40%, R:R 2:1 มี Expectancy เท่าไร?',
        choices: ['−0.2R', '0R', '+0.2R', '+0.8R'],
        answer: 2,
        explain: '0.4 × 2 − 0.6 × 1 = 0.8 − 0.6 = +0.2R',
      },
      {
        q: 'ระบบชนะ 90% แต่ขาดทุนเฉลี่ย 10 เท่าของกำไรเฉลี่ย ผลระยะยาวเป็นอย่างไร?',
        choices: ['กำไรแน่นอน', 'ขาดทุน', 'เท่าทุนพอดี', 'บอกไม่ได้'],
        answer: 1,
        explain: '0.9 × 1 − 0.1 × 10 = −0.1R ต่อไม้ ขาดทุนในระยะยาว',
      },
      {
        q: 'ระบบที่ Expectancy เป็นบวก จะล้างพอร์ตได้ไหม?',
        choices: ['ไม่ได้เด็ดขาด', 'ได้ ถ้าเสี่ยงต่อไม้มากเกินไปและเจอแพ้ติดกัน', 'ได้เฉพาะตลาดขาลง', 'ได้เฉพาะ options'],
        answer: 1,
        explain: 'การแพ้ติดกันเกิดขึ้นได้เสมอ ถ้าเสี่ยงไม้ละมาก drawdown จะลึกจนฟื้นไม่ได้',
      },
    ],
  },
  {
    id: 'drawdown',
    title: 'Drawdown และการฟื้นตัว',
    summary: 'ทำไมขาดทุน 50% ต้องกำไร 100% และกฎป้องกันพอร์ต',
    minutes: 6,
    Body: DrawdownLesson,
    quiz: [
      {
        q: 'พอร์ตขาดทุน 50% ต้องกำไรเท่าไรถึงจะกลับมาเท่าทุน?',
        choices: ['50%', '75%', '100%', '150%'],
        answer: 2,
        explain: 'เงินเหลือครึ่งเดียว ต้องเพิ่มเป็น 2 เท่า = กำไร 100%',
      },
      {
        q: 'เสี่ยงไม้ละ 2% แพ้ติดกัน 10 ไม้ พอร์ตลดลงประมาณเท่าไร?',
        choices: ['2%', '10%', '18%', '50%'],
        answer: 2,
        explain: '1 − 0.98¹⁰ ≈ 18.3% (ไม่ถึง 20% เพราะเสี่ยงจากพอร์ตที่เล็กลงทุกครั้ง)',
      },
      {
        q: 'ถือ Long Call 5 ตัวในหุ้นเทคโนโลยี 5 บริษัท มีความเสี่ยงอะไรที่ต้องระวัง?',
        choices: ['ไม่มี เพราะกระจายแล้ว', 'Correlation สูง — เหมือนเดิมพันทิศทางเดียวกัน', 'ดอกเบี้ย', 'ปันผล'],
        answer: 1,
        explain: 'หุ้นกลุ่มเดียวกันมักเคลื่อนไหวไปด้วยกัน ความเสี่ยงจริงสูงกว่าที่คิด',
      },
    ],
  },
];
