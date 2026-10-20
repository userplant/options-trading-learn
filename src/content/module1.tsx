import { Term } from '../components/Term';
import { LeverageCalc, OrderBookSim, SpreadCostCalc } from '../components/tools/MarketTools';
import { Callout, Playground } from '../components/ui';
import type { Lesson } from './types';

function AssetClasses() {
  return (
    <>
      <p>
        ก่อนจะเทรดอะไร ต้องรู้ก่อนว่า "สินทรัพย์" แต่ละประเภททำงานต่างกันอย่างไร แต่ละแบบมีชั่วโมงซื้อขาย ความผันผวน
        การใช้ <Term id="leverage" /> และความเสี่ยงไม่เหมือนกัน
      </p>

      <table>
        <thead>
          <tr>
            <th>ประเภท</th>
            <th>คืออะไร</th>
            <th>ตัวอย่าง (สหรัฐ)</th>
            <th>จุดเด่น / ข้อควรระวัง</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>หุ้น (Stocks)</strong></td>
            <td>ความเป็นเจ้าของส่วนหนึ่งของบริษัท</td>
            <td>AAPL, MSFT, NVDA</td>
            <td>เข้าใจง่าย ไม่มีวันหมดอายุ / ความเสี่ยงเฉพาะตัวบริษัท</td>
          </tr>
          <tr>
            <td><strong><Term id="etf">ETF</Term></strong></td>
            <td>กองทุนที่ซื้อขายเหมือนหุ้น</td>
            <td>SPY (S&P 500), QQQ (Nasdaq 100)</td>
            <td>กระจายความเสี่ยงในคำสั่งเดียว / ETF แบบ leveraged ซับซ้อนกว่าที่เห็น</td>
          </tr>
          <tr>
            <td><strong>Options</strong></td>
            <td>สัญญาสิทธิในการซื้อ/ขายสินทรัพย์ที่ราคากำหนด</td>
            <td>AAPL Call, SPY Put</td>
            <td>ยืดหยุ่นมาก ทำกลยุทธ์ได้หลากหลาย / มีวันหมดอายุ ซับซ้อน</td>
          </tr>
          <tr>
            <td><strong>Futures</strong></td>
            <td>สัญญาซื้อขายล่วงหน้า (ภาระผูกพันทั้งสองฝ่าย)</td>
            <td>ES (S&P 500 E-mini), CL (น้ำมันดิบ)</td>
            <td>Leverage สูง เทรดเกือบ 24 ชม. / ขาดทุนเกินเงินที่วางได้</td>
          </tr>
          <tr>
            <td><strong>Forex</strong></td>
            <td>ตลาดแลกเปลี่ยนเงินตรา</td>
            <td>EUR/USD, USD/JPY</td>
            <td>สภาพคล่องสูงที่สุดในโลก / leverage สูงมาก</td>
          </tr>
          <tr>
            <td><strong>Crypto</strong></td>
            <td>สินทรัพย์ดิจิทัล</td>
            <td>BTC, ETH</td>
            <td>เทรด 24/7 / ผันผวนสูงมาก กฎเกณฑ์ยังเปลี่ยนแปลง</td>
          </tr>
        </tbody>
      </table>

      <h2>ตลาดหุ้นสหรัฐ: ข้อมูลที่ควรรู้</h2>
      <ul>
        <li>
          <strong>ตลาดหลัก:</strong> NYSE และ Nasdaq ส่วน Options ซื้อขายผ่านหลายตลาด เช่น Cboe
        </li>
        <li>
          <strong>เวลาทำการปกติ:</strong> 9:30–16:00 น. เวลานิวยอร์ก (ET) ตรงกับ 20:30–03:00 น. เวลาไทยช่วง Daylight
          Saving (มี.ค.–พ.ย.) และ 21:30–04:00 น. ช่วงฤดูหนาว
        </li>
        <li>
          <strong>Pre-market / After-hours:</strong> ซื้อขายได้นอกเวลาแต่สภาพคล่องต่ำ <Term id="spread" /> กว้าง
        </li>
        <li>
          <strong>Settlement:</strong> หุ้นสหรัฐชำระราคาแบบ T+1 (1 วันทำการหลังซื้อขาย)
        </li>
      </ul>

      <Callout type="info" title="ทำไมคอร์สนี้เน้น Options">
        <p>
          Options เป็นเครื่องมือที่ทำได้ทั้ง <em>เก็งกำไร</em>, <em>ป้องกันความเสี่ยง</em> และ <em>สร้างรายได้</em> ในตลาดทุกทิศทาง
          แต่ต้องเข้าใจพื้นฐานตลาดและการบริหารความเสี่ยงก่อน จึงเริ่มจากโมดูลนี้
        </p>
      </Callout>
    </>
  );
}

function BidAsk() {
  return (
    <>
      <p>
        ทุกสินทรัพย์ที่ซื้อขายในตลาดมี "ราคา" สองราคาเสมอ ไม่ใช่ราคาเดียวอย่างที่เห็นบนกราฟ
      </p>
      <ul>
        <li>
          <Term id="bid" /> — ราคาสูงสุดที่ผู้ซื้อยอมจ่าย → ถ้าคุณ<strong>ขาย</strong>ทันที จะได้ราคานี้
        </li>
        <li>
          <Term id="ask" /> — ราคาต่ำสุดที่ผู้ขายยอมขาย → ถ้าคุณ<strong>ซื้อ</strong>ทันที จะจ่ายราคานี้
        </li>
        <li>
          <Term id="spread" /> = Ask − Bid คือต้นทุนแฝงที่คุณจ่ายให้ตลาดทุกครั้งที่ซื้อแล้วขาย
        </li>
      </ul>

      <Callout type="example">
        <p>
          หุ้น XYZ: Bid $99.98 / Ask $100.05 → Spread = $0.07 ถ้าซื้อ 1,000 หุ้นแล้วขายคืนทันที จะขาดทุน $70
          ทั้งที่ราคาไม่ได้เปลี่ยนเลย
        </p>
      </Callout>

      <h2><Term id="liquidity" /> สำคัญอย่างไร</h2>
      <p>
        สินทรัพย์ที่มี <Term id="volume" /> สูงและมีผู้ซื้อขายเยอะ (เช่น SPY, AAPL) มัก spread แคบแค่ 1 เซนต์
        ส่วนหุ้นเล็กหรือ option ที่ strike ไกลๆ อาจ spread กว้างหลายเปอร์เซ็นต์
      </p>
      <ul>
        <li>สภาพคล่องสูง → spread แคบ, ซื้อขายจำนวนมากได้โดยราคาไม่ขยับ</li>
        <li>สภาพคล่องต่ำ → spread กว้าง, เกิด <Term id="slippage" /> ได้ง่าย, ออกจากสถานะยาก</li>
      </ul>

      <Playground title="คำนวณต้นทุนจาก Spread" hint="ปรับ spread และความถี่ในการเทรด ดูว่าต้นทุนแฝงสะสมเร็วแค่ไหน">
        <SpreadCostCalc />
      </Playground>

      <Callout type="tip">
        <p>
          สำหรับ Options ให้ดู <strong>Open Interest</strong> และ <strong>Volume</strong> ของ strike นั้นก่อนเทรด
          และใช้ Limit order ที่ราคากลาง (mid price) ระหว่าง Bid กับ Ask เสมอ
        </p>
      </Callout>
    </>
  );
}

function OrderTypes() {
  return (
    <>
      <p>
        ประเภทคำสั่งเป็นตัวกำหนดว่าคุณให้ความสำคัญกับ <strong>ความแน่นอนของราคา</strong> หรือ <strong>ความแน่นอนว่าจะได้ของ</strong>
        ซึ่งเลือกได้แค่อย่างใดอย่างหนึ่ง
      </p>

      <table>
        <thead>
          <tr>
            <th>คำสั่ง</th>
            <th>ทำงานอย่างไร</th>
            <th>ใช้เมื่อ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Term id="market-order" /></td>
            <td>จับคู่ทันทีกับราคาที่ดีที่สุดที่มีอยู่</td>
            <td>ต้องการเข้า/ออกทันที ในสินทรัพย์ที่สภาพคล่องสูง</td>
          </tr>
          <tr>
            <td><Term id="limit-order" /></td>
            <td>ซื้อที่ราคานี้หรือต่ำกว่า / ขายที่ราคานี้หรือสูงกว่า</td>
            <td>ต้องการคุมราคา (ควรใช้เป็นหลักกับ Options)</td>
          </tr>
          <tr>
            <td><Term id="stop-order" /></td>
            <td>เมื่อราคาแตะ stop → กลายเป็น Market order</td>
            <td>ตัดขาดทุนอัตโนมัติ</td>
          </tr>
          <tr>
            <td><Term id="stop-limit" /></td>
            <td>เมื่อราคาแตะ stop → กลายเป็น Limit order</td>
            <td>ตัดขาดทุนแบบคุมราคา (เสี่ยงไม่ได้ขายถ้าราคา gap)</td>
          </tr>
          <tr>
            <td><Term id="trailing-stop" /></td>
            <td>Stop ที่เลื่อนตามราคาเป็นระยะคงที่ ($ หรือ %)</td>
            <td>ปล่อยให้กำไรวิ่งไปพร้อมล็อกกำไรบางส่วน</td>
          </tr>
        </tbody>
      </table>

      <h2>Order Book: เบื้องหลังการจับคู่</h2>
      <p>
        Order Book แสดงคำสั่ง Limit ทั้งหมดที่รอจับคู่ ฝั่ง Ask (สีแดง) คือคนรอขาย ฝั่ง Bid (สีเขียว) คือคนรอซื้อ
        เมื่อคุณส่ง Market order ซื้อจำนวนมาก คำสั่งจะ "กิน" Ask ทีละระดับราคาขึ้นไปเรื่อยๆ ทำให้ได้ราคาเฉลี่ยแย่ลง
      </p>

      <Playground
        title="จำลอง Order Book"
        hint="ลองส่ง Market order ซื้อ 1,000 หุ้น → ดู slippage จากนั้นลอง Limit order ซื้อที่ $99.99 แล้วดูว่าคำสั่งไปรอใน book"
      >
        <OrderBookSim />
      </Playground>

      <Callout type="warn" title="Stop Loss ไม่ได้การันตีราคา">
        <p>
          ถ้าหุ้นปิดที่ $50 แล้วเปิดวันรุ่งขึ้นที่ $42 (gap down จากข่าวร้าย) Stop order ที่ $48 จะขายได้ประมาณ $42 ไม่ใช่ $48
          ส่วน Stop-Limit ที่ $48 อาจไม่ได้ขายเลย
        </p>
      </Callout>
    </>
  );
}

function LongShortLeverage() {
  return (
    <>
      <h2>Long และ Short</h2>
      <ul>
        <li>
          <Term id="long" />: ซื้อก่อน ขายทีหลัง → กำไรเมื่อราคาขึ้น ขาดทุนสูงสุด = เงินที่ลงไป (ราคาลงได้ต่ำสุดแค่ 0)
        </li>
        <li>
          <Term id="short" />: ยืมหุ้นมาขายก่อน ซื้อคืนทีหลัง → กำไรเมื่อราคาลง แต่
          <strong>ขาดทุนไม่จำกัด</strong> เพราะราคาขึ้นได้ไม่จำกัด และต้องจ่ายค่ายืมหุ้น (borrow fee)
        </li>
      </ul>

      <Callout type="tip">
        <p>
          ในโมดูล Options คุณจะเห็นว่าการซื้อ Put ให้ผลคล้ายการ Short แต่<strong>จำกัดขาดทุน</strong>ได้ ซึ่งเป็นเหตุผลหนึ่งที่
          options ได้รับความนิยม
        </p>
      </Callout>

      <h2><Term id="leverage" /> และ <Term id="margin" /></h2>
      <p>
        บัญชี Margin ให้คุณยืมเงินโบรกเกอร์มาซื้อหุ้นเพิ่ม (Reg T ในสหรัฐให้ซื้อได้สูงสุด 2 เท่าของเงินตัวเองสำหรับถือข้ามคืน)
        Leverage ขยายผลตอบแทนทั้งสองทาง: ราคาขยับ 10% ที่ leverage 2x = พอร์ตขยับ 20%
      </p>
      <p>
        ถ้าพอร์ตลดลงจนสัดส่วนเงินตัวเองต่ำกว่า <strong>Maintenance Margin</strong> (ขั้นต่ำ 25% ตามกฎ FINRA แต่โบรกเกอร์มักตั้งสูงกว่า)
        จะเกิด <Term id="margin-call" /> ต้องเติมเงินหรือถูกบังคับขาย มักเกิดตอนราคาต่ำที่สุด
      </p>

      <Playground title="เครื่องคิดเลข Leverage" hint="ลองเพิ่ม leverage เป็น 4x แล้วดูว่าราคาลดลงเท่าไรถึงจะโดน margin call">
        <LeverageCalc />
      </Playground>

      <Callout type="warn">
        <p>
          Leverage ไม่ได้ทำให้คุณเทรดเก่งขึ้น มันแค่ทำให้ผลลัพธ์ของคุณ (ทั้งดีและแย่) มาเร็วขึ้น มือใหม่ควรเริ่มจาก leverage 1x
        </p>
      </Callout>
    </>
  );
}

export const MODULE1_LESSONS: Lesson[] = [
  {
    id: 'asset-classes',
    title: 'ประเภทสินทรัพย์และตลาดสหรัฐ',
    summary: 'หุ้น, ETF, Options, Futures, Forex, Crypto ต่างกันอย่างไร',
    minutes: 6,
    Body: AssetClasses,
    quiz: [
      {
        q: 'สินทรัพย์ใดต่อไปนี้มี "วันหมดอายุ"?',
        choices: ['หุ้น AAPL', 'ETF SPY', 'Options และ Futures', 'Bitcoin'],
        answer: 2,
        explain: 'Options และ Futures เป็นสัญญาที่มีวันหมดอายุ ต่างจากหุ้น/ETF ที่ถือได้ไม่จำกัดเวลา',
      },
      {
        q: 'ETF อย่าง SPY ช่วยนักลงทุนเรื่องใด?',
        choices: ['การันตีกำไร', 'กระจายความเสี่ยงไปหลายบริษัทในคำสั่งเดียว', 'ไม่มีความผันผวน', 'ได้ leverage 10 เท่า'],
        answer: 1,
        explain: 'SPY ติดตามดัชนี S&P 500 ซึ่งประกอบด้วยหุ้นใหญ่ประมาณ 500 บริษัท',
      },
      {
        q: 'ตลาดหุ้นสหรัฐเวลาทำการปกติ ตรงกับเวลาไทยช่วงใด (ช่วง Daylight Saving)?',
        choices: ['09:30–16:00 น.', '20:30–03:00 น.', '06:00–12:00 น.', 'เปิด 24 ชั่วโมง'],
        answer: 1,
        explain: '9:30–16:00 ET ตรงกับประมาณ 20:30–03:00 น. เวลาไทย ในช่วง Daylight Saving',
      },
    ],
  },
  {
    id: 'bid-ask-spread',
    title: 'Bid, Ask, Spread และสภาพคล่อง',
    summary: 'ต้นทุนแฝงที่มือใหม่มักมองข้าม',
    minutes: 6,
    Body: BidAsk,
    quiz: [
      {
        q: 'ถ้าคุณส่งคำสั่งซื้อแบบ Market order คุณจะได้ราคาใด?',
        choices: ['Bid', 'Ask', 'ราคาปิดเมื่อวาน', 'ราคากลางระหว่าง Bid กับ Ask'],
        answer: 1,
        explain: 'ผู้ซื้อที่ต้องการของทันทีต้องซื้อจากผู้ที่เสนอขาย ซึ่งก็คือราคา Ask',
      },
      {
        q: 'Bid $20.00 / Ask $20.10 ซื้อ 500 หุ้นแล้วขายทันที ขาดทุนจาก spread เท่าไร?',
        choices: ['$5', '$10', '$50', '$100'],
        answer: 2,
        explain: 'Spread $0.10 × 500 หุ้น = $50',
      },
      {
        q: 'ข้อใดเป็นสัญญาณของสภาพคล่องต่ำ?',
        choices: ['Spread แคบ 1 เซนต์', 'Volume สูงมาก', 'Spread กว้างและ volume ต่ำ', 'มีคนซื้อขายตลอดเวลา'],
        answer: 2,
        explain: 'สภาพคล่องต่ำทำให้ spread กว้าง และเกิด slippage ได้ง่าย',
      },
    ],
  },
  {
    id: 'order-types',
    title: 'ประเภทคำสั่งซื้อขาย',
    summary: 'Market, Limit, Stop, Stop-Limit, Trailing Stop + จำลอง Order Book',
    minutes: 8,
    Body: OrderTypes,
    quiz: [
      {
        q: 'คำสั่งใดการันตีราคา แต่ไม่การันตีว่าจะได้ของ?',
        choices: ['Market order', 'Limit order', 'Stop order', 'ทุกคำสั่งการันตีทั้งสองอย่าง'],
        answer: 1,
        explain: 'Limit order จะจับคู่เฉพาะที่ราคากำหนดหรือดีกว่า ถ้าราคาไม่มาถึงก็ไม่ได้ของ',
      },
      {
        q: 'ตั้ง Stop order ขายที่ $48 แต่หุ้น gap down เปิดที่ $42 จะเกิดอะไรขึ้น?',
        choices: ['ขายได้ $48 เสมอ', 'ขายได้ราคาประมาณ $42', 'คำสั่งถูกยกเลิก', 'โบรกเกอร์ชดเชยส่วนต่าง'],
        answer: 1,
        explain: 'Stop order กลายเป็น Market order เมื่อถูก trigger จึงขายที่ราคาตลาดขณะนั้นคือราว $42',
      },
      {
        q: 'ส่ง Market order ซื้อจำนวนมากใน order book ที่บาง จะเกิดอะไร?',
        choices: ['ได้ราคา Ask แรกทั้งหมด', 'เกิด slippage ราคาเฉลี่ยแย่กว่า Ask แรก', 'คำสั่งถูกปฏิเสธ', 'ได้ราคา Bid'],
        answer: 1,
        explain: 'คำสั่งจะกิน Ask หลายระดับราคา ทำให้ราคาเฉลี่ยสูงกว่า Ask แรก',
      },
    ],
  },
  {
    id: 'long-short-leverage',
    title: 'Long, Short, Leverage และ Margin',
    summary: 'ทำกำไรได้ทั้งขาขึ้นและขาลง และดาบสองคมของ leverage',
    minutes: 7,
    Body: LongShortLeverage,
    quiz: [
      {
        q: 'ทำไมการ Short หุ้นจึงมีความเสี่ยงไม่จำกัด?',
        choices: ['เพราะราคาหุ้นขึ้นได้ไม่จำกัด', 'เพราะต้องถือจนหมดอายุ', 'เพราะโบรกเกอร์คิดค่าคอมสูง', 'ไม่จริง ความเสี่ยงจำกัด'],
        answer: 0,
        explain: 'คนที่ Short ต้องซื้อคืนในอนาคต ถ้าราคาพุ่งขึ้นเรื่อยๆ ขาดทุนก็เพิ่มขึ้นได้เรื่อยๆ',
      },
      {
        q: 'ใช้ leverage 3x ราคาหุ้นลดลง 10% พอร์ต (เงินทุนตัวเอง) ลดลงเท่าไร?',
        choices: ['10%', '13%', '30%', '3%'],
        answer: 2,
        explain: 'Leverage 3x ขยายผล 3 เท่า: 10% × 3 = 30%',
      },
      {
        q: 'Margin Call คืออะไร?',
        choices: [
          'โบรกเกอร์โทรมาแสดงความยินดี',
          'การเรียกให้เติมเงินเมื่อสัดส่วนเงินทุนต่ำกว่าเกณฑ์ ไม่งั้นถูกบังคับขาย',
          'การได้ดอกเบี้ยเพิ่ม',
          'คำสั่งซื้อแบบพิเศษ',
        ],
        answer: 1,
        explain: 'เมื่อ equity ต่ำกว่า maintenance margin โบรกเกอร์จะเรียกเงินเพิ่มหรือขายสถานะของคุณ',
      },
    ],
  },
];
