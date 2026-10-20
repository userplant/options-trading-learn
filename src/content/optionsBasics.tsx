import { Term } from '../components/Term';
import { GreeksVisualizer } from '../components/tools/GreeksVisualizer';
import { MoneynessExplorer, PricingFactors, SingleOptionPlayground, TimeDecayChart } from '../components/tools/OptionPlaygrounds';
import { Callout, Formula, Playground } from '../components/ui';
import type { Lesson } from './types';

function WhatIsOption() {
  return (
    <>
      <p>
        <Term id="option" /> คือสัญญาที่ให้ "สิทธิ" แต่ไม่ใช่ "ภาระ" ในการซื้อหรือขายสินทรัพย์ที่ราคาที่ตกลงไว้ (
        <Term id="strike" />) ภายในวันที่กำหนด (<Term id="expiration" />) ผู้ซื้อจ่ายค่าสิทธิเรียกว่า <Term id="premium" />{' '}
        ให้ผู้ขาย
      </p>

      <Callout type="example" title="เปรียบเทียบกับชีวิตจริง">
        <p>
          คุณจ่ายมัดจำ 50,000 บาทเพื่อจองซื้อคอนโดราคา 3 ล้านบาท ภายใน 3 เดือน ถ้าราคาคอนโดขึ้นเป็น 3.5 ล้าน คุณใช้สิทธิซื้อที่ 3 ล้าน
          และได้กำไร ถ้าราคาตกเหลือ 2.5 ล้าน คุณไม่ต้องซื้อ เสียแค่ค่ามัดจำ นี่คือหลักการของ <strong>Call Option</strong>
        </p>
      </Callout>

      <h2>สองประเภทหลัก</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th><Term id="call" /></th>
            <th><Term id="put" /></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ผู้ซื้อ (Long)</strong></td>
            <td>มีสิทธิ<strong>ซื้อ</strong>หุ้นที่ strike → อยากให้ราคา<strong>ขึ้น</strong></td>
            <td>มีสิทธิ<strong>ขาย</strong>หุ้นที่ strike → อยากให้ราคา<strong>ลง</strong></td>
          </tr>
          <tr>
            <td><strong>ผู้ขาย (Short)</strong></td>
            <td>มีภาระต้องขายหุ้นที่ strike ถ้าถูกใช้สิทธิ</td>
            <td>มีภาระต้องซื้อหุ้นที่ strike ถ้าถูกใช้สิทธิ</td>
          </tr>
        </tbody>
      </table>

      <h2>ข้อควรรู้เฉพาะตลาดสหรัฐ</h2>
      <ul>
        <li>
          <Term id="contract-size" />: 1 สัญญา = 100 หุ้น premium ที่เห็น $2.50 คือราคาต่อหุ้น → จ่ายจริง $250 ต่อสัญญา
        </li>
        <li>
          Options หุ้นสหรัฐเป็นแบบ <Term id="american-style" /> ส่วน options ดัชนี เช่น SPX เป็นแบบ European และชำระเป็นเงินสด
        </li>
        <li>มีวันหมดอายุให้เลือกทั้งรายเดือน รายสัปดาห์ และสำหรับ SPY/SPX/QQQ มีหมดอายุทุกวัน (0DTE)</li>
        <li>
          ผู้ขาย option อาจถูก <Term id="assignment" /> เมื่อไรก็ได้ก่อนหมดอายุ โดยเฉพาะเมื่อ option อยู่ ITM ลึก
        </li>
      </ul>

      <Playground title="Payoff ของ option ขาเดียว" hint="ลองสลับ ซื้อ/ขาย และ Call/Put ดูรูปร่างกราฟ 4 แบบ ราคาหุ้นปัจจุบัน $100 อายุ 30 วัน">
        <SingleOptionPlayground />
      </Playground>

      <Callout type="tip" title="จำรูปกราฟ 4 แบบนี้ให้ได้">
        <p>
          ทุกกลยุทธ์ที่ซับซ้อนเกิดจากการนำ 4 รูปนี้ (Long Call, Short Call, Long Put, Short Put) และหุ้นมาประกอบกัน
          ผู้ซื้อ option ขาดทุนจำกัดแต่โอกาสชนะน้อยกว่า ผู้ขายรับเงินก่อนและโอกาสชนะสูงกว่าแต่ความเสี่ยงสูงกว่า
        </p>
      </Callout>
    </>
  );
}

function Moneyness() {
  return (
    <>
      <p>สถานะของ option เทียบกับราคาหุ้นปัจจุบัน แบ่งเป็น 3 แบบ:</p>
      <table>
        <thead>
          <tr>
            <th>สถานะ</th>
            <th>Call</th>
            <th>Put</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Term id="itm" /></td>
            <td>ราคาหุ้น &gt; Strike</td>
            <td>ราคาหุ้น &lt; Strike</td>
          </tr>
          <tr>
            <td><Term id="atm" /></td>
            <td colSpan={2}>ราคาหุ้น ≈ Strike</td>
          </tr>
          <tr>
            <td><Term id="otm" /></td>
            <td>ราคาหุ้น &lt; Strike</td>
            <td>ราคาหุ้น &gt; Strike</td>
          </tr>
        </tbody>
      </table>

      <h2>Premium = Intrinsic Value + Time Value</h2>
      <Formula>
        Premium = Intrinsic Value + Extrinsic (Time) Value
        <br />
        Call Intrinsic = max(S − K, 0) &nbsp;&nbsp; Put Intrinsic = max(K − S, 0)
      </Formula>
      <ul>
        <li>
          <Term id="intrinsic" />: มูลค่าที่ได้ถ้าใช้สิทธิทันที (มีเฉพาะ option ที่ ITM)
        </li>
        <li>
          <Term id="extrinsic" />: ส่วนที่เหลือ เป็นค่า "ความหวัง" ว่าราคาจะเปลี่ยน ขึ้นกับเวลาที่เหลือและความผันผวน{' '}
          <strong>สูงสุดที่ ATM</strong> และลดลงเป็น 0 ณ วันหมดอายุ
        </li>
      </ul>

      <Callout type="example">
        <p>
          หุ้นราคา $105, Call strike $100 ราคา $7.20 → Intrinsic = $5, Time Value = $2.20 ถ้าถึงวันหมดอายุราคาหุ้นยังเป็น $105
          option จะเหลือมูลค่า $5 (หายไป $2.20)
        </p>
      </Callout>

      <Playground title="ITM / ATM / OTM Explorer" hint="ขยับราคาหุ้นผ่าน strike $100 และลดวันหมดอายุเหลือ 0 ดูว่า time value หายไปอย่างไร">
        <MoneynessExplorer />
      </Playground>

      <Callout type="info">
        <p>
          OTM option ราคาถูก แต่ทั้งหมดเป็น time value ที่จะหายไป ถ้าราคาไม่วิ่งมาถึง strike ก็มีค่าเป็น 0 ณ วันหมดอายุ
          มือใหม่มักซื้อ OTM ไกลๆ เพราะถูก แต่โอกาสชนะต่ำมาก
        </p>
      </Callout>
    </>
  );
}

function Pricing() {
  return (
    <>
      <p>ราคา option ถูกกำหนดจาก 5 ปัจจัยหลัก (บวกเงินปันผลสำหรับหุ้นที่จ่ายปันผล):</p>
      <table>
        <thead>
          <tr>
            <th>ปัจจัย</th>
            <th>ถ้าเพิ่มขึ้น → Call</th>
            <th>ถ้าเพิ่มขึ้น → Put</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ราคาหุ้น (S)</td>
            <td>⬆️ แพงขึ้น</td>
            <td>⬇️ ถูกลง</td>
          </tr>
          <tr>
            <td>Strike (K)</td>
            <td>⬇️ ถูกลง</td>
            <td>⬆️ แพงขึ้น</td>
          </tr>
          <tr>
            <td>เวลาถึงหมดอายุ (T)</td>
            <td>⬆️ แพงขึ้น</td>
            <td>⬆️ แพงขึ้น</td>
          </tr>
          <tr>
            <td>Volatility (σ)</td>
            <td>⬆️ แพงขึ้น</td>
            <td>⬆️ แพงขึ้น</td>
          </tr>
          <tr>
            <td>อัตราดอกเบี้ย (r)</td>
            <td>⬆️ แพงขึ้นเล็กน้อย</td>
            <td>⬇️ ถูกลงเล็กน้อย</td>
          </tr>
        </tbody>
      </table>

      <h2>แบบจำลอง <Term id="black-scholes" /></h2>
      <Formula>
        C = S·N(d₁) − K·e^(−rT)·N(d₂)
        <br />
        P = K·e^(−rT)·N(−d₂) − S·N(−d₁)
        <br />
        d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ√T) &nbsp;&nbsp; d₂ = d₁ − σ√T
      </Formula>
      <p>
        ไม่ต้องจำสูตร แค่เข้าใจว่าทุกตัวแปรรู้ค่าแน่นอน <strong>ยกเว้น σ (volatility)</strong> ซึ่งเป็นการคาดการณ์อนาคต
      </p>

      <h2><Term id="iv" /></h2>
      <p>
        ในทางปฏิบัติ เราเห็นราคา option ในตลาดอยู่แล้ว จึงคำนวณย้อนกลับได้ว่าตลาดคาดการณ์ volatility เท่าไร ค่านี้เรียกว่า{' '}
        <strong>Implied Volatility</strong> IV สูง = option แพง = ตลาดคาดว่าราคาจะวิ่งแรง
      </p>
      <ul>
        <li>IV มักพุ่งขึ้นก่อนประกาศงบการเงิน หรือเมื่อตลาดตื่นตระหนก (ดูได้จากดัชนี VIX สำหรับ S&P 500)</li>
        <li>
          หลังเหตุการณ์ผ่านไป IV มักลดลงทันที เรียกว่า <Term id="iv-crush" /> ทำให้ผู้ซื้อ option ขาดทุนได้แม้จะทายทิศถูก
        </li>
        <li>ดู IV Rank/IV Percentile เพื่อเทียบว่า IV ตอนนี้สูงหรือต่ำเมื่อเทียบกับอดีตของหุ้นตัวนั้น</li>
      </ul>

      <Playground title="ปัจจัยที่กำหนดราคา Option" hint="ลองเพิ่ม IV เป็น 2 เท่า ดูว่าราคาทั้ง Call และ Put เพิ่มขึ้นแค่ไหน">
        <PricingFactors />
      </Playground>

      <Callout type="info" title="Put-Call Parity">
        <p>
          Call − Put = S − K·e^(−rT) (สำหรับ European option ที่ strike และวันหมดอายุเดียวกัน) ทำให้ราคา Call และ Put ผูกกันอยู่
          เสมอ ลองตั้ง S = K ในเครื่องมือด้านบน จะเห็นว่า Call แพงกว่า Put เล็กน้อยเพราะดอกเบี้ย
        </p>
      </Callout>
    </>
  );
}

function GreeksLesson() {
  return (
    <>
      <p>
        Greeks คือ "ค่าความไว" ที่บอกว่าราคา option จะเปลี่ยนเท่าไรเมื่อปัจจัยแต่ละตัวเปลี่ยน ใช้วัดและจัดการความเสี่ยงของสถานะ
      </p>

      <table>
        <thead>
          <tr>
            <th>Greek</th>
            <th>วัดอะไร</th>
            <th>ค่าโดยทั่วไป (Long)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Term id="delta" /></td>
            <td>ราคา option เปลี่ยนเท่าไรเมื่อหุ้นขึ้น $1</td>
            <td>Call: 0 ถึง 1 / Put: −1 ถึง 0 (ATM ≈ ±0.5)</td>
          </tr>
          <tr>
            <td><Term id="gamma" /></td>
            <td>Delta เปลี่ยนเท่าไรเมื่อหุ้นขึ้น $1</td>
            <td>เป็นบวกเสมอสำหรับผู้ซื้อ สูงสุดที่ ATM ใกล้หมดอายุ</td>
          </tr>
          <tr>
            <td><Term id="theta" /></td>
            <td>มูลค่าที่หายไปต่อวัน</td>
            <td>เป็นลบสำหรับผู้ซื้อ (เสียเงินทุกวัน)</td>
          </tr>
          <tr>
            <td><Term id="vega" /></td>
            <td>ราคาเปลี่ยนเท่าไรเมื่อ IV เปลี่ยน 1%</td>
            <td>เป็นบวกสำหรับผู้ซื้อ สูงสุดที่ ATM อายุยาว</td>
          </tr>
          <tr>
            <td><Term id="rho" /></td>
            <td>ราคาเปลี่ยนเท่าไรเมื่อดอกเบี้ยเปลี่ยน 1%</td>
            <td>มีผลน้อย ยกเว้น option อายุยาว (LEAPS)</td>
          </tr>
        </tbody>
      </table>

      <Callout type="example">
        <p>
          Call ราคา $3.00 มี Delta 0.50, Theta −0.05, Vega 0.12 → ถ้าหุ้นขึ้น $1 option จะเป็นประมาณ $3.50, ถ้าผ่านไป 1 วัน
          ราคาอื่นไม่เปลี่ยน option จะเหลือ $2.95, ถ้า IV เพิ่ม 2% option จะเป็นประมาณ $3.24
        </p>
      </Callout>

      <h2>วิธีใช้ Delta ในทางปฏิบัติ</h2>
      <ul>
        <li>
          <strong>เทียบเท่าหุ้น:</strong> Long 1 Call delta 0.40 ≈ ถือหุ้น 40 หุ้น (0.40 × 100)
        </li>
        <li>
          <strong>ความน่าจะเป็นคร่าวๆ:</strong> Delta 0.30 ≈ มีโอกาสประมาณ 30% ที่จะจบแบบ ITM
        </li>
        <li>
          <strong>Delta Neutral:</strong> สถานะที่ delta รวม ≈ 0 ไม่สนทิศทาง แต่หวังกำไรจาก theta หรือ vega
        </li>
      </ul>

      <Playground title="Greeks Visualizer" hint="กดการ์ด Greek เพื่อเปลี่ยนกราฟ สังเกตว่า Gamma พุ่งสูงที่ ATM เมื่อเหลือ 7 วัน">
        <GreeksVisualizer />
      </Playground>

      <Callout type="warn" title="Gamma Risk">
        <p>
          ใกล้วันหมดอายุ Gamma ของ option ATM สูงมาก Delta จึงเปลี่ยนจาก 0 เป็น 1 ได้ในพริบตา ผู้ขาย option ที่ถือใกล้หมดอายุจึงเสี่ยงที่สุด
          ต่อการถูกราคาวิ่งสวนทาง
        </p>
      </Callout>
    </>
  );
}

function TimeDecayLesson() {
  return (
    <>
      <p>
        Time value ของ option ไม่ได้ลดลงแบบเส้นตรง แต่<strong>เร่งตัวขึ้นเมื่อใกล้วันหมดอายุ</strong> (ลดลงตามประมาณ √T)
        นี่คือเหตุผลที่ <Term id="theta" /> เป็นทั้งศัตรูของผู้ซื้อและเพื่อนของผู้ขาย
      </p>

      <Playground title="Time Decay ของ Option" hint="สังเกตว่าช่วง 30 วันสุดท้าย โดยเฉพาะ 10 วันสุดท้าย ATM option เสียมูลค่าเร็วมาก">
        <TimeDecayChart />
      </Playground>

      <h2>บทเรียนจากกราฟ</h2>
      <ul>
        <li>
          <strong>ATM</strong> มี time value สูงสุด และเสียมูลค่าเร็วที่สุดในช่วงท้าย
        </li>
        <li>
          <strong>OTM</strong> ราคาถูก แต่ถ้าราคาไม่วิ่งมา จะค่อยๆ ลดลงจนเหลือ 0
        </li>
        <li>
          <strong>ITM ลึก</strong> มี time value น้อย ราคาเคลื่อนไหวคล้ายหุ้นมากกว่า
        </li>
      </ul>

      <Callout type="tip" title="แนวทางที่เทรดเดอร์นิยม">
        <p>
          <strong>ผู้ซื้อ</strong> มักเลือกอายุ 45–90 วันขึ้นไปให้มีเวลาพอและหลบช่วง decay เร่งตัว และมักขายทิ้งก่อนเหลือ 21 วัน
          <br />
          <strong>ผู้ขาย</strong> มักขายที่อายุราว 30–45 วัน เพื่อเก็บ theta ช่วงที่เร่งตัว และปิดก่อนหมดอายุเพื่อลด gamma risk
        </p>
      </Callout>

      <Callout type="info">
        <p>
          Theta ในเครื่องมือคิดเป็น calendar day แต่ตลาดปิดวันเสาร์-อาทิตย์ ในทางปฏิบัติ market maker จะทยอยปรับราคา option
          ล่วงหน้าก่อนวันหยุด
        </p>
      </Callout>
    </>
  );
}

export const OPTIONS_BASICS_LESSONS: Lesson[] = [
  {
    id: 'what-is-option',
    title: 'Option คืออะไร: Call และ Put',
    summary: 'สิทธิ vs ภาระ, payoff 4 แบบพื้นฐาน',
    minutes: 10,
    Body: WhatIsOption,
    quiz: [
      {
        q: 'ผู้ซื้อ Put Option ได้กำไรเมื่อใด?',
        choices: ['ราคาหุ้นขึ้น', 'ราคาหุ้นลงต่ำกว่า strike − premium', 'ราคาหุ้นไม่เปลี่ยน', 'IV ลดลง'],
        answer: 1,
        explain: 'Put ให้สิทธิขายที่ strike ยิ่งหุ้นลงต่ำ ยิ่งมีมูลค่า กำไรเมื่อต่ำกว่า strike − premium ที่จ่ายไป',
      },
      {
        q: 'Call option ราคา $3.20 ซื้อ 2 สัญญา จ่ายจริงเท่าไร?',
        choices: ['$3.20', '$6.40', '$320', '$640'],
        answer: 3,
        explain: '$3.20 × 100 หุ้น × 2 สัญญา = $640',
      },
      {
        q: 'สถานะใดมีความเสี่ยงขาดทุนไม่จำกัด?',
        choices: ['Long Call', 'Long Put', 'Short Call (ไม่มีหุ้นคุ้ม)', 'Short Put'],
        answer: 2,
        explain: 'ผู้ขาย Call ต้องขายหุ้นที่ strike ถ้าหุ้นพุ่งไม่หยุด ขาดทุนก็ไม่จำกัด (Short Put ขาดทุนมากแต่จำกัดที่ราคาหุ้นเป็น 0)',
      },
      {
        q: 'Options หุ้นสหรัฐ (เช่น AAPL) เป็นแบบใด?',
        choices: ['European: ใช้สิทธิได้เฉพาะวันหมดอายุ', 'American: ใช้สิทธิได้ทุกวันก่อนหมดอายุ', 'ใช้สิทธิไม่ได้', 'ขึ้นกับโบรกเกอร์'],
        answer: 1,
        explain: 'Options หุ้นรายตัวในสหรัฐเป็น American style ผู้ขายจึงอาจถูก assign ได้ก่อนวันหมดอายุ',
      },
    ],
  },
  {
    id: 'moneyness-premium',
    title: 'ITM / ATM / OTM และองค์ประกอบของ Premium',
    summary: 'Intrinsic value vs Time value',
    minutes: 7,
    Body: Moneyness,
    quiz: [
      {
        q: 'หุ้นราคา $50, Put strike $55 อยู่ในสถานะใด?',
        choices: ['ITM', 'ATM', 'OTM', 'บอกไม่ได้'],
        answer: 0,
        explain: 'Put จะ ITM เมื่อราคาหุ้นต่ำกว่า strike ($50 < $55) มี intrinsic value $5',
      },
      {
        q: 'หุ้นราคา $105, Call strike $100 ราคา $8 มี Time Value เท่าไร?',
        choices: ['$8', '$5', '$3', '$0'],
        answer: 2,
        explain: 'Intrinsic = $105 − $100 = $5, Time Value = $8 − $5 = $3',
      },
      {
        q: 'ณ วันหมดอายุ Time Value ของ option เป็นเท่าไร?',
        choices: ['เท่าเดิม', 'เพิ่มขึ้น', '0', 'เท่ากับ strike'],
        answer: 2,
        explain: 'ณ วันหมดอายุไม่มีเวลาเหลือแล้ว option จึงมีค่าเท่ากับ intrinsic value เท่านั้น',
      },
    ],
  },
  {
    id: 'pricing-iv',
    title: 'ราคา Option: Black-Scholes และ Implied Volatility',
    summary: '5 ปัจจัยที่กำหนดราคา และทำไม IV สำคัญที่สุด',
    minutes: 9,
    Body: Pricing,
    quiz: [
      {
        q: 'ถ้า IV เพิ่มขึ้น (ปัจจัยอื่นคงที่) ราคา Call และ Put จะเป็นอย่างไร?',
        choices: ['Call ขึ้น Put ลง', 'ทั้งคู่แพงขึ้น', 'ทั้งคู่ถูกลง', 'Call ลง Put ขึ้น'],
        answer: 1,
        explain: 'ความผันผวนที่สูงขึ้นเพิ่มโอกาสที่ option จะมีมูลค่า ทั้ง Call และ Put จึงแพงขึ้น',
      },
      {
        q: 'IV Crush มักเกิดขึ้นเมื่อใด?',
        choices: ['ก่อนประกาศงบ', 'หลังประกาศงบหรือเหตุการณ์สำคัญผ่านไป', 'ทุกวันศุกร์', 'เมื่อดอกเบี้ยขึ้น'],
        answer: 1,
        explain: 'เมื่อความไม่แน่นอนหมดไป IV จะลดลงทันที ราคา option จึงลดลงแม้หุ้นจะขยับ',
      },
      {
        q: 'ตัวแปรใดใน Black-Scholes ที่ "ไม่รู้ค่าแน่นอน" และต้องคาดการณ์?',
        choices: ['ราคาหุ้น', 'Strike', 'Volatility', 'เวลาถึงหมดอายุ'],
        answer: 2,
        explain: 'Volatility ในอนาคตไม่มีใครรู้ ตลาดจึงสะท้อนการคาดการณ์ผ่าน Implied Volatility',
      },
    ],
  },
  {
    id: 'greeks',
    title: 'Greeks: Delta, Gamma, Theta, Vega, Rho',
    summary: 'วัดความไวของราคา option ต่อแต่ละปัจจัย',
    minutes: 12,
    Body: GreeksLesson,
    quiz: [
      {
        q: 'Call มี Delta 0.60 หุ้นขึ้น $2 ราคา option จะเปลี่ยนประมาณเท่าไร?',
        choices: ['+$0.60', '+$1.20', '+$2.00', '−$1.20'],
        answer: 1,
        explain: 'Delta 0.60 × $2 = +$1.20 ต่อหุ้น (= $120 ต่อสัญญา)',
      },
      {
        q: 'Greek ใดที่ทำให้ผู้ซื้อ option เสียเงินทุกวัน?',
        choices: ['Delta', 'Gamma', 'Theta', 'Vega'],
        answer: 2,
        explain: 'Theta เป็นลบสำหรับผู้ซื้อ มูลค่าเวลาหายไปทุกวัน',
      },
      {
        q: 'Long 2 Put แต่ละตัว Delta −0.30 เทียบเท่ากับสถานะหุ้นแบบใด?',
        choices: ['Long 60 หุ้น', 'Short 60 หุ้น', 'Short 30 หุ้น', 'Long 30 หุ้น'],
        answer: 1,
        explain: '−0.30 × 100 × 2 = −60 → เทียบเท่า Short 60 หุ้น',
      },
      {
        q: 'Gamma สูงที่สุดเมื่อใด?',
        choices: ['ITM ลึก อายุยาว', 'OTM ไกล อายุยาว', 'ATM ใกล้หมดอายุ', 'ไม่ขึ้นกับอะไร'],
        answer: 2,
        explain: 'Option ATM ใกล้หมดอายุมี Delta ที่เปลี่ยนเร็วมาก จึงมี Gamma สูงที่สุด',
      },
    ],
  },
  {
    id: 'time-decay',
    title: 'Time Decay: เวลาคือเงิน',
    summary: 'Theta เร่งตัวใกล้วันหมดอายุ และผลต่อการเลือกอายุสัญญา',
    minutes: 6,
    Body: TimeDecayLesson,
    quiz: [
      {
        q: 'Time decay ของ option ATM เป็นอย่างไรเมื่อเข้าใกล้วันหมดอายุ?',
        choices: ['ช้าลง', 'คงที่ทุกวัน', 'เร่งตัวเร็วขึ้น', 'หยุดลง'],
        answer: 2,
        explain: 'Time value ลดลงตามประมาณ √T จึงหายเร็วมากในช่วงท้าย',
      },
      {
        q: 'ผู้ขาย option ได้ประโยชน์จาก Theta อย่างไร?',
        choices: ['ไม่ได้ประโยชน์', 'มูลค่า option ที่ขายไว้ลดลงทุกวัน ซื้อคืนได้ถูกลง', 'ได้ดอกเบี้ย', 'ได้ปันผล'],
        answer: 1,
        explain: 'ผู้ขายรับ premium มาก่อน เมื่อเวลาผ่านไป option ถูกลง จึงซื้อคืนได้ในราคาต่ำกว่าที่ขาย',
      },
      {
        q: 'Option ใดมี time value สูงที่สุด (strike ต่างกัน อายุเท่ากัน)?',
        choices: ['ITM ลึก', 'ATM', 'OTM ไกล', 'เท่ากันหมด'],
        answer: 1,
        explain: 'ATM มีความไม่แน่นอนสูงสุดว่าจะจบ ITM หรือ OTM จึงมี time value สูงสุด',
      },
    ],
  },
];
