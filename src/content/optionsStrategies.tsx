import { Link } from 'react-router-dom';
import { Term } from '../components/Term';
import { PayoffBuilder } from '../components/tools/PayoffBuilder';
import { StrategyCard } from '../components/tools/StrategyCard';
import { StrategyFinder } from '../components/tools/StrategyFinder';
import { Callout, Playground } from '../components/ui';
import type { Lesson } from './types';

function Bullish() {
  return (
    <>
      <p>
        เมื่อคิดว่าราคาจะขึ้น มีหลายวิธีนอกจากซื้อหุ้น แต่ละแบบแลกเปลี่ยนระหว่าง <strong>ต้นทุน</strong>,{' '}
        <strong>กำไรสูงสุด</strong> และ <strong>โอกาสชนะ</strong> ต่างกัน
      </p>
      <Callout type="info" title="Debit vs Credit">
        <p>
          กลยุทธ์ <Term id="debit" /> (จ่ายเงินก่อน) ต้องการให้ราคาวิ่งไปทางที่คิด ส่วนกลยุทธ์ <Term id="credit" /> (รับเงินก่อน)
          แค่ต้องการให้ราคา "ไม่วิ่งสวน" ก็ได้กำไร แต่กำไรสูงสุดจำกัดเท่า credit ที่ได้รับ
        </p>
      </Callout>

      <StrategyCard id="long-call" />
      <StrategyCard id="bull-call-spread" />
      <StrategyCard id="bull-put-spread" />
      <StrategyCard id="cash-secured-put" />

      <h2>เลือกแบบไหนดี?</h2>
      <table>
        <thead>
          <tr>
            <th>สถานการณ์</th>
            <th>กลยุทธ์ที่เหมาะ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>มั่นใจมากว่าจะขึ้นแรง IV ต่ำ</td>
            <td>Long Call</td>
          </tr>
          <tr>
            <td>คิดว่าขึ้นปานกลางถึงเป้าที่ชัดเจน</td>
            <td>Bull Call Spread</td>
          </tr>
          <tr>
            <td>คิดว่าไม่ลง (ขึ้นหรือทรงตัว) IV สูง</td>
            <td>Bull Put Spread</td>
          </tr>
          <tr>
            <td>อยากซื้อหุ้นถูกลงกว่าราคาตลาด</td>
            <td>Cash-Secured Put</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Bearish() {
  return (
    <>
      <p>
        แทนที่จะ <Term id="short" /> หุ้นซึ่งขาดทุนไม่จำกัดและต้องยืมหุ้น options ให้คุณเก็งราคาลงโดย<strong>รู้ขาดทุนสูงสุดล่วงหน้า</strong>
      </p>

      <StrategyCard id="long-put" />
      <StrategyCard id="bear-put-spread" />
      <StrategyCard id="bear-call-spread" />

      <Callout type="tip">
        <p>
          ตลาดหุ้นมักลงเร็วกว่าขึ้น และ IV มักพุ่งตอนตลาดลง ทำให้ Put แพงขึ้นในช่วงตื่นตระหนก ถ้าซื้อ Put ตอน IV สูงแล้ว
          อาจเสียเปรียบ ลองพิจารณา Bear Put Spread ซึ่งการขายขาหนึ่งช่วยลดผลของ IV
        </p>
      </Callout>
    </>
  );
}

function Neutral() {
  return (
    <>
      <p>
        หุ้นส่วนใหญ่ใช้เวลาแกว่งในกรอบมากกว่าวิ่งเป็นเทรนด์ กลยุทธ์ตลาดออกข้างทำกำไรจาก <Term id="theta" /> และการลดลงของ{' '}
        <Term id="iv" /> โดยไม่ต้องทายทิศทาง
      </p>

      <StrategyCard id="iron-condor" />
      <StrategyCard id="long-butterfly" />
      <StrategyCard id="calendar-spread" />
      <StrategyCard id="short-strangle" />

      <Callout type="warn" title="โอกาสชนะสูง ≠ ได้กำไรระยะยาว">
        <p>
          Iron Condor หรือ Short Strangle อาจชนะ 70–80% ของจำนวนครั้ง แต่ครั้งที่แพ้อาจขาดทุนมากกว่ากำไรหลายครั้งรวมกัน
          ต้องคุมขนาดสถานะและมีแผนปิดเมื่อราคาวิ่งเข้าใกล้ strike ที่ขาย (ดูโมดูล 6)
        </p>
      </Callout>

      <Callout type="tip">
        <p>
          Calendar Spread ใช้ option 2 วันหมดอายุ เส้นกราฟใน <Link to="/tools/payoff?s=calendar-spread">Payoff Builder</Link> จะวัด ณ
          วันหมดอายุของขาที่ใกล้กว่า โดยขาที่ไกลกว่ายังมี time value เหลือ กราฟจึงเป็นเส้นโค้งไม่ใช่เส้นตรง
        </p>
      </Callout>
    </>
  );
}

function Volatility() {
  return (
    <>
      <p>
        บางครั้งคุณรู้ว่า<strong>จะมีเหตุการณ์ใหญ่</strong> เช่น ประกาศงบ, ผลทดลองยา, คำตัดสินคดี แต่ไม่รู้ว่าผลจะออกมาดีหรือร้าย
        กลยุทธ์ long volatility ทำกำไรเมื่อราคาวิ่งแรงไม่ว่าทางไหน
      </p>

      <StrategyCard id="long-straddle" />
      <StrategyCard id="long-strangle" />

      <h2>Expected Move: ตลาดคาดว่าจะวิ่งแค่ไหน</h2>
      <p>
        ราคา ATM Straddle ≈ ระยะที่ตลาดคาดว่าหุ้นจะวิ่ง (expected move) ถ้า Straddle ราคา $8 บนหุ้น $100 ตลาดคาดว่าหุ้นจะวิ่งราว ±8%
        คุณจะกำไรก็ต่อเมื่อหุ้นวิ่ง<strong>มากกว่า</strong>ที่ตลาดคาดไว้แล้ว
      </p>

      <Callout type="warn" title="กับดัก IV Crush">
        <p>
          ก่อนประกาศงบ IV สูงมาก Straddle จึงแพง หลังประกาศ IV ร่วงทันที แม้หุ้นจะวิ่ง 5% Straddle อาจยังขาดทุน ลองใน{' '}
          <Link to="/tools/payoff?s=long-straddle">Payoff Builder</Link> โดยตั้ง IV สูง (เช่น 80%) แล้วเลื่อน "IV เปลี่ยนไป" เป็น −30%
          จะเห็นว่าเส้นประจมลงทั้งเส้น
        </p>
      </Callout>
    </>
  );
}

function OwnStock() {
  return (
    <>
      <p>ถ้าถือหุ้นอยู่แล้ว options ช่วยได้ 2 เรื่อง: <strong>สร้างรายได้เพิ่ม</strong> และ <strong>ซื้อประกันขาลง</strong></p>

      <StrategyCard id="covered-call" />
      <StrategyCard id="protective-put" />
      <StrategyCard id="collar" />

      <h2>The Wheel Strategy</h2>
      <p>กลยุทธ์ยอดนิยมสำหรับนักลงทุนที่อยากได้กระแสเงินสดจากหุ้นที่ชอบ:</p>
      <ol>
        <li>ขาย <strong>Cash-Secured Put</strong> ที่ราคาที่อยากซื้อ → ได้ premium</li>
        <li>ถ้าถูก assign → ได้หุ้น 100 หุ้นในราคาที่ต้องการ (หัก premium ที่ได้แล้ว ต้นทุนจริงต่ำลงอีก)</li>
        <li>ขาย <strong>Covered Call</strong> บนหุ้นที่ได้มา → ได้ premium อีกรอบ</li>
        <li>ถ้าหุ้นถูก call ไป → กลับไปเริ่มข้อ 1 ใหม่</li>
      </ol>
      <Callout type="warn">
        <p>
          The Wheel ไม่ได้ป้องกันขาลง ถ้าหุ้นร่วง 50% คุณก็ขาดทุนเกือบเท่าคนถือหุ้นธรรมดา ใช้เฉพาะกับหุ้นที่ยินดีถือระยะยาวจริงๆ
        </p>
      </Callout>
    </>
  );
}

function Workshop() {
  return (
    <>
      <p>
        บทนี้รวมทุกอย่างที่เรียนมา ใช้ <strong>Strategy Finder</strong> หากลยุทธ์ที่ตรงกับมุมมองของคุณ แล้วไปปรับแต่งใน{' '}
        <strong>Payoff Builder</strong> ซึ่งสร้างสถานะได้หลาย leg
      </p>

      <h2>ขั้นตอนการวางแผนเทรด Options</h2>
      <ol>
        <li>
          <strong>มุมมองทิศทาง:</strong> ขึ้น / ลง / ออกข้าง / วิ่งแรง?
        </li>
        <li>
          <strong>มุมมอง volatility:</strong> IV ตอนนี้แพงหรือถูกเทียบกับอดีต? (IV สูง → เน้นขาย, IV ต่ำ → เน้นซื้อ)
        </li>
        <li>
          <strong>กรอบเวลา:</strong> คาดว่าจะเกิดภายในกี่วัน? เลือกวันหมดอายุให้ยาวกว่านั้น
        </li>
        <li>
          <strong>ความเสี่ยง:</strong> ขาดทุนสูงสุดเท่าไร? คิดเป็นกี่ % ของพอร์ต? (โมดูล 6)
        </li>
        <li>
          <strong>แผนออก:</strong> จะทำกำไรที่เท่าไร? จะตัดขาดทุนเมื่อไร? จะทำอย่างไรถ้าใกล้หมดอายุ?
        </li>
      </ol>

      <Playground title="Strategy Finder" hint="ตอบ 3 คำถาม ระบบจะแนะนำกลยุทธ์ที่เหมาะ">
        <StrategyFinder />
      </Playground>

      <Playground title="Payoff Builder" hint="เลือกกลยุทธ์สำเร็จรูป หรือเพิ่ม/แก้ไข leg เอง ลองเลื่อนเวลาและ IV เพื่อดู P/L ก่อนหมดอายุ">
        <PayoffBuilder />
      </Playground>

      <Callout type="tip" title="แบบฝึกหัด">
        <p>
          1) สร้าง Iron Condor แล้วลองขยับปีกให้กว้างขึ้น ดูว่าโอกาสกำไรและขาดทุนสูงสุดเปลี่ยนอย่างไร
          <br />
          2) เทียบ Long Call กับ Bull Call Spread: เลื่อนเวลาผ่านไป 20 วัน ตัวไหนเสียมูลค่ามากกว่าเมื่อหุ้นไม่ขยับ?
          <br />
          3) สร้าง Covered Call แล้วเพิ่ม Long Put ให้กลายเป็น Collar เปรียบเทียบขาดทุนสูงสุด
        </p>
      </Callout>
    </>
  );
}

export const OPTIONS_STRATEGY_LESSONS: Lesson[] = [
  {
    id: 'bullish-strategies',
    title: 'กลยุทธ์ขาขึ้น (Bullish)',
    summary: 'Long Call, Bull Call Spread, Bull Put Spread, Cash-Secured Put',
    minutes: 10,
    Body: Bullish,
    quiz: [
      {
        q: 'Bull Call Spread ต่างจาก Long Call อย่างไร?',
        choices: ['ต้นทุนสูงกว่า', 'ต้นทุนต่ำกว่า แต่กำไรสูงสุดจำกัด', 'ขาดทุนไม่จำกัด', 'ไม่มีวันหมดอายุ'],
        answer: 1,
        explain: 'การขาย Call strike สูงช่วยลดต้นทุน แลกกับการจำกัดกำไรเมื่อหุ้นวิ่งเกิน strike ที่ขาย',
      },
      {
        q: 'Bull Put Spread 95/90 ได้ credit $1.50 ขาดทุนสูงสุดต่อสัญญาเท่าไร?',
        choices: ['$150', '$350', '$500', 'ไม่จำกัด'],
        answer: 1,
        explain: '(ส่วนต่าง strike $5 − credit $1.50) × 100 = $350',
      },
      {
        q: 'Cash-Secured Put เหมาะกับใคร?',
        choices: ['คนที่อยากได้หุ้นตัวนั้นในราคาที่ต่ำกว่าตลาด', 'คนที่คิดว่าหุ้นจะร่วงหนัก', 'คนที่ไม่มีเงินสด', 'คนที่อยากได้ leverage สูง'],
        answer: 0,
        explain: 'ถ้าหุ้นลงมาต่ำกว่า strike คุณจะได้ซื้อหุ้นที่ strike (หัก premium) ถ้าไม่ลงก็เก็บ premium ไป',
      },
    ],
  },
  {
    id: 'bearish-strategies',
    title: 'กลยุทธ์ขาลง (Bearish)',
    summary: 'Long Put, Bear Put Spread, Bear Call Spread',
    minutes: 7,
    Body: Bearish,
    quiz: [
      {
        q: 'ข้อดีของการซื้อ Put เทียบกับการ Short หุ้นคืออะไร?',
        choices: ['ไม่มีวันหมดอายุ', 'ขาดทุนสูงสุดจำกัดเท่า premium', 'ไม่มีต้นทุน', 'กำไรไม่จำกัด'],
        answer: 1,
        explain: 'Long Put ขาดทุนสูงสุดคือ premium ที่จ่าย ส่วน Short หุ้นขาดทุนได้ไม่จำกัด',
      },
      {
        q: 'Bear Call Spread ทำกำไรเมื่อใด?',
        choices: ['หุ้นพุ่งขึ้นแรง', 'หุ้นไม่ขึ้นเกิน strike ของ Call ที่ขาย', 'IV เพิ่มขึ้นมาก', 'เฉพาะเมื่อหุ้นลง 20%'],
        answer: 1,
        explain: 'เป็นกลยุทธ์ credit ได้กำไรเต็มเมื่อหุ้นอยู่ต่ำกว่า strike ที่ขาย ณ วันหมดอายุ',
      },
    ],
  },
  {
    id: 'neutral-strategies',
    title: 'กลยุทธ์ตลาดออกข้าง (Neutral)',
    summary: 'Iron Condor, Butterfly, Calendar, Short Strangle',
    minutes: 10,
    Body: Neutral,
    quiz: [
      {
        q: 'Iron Condor ประกอบด้วยอะไร?',
        choices: ['Long Call + Long Put', 'Bull Put Spread + Bear Call Spread', 'หุ้น + Short Call', 'Long Straddle 2 ชุด'],
        answer: 1,
        explain: 'Iron Condor = ขาย Put Spread ด้านล่าง + ขาย Call Spread ด้านบน ได้กำไรเมื่อราคาอยู่ในกรอบ',
      },
      {
        q: 'Short Strangle ต่างจาก Iron Condor อย่างไร?',
        choices: ['ไม่ต่างกัน', 'Short Strangle ไม่ได้ซื้อปีกป้องกัน จึงเสี่ยงไม่จำกัด', 'Short Strangle เป็นกลยุทธ์ debit', 'Iron Condor เสี่ยงไม่จำกัด'],
        answer: 1,
        explain: 'Iron Condor ซื้อ option ที่ไกลกว่าเป็นปีกป้องกัน จึงจำกัดความเสี่ยงได้',
      },
      {
        q: 'กลยุทธ์ Neutral แบบ credit ได้ประโยชน์จากอะไร?',
        choices: ['IV เพิ่ม', 'หุ้นวิ่งแรง', 'เวลาผ่านไป (Theta) และ IV ลดลง', 'ดอกเบี้ยลดลง'],
        answer: 2,
        explain: 'ผู้ขาย option ได้กำไรจาก time decay และจากการที่ IV ลดลง (short vega)',
      },
    ],
  },
  {
    id: 'volatility-strategies',
    title: 'กลยุทธ์ความผันผวน (Long Volatility)',
    summary: 'Straddle, Strangle, Expected Move และ IV Crush',
    minutes: 7,
    Body: Volatility,
    quiz: [
      {
        q: 'Long Straddle ได้กำไรเมื่อใด?',
        choices: ['ราคานิ่ง', 'ราคาวิ่งแรงเกินต้นทุน straddle ไม่ว่าทางไหน', 'เฉพาะเมื่อราคาขึ้น', 'IV ลดลง'],
        answer: 1,
        explain: 'ต้องวิ่งเกิน strike ± ต้นทุนรวมของทั้งสองขาถึงจะกำไร ณ วันหมดอายุ',
      },
      {
        q: 'ATM Straddle ราคา $6 บนหุ้น $120 ตลาดคาดว่าหุ้นจะวิ่งประมาณเท่าไร?',
        choices: ['±$1.20', '±$6 (≈5%)', '±$12', '±$60'],
        answer: 1,
        explain: 'ราคา ATM straddle ≈ expected move: ±$6 หรือประมาณ 5% ของราคาหุ้น',
      },
    ],
  },
  {
    id: 'stock-strategies',
    title: 'กลยุทธ์สำหรับคนถือหุ้น',
    summary: 'Covered Call, Protective Put, Collar, The Wheel',
    minutes: 8,
    Body: OwnStock,
    quiz: [
      {
        q: 'Covered Call มีข้อเสียหลักอะไร?',
        choices: ['ขาดทุนไม่จำกัด', 'จำกัดกำไรเมื่อหุ้นวิ่งเกิน strike', 'ต้องจ่าย premium', 'ใช้ได้เฉพาะหุ้นไม่มีปันผล'],
        answer: 1,
        explain: 'ถ้าหุ้นวิ่งเกิน strike หุ้นจะถูก call ไป คุณพลาดกำไรส่วนที่เกิน strike',
      },
      {
        q: 'Protective Put เปรียบได้กับอะไร?',
        choices: ['การกู้เงิน', 'การซื้อประกันภัยให้หุ้น', 'การขายหุ้นทิ้ง', 'การเพิ่ม leverage'],
        answer: 1,
        explain: 'จ่าย premium เพื่อจำกัดขาดทุนเมื่อหุ้นลงต่ำกว่า strike ของ Put เหมือนจ่ายเบี้ยประกัน',
      },
      {
        q: 'Collar มีจุดเด่นอะไร?',
        choices: ['กำไรไม่จำกัด', 'ป้องกันขาลงโดยใช้ premium จากการขาย Call จ่ายค่า Put', 'ไม่ต้องถือหุ้น', 'เหมาะกับการเก็งขาลงแรง'],
        answer: 1,
        explain: 'Premium จาก Short Call ช่วยจ่ายค่า Long Put ทำให้ป้องกันขาลงได้โดยมีต้นทุนต่ำหรือเป็นศูนย์',
      },
    ],
  },
  {
    id: 'strategy-workshop',
    title: 'Workshop: เลือกและสร้างกลยุทธ์ของคุณ',
    summary: 'Strategy Finder + Payoff Builder แบบหลาย leg',
    minutes: 15,
    Body: Workshop,
    quiz: [
      {
        q: 'IV ของหุ้นตอนนี้สูงกว่าปกติมาก และคุณคิดว่าหุ้นจะแกว่งในกรอบ กลยุทธ์ใดเหมาะที่สุด?',
        choices: ['Long Straddle', 'Long Call', 'Iron Condor', 'Long Put'],
        answer: 2,
        explain: 'IV สูง → เน้นขาย premium, ตลาดออกข้าง → Iron Condor ซึ่งยังจำกัดความเสี่ยงได้',
      },
      {
        q: 'ขั้นตอนใดที่ควรทำก่อนเปิดสถานะทุกครั้ง?',
        choices: ['ดูแค่ว่าราคาถูกหรือแพง', 'กำหนดขาดทุนสูงสุดและแผนออกล่วงหน้า', 'รอให้เพื่อนแนะนำ', 'ใช้ leverage สูงสุด'],
        answer: 1,
        explain: 'ต้องรู้ว่าจะเสียได้มากที่สุดเท่าไร และจะออกเมื่อไรทั้งกรณีกำไรและขาดทุน',
      },
    ],
  },
];
