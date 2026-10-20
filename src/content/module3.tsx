import { Term } from '../components/Term';
import { CandleAnatomy, IndicatorLab, MiniCandles, PatternGallery, PatternGame, TrendStructure, ValuationCalc } from '../components/tools/AnalysisTools';
import { Callout, Formula, Playground } from '../components/ui';
import type { Lesson } from './types';

function Candles() {
  return (
    <>
      <p>
        <Term id="candlestick" /> แต่ละแท่งเล่าเรื่องการต่อสู้ระหว่างผู้ซื้อและผู้ขายในช่วงเวลาหนึ่ง ด้วยราคา 4 ค่า:{' '}
        <strong>Open, High, Low, Close (OHLC)</strong>
      </p>
      <ul>
        <li>
          <strong>ตัวเทียน (Body):</strong> ระหว่างราคาเปิดกับปิด แท่งเขียว = ปิดสูงกว่าเปิด แท่งแดง = ปิดต่ำกว่าเปิด
        </li>
        <li>
          <strong>ไส้ (Wick/Shadow):</strong> ราคาสูงสุดและต่ำสุดที่ไปถึงแต่ถูกดันกลับ ไส้ยาว = มีการปฏิเสธราคาระดับนั้น
        </li>
      </ul>

      <Playground title="กายวิภาคแท่งเทียน" hint="ปรับ OHLC หรือกดรูปแบบสำเร็จรูป ระบบจะบอกชื่อและความหมายของแท่ง">
        <CandleAnatomy />
      </Playground>

      <h2>รูปแบบแท่งเทียนที่ใช้บ่อย</h2>
      <div className="not-prose my-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MiniCandles
          title="Hammer"
          bias="bullish"
          candles={[
            [108, 109, 103, 104],
            [104, 105, 99, 100],
            [99, 100.5, 93, 100],
          ]}
          note="หลังขาลง ไส้ล่างยาว ผู้ซื้อดันราคากลับขึ้นมา"
        />
        <MiniCandles
          title="Shooting Star"
          bias="bearish"
          candles={[
            [92, 96, 91, 95],
            [95, 100, 94, 99],
            [100, 107, 99.5, 99],
          ]}
          note="หลังขาขึ้น ไส้บนยาว ผู้ขายกดราคาลงมา"
        />
        <MiniCandles
          title="Bullish Engulfing"
          bias="bullish"
          candles={[
            [106, 107, 101, 102],
            [102, 103, 98, 99],
            [98, 105, 97.5, 104.5],
          ]}
          note="แท่งเขียวกลืนตัวแท่งแดงก่อนหน้าทั้งหมด"
        />
        <MiniCandles
          title="Bearish Engulfing"
          bias="bearish"
          candles={[
            [94, 99, 93, 98],
            [98, 102, 97, 101],
            [102, 103, 95, 95.5],
          ]}
          note="แท่งแดงกลืนตัวแท่งเขียวก่อนหน้าทั้งหมด"
        />
        <MiniCandles
          title="Morning Star"
          bias="bullish"
          candles={[
            [108, 108.5, 100, 101],
            [99.5, 100.5, 98, 99.8],
            [100.5, 107, 100, 106.5],
          ]}
          note="แดงยาว → แท่งเล็กลังเล → เขียวยาว สัญญาณกลับตัวขึ้น 3 แท่ง"
        />
        <MiniCandles
          title="Doji"
          bias="neutral"
          candles={[
            [96, 100, 95, 99],
            [99, 103, 98, 102],
            [102, 105, 99, 102.1],
          ]}
          note="ตลาดลังเล ต้องรอแท่งถัดไปยืนยัน"
        />
      </div>

      <Callout type="warn" title="บริบทสำคัญกว่ารูปแบบ">
        <p>
          รูปแบบแท่งเทียนเดี่ยวๆ มีความน่าเชื่อถือต่ำ จะมีความหมายเมื่อเกิดใน<strong>ตำแหน่งที่ถูกต้อง</strong> เช่น Hammer ที่แนวรับสำคัญหลังขาลง
          พร้อม volume สูง และควรรอแท่งถัดไปยืนยันก่อนเข้า
        </p>
      </Callout>
    </>
  );
}

function TrendSR() {
  return (
    <>
      <p>หัวใจของ technical analysis คือการตอบคำถามว่า "ตอนนี้ตลาดอยู่ในเทรนด์แบบไหน" และ "ราคาสำคัญอยู่ตรงไหน"</p>

      <h2>โครงสร้างเทรนด์</h2>
      <ul>
        <li>
          <strong>ขาขึ้น:</strong> <Term id="higher-high" /> แต่ละยอดสูงขึ้น (HH) และแต่ละฐานสูงขึ้น (HL)
        </li>
        <li>
          <strong>ขาลง:</strong> Lower High (LH) และ Lower Low (LL)
        </li>
        <li>
          <strong>ออกข้าง:</strong> ยอดและฐานอยู่ในระดับใกล้เคียงกัน ไม่มีทิศทางชัด
        </li>
      </ul>
      <p>
        เทรนด์ขาขึ้น "จบ" เมื่อเกิด Lower Low ครั้งแรก (ราคาหลุดฐานล่าสุด) นี่คือเหตุผลที่เทรดเดอร์นิยมวาง stop ใต้ swing low ล่าสุด
      </p>

      <h2><Term id="support" /> และ <Term id="resistance" /></h2>
      <ul>
        <li>มักเกิดที่ swing high/low เดิม, ตัวเลขกลมๆ ($100, $150) และเส้นค่าเฉลี่ยที่คนดูเยอะ</li>
        <li>
          <strong>Role reversal:</strong> แนวต้านที่ถูกทะลุมักกลายเป็นแนวรับ และแนวรับที่หลุดมักกลายเป็นแนวต้าน
        </li>
        <li>ยิ่งถูกทดสอบหลายครั้งและมี volume สูง ยิ่งสำคัญ แต่ก็ยิ่งมีโอกาสถูกทะลุเมื่อแรงฝั่งตรงข้ามหมด</li>
      </ul>

      <Playground title="หา Swing High/Low และโครงสร้างเทรนด์" hint="สลับสภาพตลาด ดูว่าป้าย HH/HL/LH/LL เปลี่ยนอย่างไร ลองปรับความไวของ swing">
        <TrendStructure />
      </Playground>

      <Callout type="tip">
        <p>
          แนวรับแนวต้านเป็น "โซน" ไม่ใช่เส้นเป๊ะๆ ราคามักทะลุเลยไปเล็กน้อยแล้วกลับ (false break) อย่าวาง stop ตรงเส้นพอดี ให้เผื่อระยะไว้
          เช่น 0.5–1 เท่าของ <Term id="atr" />
        </p>
      </Callout>
    </>
  );
}

function Patterns() {
  return (
    <>
      <p>Chart pattern คือรูปทรงของราคาที่เกิดซ้ำๆ เพราะสะท้อนพฤติกรรมของคนในตลาด แบ่งเป็น 2 กลุ่ม:</p>
      <ul>
        <li>
          <strong>Reversal (กลับตัว):</strong> Head & Shoulders, Double Top/Bottom → เทรนด์เดิมกำลังจะจบ
        </li>
        <li>
          <strong>Continuation (ไปต่อ):</strong> Triangle, Flag → พักตัวก่อนไปทางเดิม
        </li>
      </ul>

      <Playground title="แกลเลอรี Chart Patterns" hint="เลือกรูปแบบเพื่อดูโครงสร้าง เส้นสำคัญ และวิธีเทรด">
        <PatternGallery />
      </Playground>

      <h2>หลักการเทรด Chart Pattern</h2>
      <ol>
        <li>
          <strong>รอการยืนยัน:</strong> เข้าเมื่อราคาปิดทะลุเส้นสำคัญ (neckline/แนวต้าน) ไม่ใช่ตอนที่รูปแบบ "น่าจะ" เกิด
        </li>
        <li>
          <strong>ดู volume:</strong> การทะลุที่ดีมักมี volume สูงกว่าค่าเฉลี่ย
        </li>
        <li>
          <strong>วาง stop ที่ทำให้รูปแบบล้มเหลว:</strong> เช่น เหนือไหล่ขวาของ Head & Shoulders
        </li>
        <li>
          <strong>เป้าหมายแบบ measured move:</strong> ความสูงของรูปแบบ วัดจากจุดทะลุ
        </li>
      </ol>

      <Playground title="เกมทายรูปแบบกราฟ" hint="กราฟซ่อนช่วงทะลุไว้ ลองดูโครงสร้างแล้วทายว่าเป็นรูปแบบอะไร">
        <PatternGame />
      </Playground>

      <Callout type="warn">
        <p>
          สมองมนุษย์เก่งในการ "เห็น" รูปแบบแม้ในข้อมูลสุ่ม รูปแบบที่ดูชัดเจนในอดีตมักไม่ชัดขณะเกิดจริง ใช้ chart pattern ร่วมกับ
          การบริหารความเสี่ยงเสมอ และยอมรับว่ารูปแบบล้มเหลวได้บ่อย
        </p>
      </Callout>
    </>
  );
}

function Indicators() {
  return (
    <>
      <p>Indicator คือสูตรคำนวณจากราคาและ volume ช่วยให้เห็นเทรนด์ โมเมนตัม และความผันผวนชัดขึ้น แต่ทุกตัว "ตามหลัง" ราคาเสมอ</p>

      <h2>กลุ่มเทรนด์: Moving Averages</h2>
      <ul>
        <li>
          <Term id="sma" />: เฉลี่ยราคาปิด N แท่ง เรียบ แต่ช้า
        </li>
        <li>
          <Term id="ema" />: ให้น้ำหนักราคาล่าสุดมากกว่า ตอบสนองเร็วกว่า
        </li>
        <li>เส้นยอดนิยม: 20 (ระยะสั้น), 50 (ระยะกลาง), 200 (ระยะยาว) ราคาอยู่เหนือ SMA 200 = ขาขึ้นระยะยาว</li>
      </ul>

      <h2>กลุ่มโมเมนตัม: RSI และ MACD</h2>
      <Formula>
        RSI = 100 − 100 / (1 + RS) &nbsp;&nbsp; RS = กำไรเฉลี่ย ÷ ขาดทุนเฉลี่ย (14 แท่ง)
        <br />
        MACD = EMA(12) − EMA(26) &nbsp;&nbsp; Signal = EMA(9) ของ MACD
      </Formula>
      <ul>
        <li>
          <Term id="rsi" /> &gt; 70 = Overbought, &lt; 30 = Oversold แต่ในเทรนด์แรง RSI ค้างโซนสุดขั้วได้นาน
        </li>
        <li>
          <Term id="macd" /> ตัดขึ้นเหนือ Signal = โมเมนตัมเป็นบวก Histogram บอกความแรง
        </li>
        <li>
          <strong>Divergence:</strong> ราคาทำ High ใหม่แต่ RSI/MACD ทำ High ต่ำลง = โมเมนตัมอ่อนแรง
        </li>
      </ul>

      <h2>กลุ่มความผันผวน: Bollinger Bands และ ATR</h2>
      <ul>
        <li>
          <Term id="bollinger" />: แบนด์บีบแคบ (squeeze) มักตามด้วยการเคลื่อนไหวแรง
        </li>
        <li>
          <Term id="atr" />: ใช้กำหนดระยะ stop ให้เหมาะกับความผันผวนของหุ้นแต่ละตัว
        </li>
      </ul>

      <Playground title="Indicator Lab" hint="เปิด/ปิด indicator และปรับ period ลองสังเกตว่า RSI ทำงานต่างกันอย่างไรในตลาดขาขึ้นกับตลาด sideway">
        <IndicatorLab initial={['sma', 'ema', 'rsi', 'macd']} />
      </Playground>

      <Callout type="tip" title="Indicator น้อยแต่เข้าใจลึก">
        <p>
          หลาย indicator ใช้ข้อมูลเดียวกัน (ราคาปิด) จึงให้ข้อมูลซ้ำซ้อน เลือก 1 ตัวต่อกลุ่ม (เทรนด์ + โมเมนตัม + ความผันผวน) และเข้าใจว่ามัน
          ทำงานได้ดีและแย่ในตลาดแบบไหน ดีกว่าใส่ 10 ตัวจนกราฟรก
        </p>
      </Callout>
    </>
  );
}

function Fundamentals() {
  return (
    <>
      <p>
        Technical บอกว่า "<strong>เมื่อไร</strong>" ส่วน Fundamental บอกว่า "<strong>อะไร</strong>" ควรซื้อ แม้แต่ swing trader ก็ควรรู้พื้นฐานเพื่อ
        หลีกเลี่ยงหุ้นที่มีปัญหาและรู้ว่าเหตุการณ์ไหนทำให้ราคาวิ่งแรง
      </p>

      <h2>ตัวเลขพื้นฐานสำคัญ</h2>
      <table>
        <thead>
          <tr>
            <th>ตัวชี้วัด</th>
            <th>คำนวณ</th>
            <th>บอกอะไร</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Term id="eps" /></td>
            <td>กำไรสุทธิ ÷ จำนวนหุ้น</td>
            <td>ความสามารถทำกำไรต่อหุ้น</td>
          </tr>
          <tr>
            <td><Term id="pe" /></td>
            <td>ราคา ÷ EPS</td>
            <td>ตลาดจ่ายกี่เท่าของกำไร (แพง/ถูก เทียบกับอุตสาหกรรม)</td>
          </tr>
          <tr>
            <td>Revenue Growth</td>
            <td>ยอดขายปีนี้ ÷ ปีก่อน − 1</td>
            <td>ธุรกิจโตหรือไม่</td>
          </tr>
          <tr>
            <td>Gross / Net Margin</td>
            <td>กำไร ÷ ยอดขาย</td>
            <td>อำนาจการตั้งราคาและประสิทธิภาพ</td>
          </tr>
          <tr>
            <td>Debt / Equity</td>
            <td>หนี้สิน ÷ ส่วนผู้ถือหุ้น</td>
            <td>ความเสี่ยงทางการเงิน</td>
          </tr>
          <tr>
            <td>Free Cash Flow</td>
            <td>กระแสเงินสดดำเนินงาน − รายจ่ายลงทุน</td>
            <td>เงินสดที่เหลือจริง (กำไรตกแต่งได้ เงินสดตกแต่งยาก)</td>
          </tr>
        </tbody>
      </table>

      <Playground title="เครื่องคิด Valuation อย่างง่าย" hint="ลองเปลี่ยนอัตราเติบโตและ P/E ปลายทาง ดูว่าสมมติฐานเล็กๆ ส่งผลต่อผลตอบแทนแค่ไหน">
        <ValuationCalc />
      </Playground>

      <h2>ปฏิทินเศรษฐกิจและเหตุการณ์สำคัญ (สหรัฐ)</h2>
      <table>
        <thead>
          <tr>
            <th>เหตุการณ์</th>
            <th>ความถี่</th>
            <th>ผลต่อตลาด</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>FOMC</strong> (ประชุมกำหนดดอกเบี้ย Fed)</td>
            <td>8 ครั้ง/ปี</td>
            <td>สูงมาก ทั้งตลาดหุ้น พันธบัตร และค่าเงิน</td>
          </tr>
          <tr>
            <td><strong>CPI</strong> (เงินเฟ้อ)</td>
            <td>รายเดือน</td>
            <td>สูง กำหนดทิศทางนโยบายดอกเบี้ย</td>
          </tr>
          <tr>
            <td><strong>Nonfarm Payrolls</strong> (การจ้างงาน)</td>
            <td>ศุกร์แรกของเดือน</td>
            <td>สูง สะท้อนสุขภาพเศรษฐกิจ</td>
          </tr>
          <tr>
            <td><strong>Earnings</strong> (ประกาศงบรายไตรมาส)</td>
            <td>4 ครั้ง/ปีต่อบริษัท</td>
            <td>หุ้นรายตัววิ่งแรง IV พุ่งก่อนประกาศและร่วงหลังประกาศ</td>
          </tr>
        </tbody>
      </table>

      <Callout type="tip" title="ใช้ร่วมกับ Options">
        <p>
          เช็ควันประกาศงบก่อนเปิดสถานะ options เสมอ ถ้าไม่ได้ตั้งใจเทรดงบ ให้เลือกวันหมดอายุก่อนวันประกาศ หรือเตรียมรับ IV crush (โมดูล 5)
        </p>
      </Callout>
    </>
  );
}

export const MODULE3_LESSONS: Lesson[] = [
  {
    id: 'candlesticks',
    title: 'กราฟแท่งเทียน',
    summary: 'OHLC, ตัวเทียน, ไส้ และรูปแบบ 1–3 แท่งที่ใช้บ่อย',
    minutes: 8,
    Body: Candles,
    quiz: [
      {
        q: 'แท่งเทียนที่ไส้ล่างยาวมาก ตัวเล็กอยู่ด้านบน เกิดหลังขาลง เรียกว่าอะไร?',
        choices: ['Shooting Star', 'Hammer', 'Bearish Engulfing', 'Marubozu'],
        answer: 1,
        explain: 'Hammer แสดงว่าผู้ขายกดลงแรงแต่ผู้ซื้อดันกลับขึ้นมาได้ เป็นสัญญาณกลับตัวขึ้นที่ต้องรอยืนยัน',
      },
      {
        q: 'ไส้บนที่ยาว บอกอะไร?',
        choices: ['ผู้ซื้อคุมตลาดทั้งแท่ง', 'ราคาขึ้นไปสูงแต่ถูกแรงขายกดกลับ', 'ไม่มีความหมาย', 'ปิดที่ราคาสูงสุด'],
        answer: 1,
        explain: 'ไส้บนยาวแปลว่ามีการปฏิเสธราคาสูง ผู้ขายกดราคากลับลงมา',
      },
      {
        q: 'ข้อใดถูกต้องเกี่ยวกับรูปแบบแท่งเทียน?',
        choices: ['ใช้เดี่ยวๆ ได้แม่นยำ 90%', 'ต้องดูบริบท เช่น ตำแหน่งแนวรับแนวต้านและ volume', 'ใช้ได้เฉพาะกราฟรายวัน', 'ไม่ต้องรอยืนยัน'],
        answer: 1,
        explain: 'รูปแบบแท่งเทียนมีความหมายเมื่อเกิดในบริบทที่ถูกต้องและได้รับการยืนยัน',
      },
    ],
  },
  {
    id: 'trend-support-resistance',
    title: 'เทรนด์ แนวรับ แนวต้าน',
    summary: 'HH/HL/LH/LL, Swing high/low และ Role reversal',
    minutes: 8,
    Body: TrendSR,
    quiz: [
      {
        q: 'โครงสร้างขาขึ้นประกอบด้วยอะไร?',
        choices: ['Lower High + Lower Low', 'Higher High + Higher Low', 'Higher High + Lower Low', 'ราคาอยู่นิ่ง'],
        answer: 1,
        explain: 'ขาขึ้น = ยอดสูงขึ้นและฐานสูงขึ้นต่อเนื่อง',
      },
      {
        q: 'แนวต้านที่ถูกทะลุขึ้นไปแล้ว มักทำหน้าที่อะไรต่อ?',
        choices: ['หายไป', 'กลายเป็นแนวรับ', 'กลายเป็นแนวต้านที่แข็งแรงขึ้น', 'ทำให้ราคาลงทันที'],
        answer: 1,
        explain: 'Role reversal: แนวต้านเดิมมักกลายเป็นแนวรับเมื่อราคาย่อกลับมาทดสอบ',
      },
      {
        q: 'ทำไมไม่ควรวาง stop loss ตรงแนวรับพอดี?',
        choices: ['เพราะโบรกเกอร์ไม่อนุญาต', 'เพราะราคามักทะลุเลยไปเล็กน้อยก่อนกลับ (false break)', 'เพราะเสียค่าคอมเพิ่ม', 'ควรวางตรงพอดี'],
        answer: 1,
        explain: 'แนวรับเป็นโซน ควรเผื่อระยะ เช่น ตาม ATR เพื่อไม่โดน stop จาก noise',
      },
    ],
  },
  {
    id: 'chart-patterns',
    title: 'Chart Patterns',
    summary: 'Head & Shoulders, Double Top/Bottom, Triangle, Flag + เกมทายรูปแบบ',
    minutes: 10,
    Body: Patterns,
    quiz: [
      {
        q: 'Head & Shoulders เป็นรูปแบบประเภทใด?',
        choices: ['Bullish continuation', 'Bearish reversal', 'Bullish reversal', 'Neutral'],
        answer: 1,
        explain: 'Head & Shoulders เกิดหลังขาขึ้น บ่งบอกการกลับตัวเป็นขาลงเมื่อหลุด neckline',
      },
      {
        q: 'ควรเข้าเทรด Double Bottom เมื่อใด?',
        choices: ['ตอนราคาลงมาที่ก้นที่สอง', 'เมื่อราคาปิดทะลุ neckline ขึ้นไป', 'ก่อนเกิดก้นแรก', 'เมื่อ RSI ต่ำกว่า 10'],
        answer: 1,
        explain: 'รอการยืนยันด้วยการปิดทะลุ neckline เพื่อลดโอกาสที่รูปแบบจะล้มเหลว',
      },
      {
        q: 'Bull Flag บ่งบอกอะไร?',
        choices: ['ขาขึ้นจบแล้ว', 'การพักตัวสั้นๆ ก่อนขึ้นต่อ', 'ตลาดจะ sideway ยาว', 'ขาลงแรง'],
        answer: 1,
        explain: 'Bull Flag เป็นรูปแบบ continuation หลังการพุ่งขึ้นแรง',
      },
    ],
  },
  {
    id: 'indicators',
    title: 'Indicators: MA, RSI, MACD, Bollinger',
    summary: 'เทรนด์ โมเมนตัม และความผันผวน แบบปรับค่าได้',
    minutes: 12,
    Body: Indicators,
    quiz: [
      {
        q: 'EMA ต่างจาก SMA อย่างไร?',
        choices: ['EMA ช้ากว่า', 'EMA ให้น้ำหนักราคาล่าสุดมากกว่า จึงตอบสนองเร็วกว่า', 'เหมือนกันทุกประการ', 'EMA ใช้ volume'],
        answer: 1,
        explain: 'EMA ถ่วงน้ำหนักแบบ exponential ให้ราคาล่าสุดสำคัญกว่า',
      },
      {
        q: 'RSI อยู่ที่ 80 ในขาขึ้นแรง หมายความว่าอย่างไร?',
        choices: ['ต้องขายทันที', 'Overbought แต่ในเทรนด์แรง RSI ค้างโซนสูงได้นาน', 'หุ้นจะลงแน่นอน', 'RSI ผิดพลาด'],
        answer: 1,
        explain: 'Overbought ไม่ได้แปลว่าต้องกลับตัวทันที ในเทรนด์แรง RSI สูงได้ต่อเนื่อง',
      },
      {
        q: 'ราคาทำ High ใหม่แต่ RSI ทำ High ต่ำกว่าเดิม เรียกว่าอะไร?',
        choices: ['Golden Cross', 'Bearish Divergence', 'Bollinger Squeeze', 'Breakout'],
        answer: 1,
        explain: 'Bearish divergence บอกว่าโมเมนตัมอ่อนลงแม้ราคาจะยังขึ้น',
      },
      {
        q: 'Bollinger Bands บีบแคบมาก มักบ่งบอกอะไร?',
        choices: ['ความผันผวนต่ำ อาจตามด้วยการเคลื่อนไหวแรง', 'ราคาจะขึ้นแน่นอน', 'ตลาดปิด', 'ควรขายทั้งหมด'],
        answer: 0,
        explain: 'Squeeze สะท้อนช่วงความผันผวนต่ำ ซึ่งมักตามด้วยช่วงที่ความผันผวนเพิ่มขึ้น',
      },
    ],
  },
  {
    id: 'fundamentals',
    title: 'Fundamental เบื้องต้นและปฏิทินเศรษฐกิจ',
    summary: 'EPS, P/E, Margin, Cash Flow และเหตุการณ์ที่ขยับตลาด',
    minutes: 9,
    Body: Fundamentals,
    quiz: [
      {
        q: 'หุ้นราคา $120, EPS $4 มี P/E เท่าไร?',
        choices: ['4', '20', '30', '480'],
        answer: 2,
        explain: 'P/E = 120 ÷ 4 = 30',
      },
      {
        q: 'ทำไม Free Cash Flow จึงสำคัญ?',
        choices: ['เพราะใช้คำนวณ RSI', 'เพราะเป็นเงินสดจริงที่เหลือ ตกแต่งได้ยากกว่ากำไรทางบัญชี', 'เพราะเท่ากับยอดขาย', 'ไม่สำคัญ'],
        answer: 1,
        explain: 'กำไรทางบัญชีมีรายการไม่ใช่เงินสดได้มาก แต่ Free Cash Flow สะท้อนเงินสดที่เหลือจริง',
      },
      {
        q: 'เหตุการณ์ใดที่ทำให้ IV ของ options หุ้นรายตัวพุ่งขึ้นก่อนเกิด?',
        choices: ['วันหยุดตลาด', 'การประกาศงบ (Earnings)', 'การจ่ายปันผลปกติ', 'การแตกพาร์ที่ประกาศไปแล้ว'],
        answer: 1,
        explain: 'ความไม่แน่นอนก่อนประกาศงบทำให้ IV สูง และมักร่วงทันทีหลังประกาศ',
      },
    ],
  },
];
