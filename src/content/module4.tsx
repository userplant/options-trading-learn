import { Term } from '../components/Term';
import { BacktestPlayground, OverfitDemo } from '../components/tools/BacktestTools';
import { Callout, Playground } from '../components/ui';
import type { Lesson } from './types';

function TrendFollowing() {
  return (
    <>
      <p>
        <Term id="trend-following" /> ไม่พยายามทายจุดสูงสุดหรือต่ำสุด แต่รอให้เทรนด์ "พิสูจน์ตัวเอง" ก่อนแล้วค่อยตาม ถือจนกว่าเทรนด์จะจบ
        หลักการคือ <strong>"Cut your losses short, let your profits run"</strong>
      </p>

      <h2>ลักษณะเฉพาะ</h2>
      <ul>
        <li>Win rate มักต่ำ (30–45%) เพราะโดนหลอกบ่อยในตลาด sideway</li>
        <li>แต่ไม้ที่ชนะกำไรใหญ่มาก (R:R สูง) จับเทรนด์ใหญ่ได้ครั้งเดียวคุ้มกับไม้ที่แพ้หลายไม้</li>
        <li>เข้าช้ากว่าจุดต่ำสุดเสมอ และออกช้ากว่าจุดสูงสุดเสมอ</li>
      </ul>

      <h2>เครื่องมือยอดนิยม</h2>
      <ul>
        <li>
          <strong>Moving Average Crossover:</strong> EMA เร็วตัดขึ้นเหนือ EMA ช้า (Golden Cross) = เริ่มขาขึ้น
        </li>
        <li>
          <strong>Momentum:</strong> ซื้อหุ้นที่ขึ้นแรงที่สุดในช่วง N วันที่ผ่านมา (Rate of Change) เพราะหุ้นที่แข็งแรงมักแข็งแรงต่อ
        </li>
      </ul>

      <Playground
        title="Backtest: Trend Following"
        hint="ลองรัน MA Crossover ในตลาด 'ขาขึ้น' แล้วเปลี่ยนเป็น 'ออกข้าง' ดูว่าผลต่างกันอย่างไร"
      >
        <BacktestPlayground strategies={['ma-cross', 'momentum']} initialStrategy="ma-cross" initialRegime="bull" compact />
      </Playground>

      <Callout type="warn" title="Whipsaw">
        <p>
          ในตลาด sideway เส้นค่าเฉลี่ยจะตัดกันไปมาบ่อย ทำให้เข้าออกถี่และขาดทุนเล็กๆ ซ้ำๆ (whipsaw) นี่คือต้นทุนของการรอจับเทรนด์ใหญ่
          และเป็นเหตุผลที่ต้องคุมขนาดสถานะให้ทนการแพ้ติดกันได้
        </p>
      </Callout>
    </>
  );
}

function BreakoutPullback() {
  return (
    <>
      <p>สองวิธีหลักในการเข้าเทรนด์: เข้าตอนที่ราคา<strong>ทะลุ</strong> หรือรอเข้าตอนที่ราคา<strong>ย่อตัว</strong></p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Breakout</th>
            <th>Pullback</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>เข้าเมื่อ</td>
            <td>ราคาทะลุแนวต้าน/High ของ N วัน</td>
            <td>ราคาย่อลงมาแนวรับหรือเส้นค่าเฉลี่ยในขาขึ้น</td>
          </tr>
          <tr>
            <td>ข้อดี</td>
            <td>ไม่พลาดการวิ่งแรง</td>
            <td>ได้ราคาดีกว่า stop แคบกว่า R:R ดีกว่า</td>
          </tr>
          <tr>
            <td>ข้อเสีย</td>
            <td>False breakout บ่อย ราคาเข้าแย่</td>
            <td>อาจไม่ย่อมาให้เข้า หรือย่อแล้วกลายเป็นกลับตัว</td>
          </tr>
          <tr>
            <td>ตัวอย่างระบบ</td>
            <td>Donchian Channel (Turtle Traders)</td>
            <td>ย่อแตะ EMA 10–20 ในขาขึ้นเหนือ SMA 100</td>
          </tr>
        </tbody>
      </table>

      <Callout type="info" title="Turtle Traders">
        <p>
          ในปี 1983 Richard Dennis สอนคนทั่วไปให้เทรดด้วยกฎ breakout ง่ายๆ (ซื้อเมื่อทะลุ High 20 หรือ 55 วัน) พร้อมการคุมขนาดสถานะด้วย ATR
          หลายคนทำกำไรได้มาก แสดงว่าการเทรดเป็นทักษะที่สอนได้ถ้ามีกฎชัดเจนและวินัย
        </p>
      </Callout>

      <Playground title="Backtest: Breakout & Pullback" hint="เทียบสองวิธีบนข้อมูลชุดเดียวกัน ดู win rate, ระยะถือ และ drawdown">
        <BacktestPlayground strategies={['breakout', 'pullback']} initialStrategy="breakout" initialRegime="mixed" compact />
      </Playground>

      <Callout type="tip">
        <p>
          Breakout ที่ดีมักมี volume สูงกว่าปกติ และเกิดหลังช่วงพักตัวที่ความผันผวนต่ำ (Bollinger squeeze) ส่วน Pullback ที่ดีมักย่อด้วย volume
          ต่ำ แล้วกลับขึ้นด้วย volume สูง
        </p>
      </Callout>
    </>
  );
}

function MeanReversion() {
  return (
    <>
      <p>
        <Term id="mean-reversion" /> ทำตรงข้ามกับ trend following: ซื้อเมื่อราคา "ลงมากเกินไป" และขายเมื่อกลับมาที่ค่าเฉลี่ย
        อาศัยแนวคิดว่าราคาที่ยืดออกจากค่าเฉลี่ยมากๆ มักดีดกลับ
      </p>

      <h2>ลักษณะเฉพาะ</h2>
      <ul>
        <li>Win rate สูง (55–75%) แต่กำไรต่อไม้เล็ก ถือสั้น</li>
        <li>ทำงานดีในตลาด sideway และหุ้น/ดัชนีขนาดใหญ่ที่ไม่ค่อยเป็นเทรนด์แรง</li>
        <li>
          อันตรายในตลาดขาลงแรง: "ถูกแล้วยังถูกได้อีก" ซื้อ Oversold แล้วราคาลงต่อ ต้องมี stop หรือ trend filter
        </li>
      </ul>

      <h2>เครื่องมือยอดนิยม</h2>
      <ul>
        <li>
          <strong>RSI:</strong> ซื้อเมื่อ RSI ต่ำกว่า 30 (หรือ RSI 2 ต่ำกว่า 10 สำหรับระยะสั้นมาก) ขายเมื่อ RSI กลับขึ้นเหนือ 50–70
        </li>
        <li>
          <strong>Bollinger Bands:</strong> ซื้อเมื่อปิดต่ำกว่าแบนด์ล่าง ขายเมื่อกลับมาที่เส้นกลาง
        </li>
      </ul>

      <Playground title="Backtest: Mean Reversion" hint="รันในตลาด 'ออกข้าง' ก่อน แล้วเปลี่ยนเป็น 'ขาลง' — ลองปิด Stop Loss แล้วดู drawdown">
        <BacktestPlayground strategies={['rsi-reversion', 'bb-reversion']} initialStrategy="rsi-reversion" initialRegime="range" compact />
      </Playground>

      <Callout type="tip" title="เชื่อมกับ Options">
        <p>
          แนวคิด mean reversion คือรากฐานของกลยุทธ์ขาย premium อย่าง Iron Condor (โมดูล 5) ที่ได้กำไรเมื่อราคาอยู่ในกรอบ และเสี่ยงเมื่อเกิดเทรนด์แรง
          ส่วน trend following เข้ากับ Long Call/Put หรือ Debit Spread
        </p>
      </Callout>

      <h2>เลือกกลยุทธ์ให้ตรงกับสภาพตลาด</h2>
      <table>
        <thead>
          <tr>
            <th>สภาพตลาด</th>
            <th>กลยุทธ์ที่มักได้ผล</th>
            <th>กลยุทธ์ที่มักเจ็บ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>เทรนด์ชัด</td>
            <td>Trend Following, Breakout, Pullback</td>
            <td>Mean Reversion (สวนเทรนด์)</td>
          </tr>
          <tr>
            <td>Sideway</td>
            <td>Mean Reversion, Range trading</td>
            <td>Breakout (false break บ่อย)</td>
          </tr>
          <tr>
            <td>ผันผวนสูง</td>
            <td>ลดขนาด, stop ตาม ATR</td>
            <td>ทุกกลยุทธ์ที่ใช้ stop แคบ</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Playground4() {
  return (
    <>
      <p>
        <Term id="backtest" /> คือการถามว่า "ถ้าใช้กฎนี้ในอดีต จะเกิดอะไรขึ้น" ใช้ทดสอบไอเดียก่อนเสี่ยงเงินจริง ในเครื่องมือนี้คุณเลือกได้ทั้ง 6
        กลยุทธ์ ปรับพารามิเตอร์ stop loss การคุมขนาด และต้นทุน
      </p>

      <h2>อ่านผล Backtest อย่างไร</h2>
      <table>
        <thead>
          <tr>
            <th>ตัวชี้วัด</th>
            <th>ดูอะไร</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ผลตอบแทนรวม vs Buy & Hold</td>
            <td>กลยุทธ์ดีกว่าการซื้อแล้วถือเฉยๆ หรือไม่ (หลังหักต้นทุน)</td>
          </tr>
          <tr>
            <td>Max Drawdown</td>
            <td>เจ็บที่สุดเท่าไร คุณทนได้จริงไหม</td>
          </tr>
          <tr>
            <td><Term id="profit-factor" /></td>
            <td>มากกว่า 1.5 ถือว่าน่าสนใจ ต่ำกว่า 1 = ขาดทุน</td>
          </tr>
          <tr>
            <td>จำนวนเทรด</td>
            <td>น้อยกว่า 30 ไม้ = ผลอาจเป็นเรื่องบังเอิญ</td>
          </tr>
          <tr>
            <td>Exposure</td>
            <td>% เวลาที่มีสถานะ ผลตอบแทนใกล้ buy & hold ด้วย exposure 40% = ใช้เงินมีประสิทธิภาพกว่า</td>
          </tr>
        </tbody>
      </table>

      <Playground title="Backtest Playground" hint="ทดลองทุกกลยุทธ์ แล้วเปิดแท็บ Monte Carlo เพื่อดูว่า drawdown แย่ได้แค่ไหนถ้าลำดับการแพ้/ชนะต่างไป">
        <BacktestPlayground />
      </Playground>

      <h2>Monte Carlo: ลำดับก็สำคัญ</h2>
      <p>
        Backtest ให้ผลลัพธ์เพียงเส้นทางเดียวจากลำดับเทรดที่เกิดขึ้น แต่ในอนาคต ไม้ที่แพ้อาจมาติดกันมากกว่า Monte Carlo สลับลำดับเทรดเดิมหลายร้อยรอบ
        เพื่อดูการกระจายของ drawdown ที่เป็นไปได้ ใช้ค่า Max DD ที่ <strong>percentile 95</strong> เป็นตัวเลขที่ควรเตรียมใจรับ
      </p>

      <Callout type="tip" title="แบบฝึกหัด">
        <p>
          1) ตั้ง MA Crossover แล้วเปลี่ยน sizing จาก "ใช้เงินทั้งหมด" เป็น "เสี่ยง 1% ต่อไม้" ดูว่า drawdown และผลตอบแทนเปลี่ยนอย่างไร
          <br />
          2) เพิ่มค่าคอมเป็น $10 และ slippage 0.3% ดูว่ากลยุทธ์ที่เทรดถี่ได้รับผลกระทบแค่ไหน
          <br />
          3) กด "สุ่มใหม่" หลายครั้งโดยไม่เปลี่ยนพารามิเตอร์ ผลลัพธ์คงเส้นคงวาไหม?
        </p>
      </Callout>
    </>
  );
}

function Pitfalls() {
  return (
    <>
      <p>Backtest ที่ดูดีมากๆ มักเป็นสัญญาณอันตราย ไม่ใช่ข่าวดี เพราะมีหลายวิธีที่ backtest หลอกเราได้โดยไม่รู้ตัว</p>

      <h2>หลุมพรางที่พบบ่อย</h2>
      <table>
        <thead>
          <tr>
            <th>ปัญหา</th>
            <th>คืออะไร</th>
            <th>ป้องกันอย่างไร</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Term id="overfitting" /></td>
            <td>ปรับพารามิเตอร์จนเข้ากับอดีตพอดี จับ noise แทน pattern</td>
            <td>ใช้พารามิเตอร์น้อย ทดสอบ out-of-sample ดูว่าค่าใกล้เคียงให้ผลใกล้กันไหม</td>
          </tr>
          <tr>
            <td><Term id="look-ahead" /></td>
            <td>ใช้ข้อมูลที่ยังไม่เกิดขึ้น เช่น ซื้อที่ราคาปิดของแท่งที่ใช้คำนวณสัญญาณ</td>
            <td>ส่งคำสั่งที่ราคาเปิดแท่งถัดไป (เครื่องมือนี้ทำแบบนั้น)</td>
          </tr>
          <tr>
            <td><Term id="survivorship" /></td>
            <td>ทดสอบเฉพาะหุ้นที่ยังอยู่ ไม่รวมหุ้นที่ล้มละลาย/ถูกถอด</td>
            <td>ใช้ข้อมูลที่รวมหุ้นที่ถูกถอดออกจากตลาด</td>
          </tr>
          <tr>
            <td>ลืมต้นทุน</td>
            <td>ไม่รวมค่าคอม spread slippage</td>
            <td>ใส่ต้นทุนแบบอนุรักษ์นิยม (สูงกว่าจริงเล็กน้อย)</td>
          </tr>
          <tr>
            <td>ตัวอย่างน้อย</td>
            <td>สรุปจาก 10–20 เทรด</td>
            <td>ต้องการ 30–100+ เทรด ในหลายสภาพตลาด</td>
          </tr>
          <tr>
            <td>Regime change</td>
            <td>ตลาดเปลี่ยนพฤติกรรม กลยุทธ์ที่เคยได้ผลหยุดทำงาน</td>
            <td>ทดสอบหลายช่วงเวลา ติดตามผลจริงเทียบกับ backtest</td>
          </tr>
        </tbody>
      </table>

      <Playground title="ทดลอง Overfitting" hint="หาคู่ EMA ที่ดีที่สุดในข้อมูลชุดแรก แล้วดูว่าคู่นั้นยังดีที่สุดบนข้อมูลชุดใหม่หรือไม่ ลองหลายชุด">
        <OverfitDemo />
      </Playground>

      <Callout type="warn" title="สิ่งที่ควรสังเกต">
        <p>
          คู่ที่ "ดีที่สุด" ในอดีตมักไม่ใช่คู่ที่ดีที่สุดในอนาคต และบางครั้งแย่กว่าค่ากลางด้วยซ้ำ กลยุทธ์ที่แข็งแรงคือกลยุทธ์ที่<strong>หลายค่า
          รอบๆ ให้ผลดีพอๆ กัน</strong> (heatmap เป็นสีเขียวเป็นพื้นที่กว้าง) ไม่ใช่มีจุดเดียวที่ดีโดดเด่น
        </p>
      </Callout>

      <h2>ขั้นตอนจาก Backtest สู่เงินจริง</h2>
      <ol>
        <li>Backtest บนข้อมูลส่วนหนึ่ง (in-sample) ด้วยกฎที่เรียบง่าย</li>
        <li>ทดสอบบนข้อมูลที่ไม่เคยเห็น (out-of-sample) ผลต้องไม่แย่ลงมาก</li>
        <li>Paper trade อย่างน้อย 1–3 เดือน เทียบผลจริงกับ backtest</li>
        <li>เริ่มเงินจริงขนาดเล็ก บันทึก journal (โมดูล 7)</li>
        <li>เพิ่มขนาดเมื่อผลจริงสอดคล้องกับที่คาด และหยุดเมื่อ drawdown เกินที่ Monte Carlo คาดการณ์</li>
      </ol>
    </>
  );
}

export const MODULE4_LESSONS: Lesson[] = [
  {
    id: 'trend-following',
    title: 'Trend Following และ Momentum',
    summary: 'ตามเทรนด์ด้วย MA Crossover และ Rate of Change',
    minutes: 9,
    Body: TrendFollowing,
    quiz: [
      {
        q: 'ลักษณะทั่วไปของระบบ Trend Following คืออะไร?',
        choices: ['Win rate สูง กำไรต่อไม้เล็ก', 'Win rate ต่ำ แต่ไม้ที่ชนะกำไรใหญ่', 'ไม่เคยขาดทุน', 'ใช้ได้เฉพาะตลาด sideway'],
        answer: 1,
        explain: 'Trend following แพ้บ่อยจาก whipsaw แต่จับเทรนด์ใหญ่ได้ทำให้ expectancy เป็นบวก',
      },
      {
        q: 'Golden Cross คืออะไร?',
        choices: ['ราคาทองคำขึ้น', 'MA เร็วตัดขึ้นเหนือ MA ช้า', 'RSI เกิน 70', 'ราคาทะลุ Bollinger Band บน'],
        answer: 1,
        explain: 'Golden Cross เป็นสัญญาณเริ่มขาขึ้นในระบบ MA Crossover',
      },
      {
        q: 'Whipsaw มักเกิดในตลาดแบบใด?',
        choices: ['เทรนด์ขาขึ้นแรง', 'Sideway', 'ตลาดปิด', 'ขาลงแรง'],
        answer: 1,
        explain: 'ในตลาด sideway เส้นค่าเฉลี่ยตัดกันไปมา ทำให้เข้าออกบ่อยและขาดทุนเล็กๆ ซ้ำๆ',
      },
    ],
  },
  {
    id: 'breakout-pullback',
    title: 'Breakout และ Pullback',
    summary: 'Donchian Channel (Turtle) vs เข้าตอนย่อในขาขึ้น',
    minutes: 8,
    Body: BreakoutPullback,
    quiz: [
      {
        q: 'ข้อดีของการเข้าแบบ Pullback เทียบกับ Breakout คืออะไร?',
        choices: ['ไม่พลาดการวิ่งแรงเลย', 'ได้ราคาดีกว่าและวาง stop ได้แคบกว่า', 'ไม่ต้องมี stop', 'ไม่ต้องดูเทรนด์'],
        answer: 1,
        explain: 'Pullback เข้าใกล้แนวรับ ทำให้ stop ใกล้และ R:R ดีกว่า แต่อาจพลาดถ้าราคาไม่ย่อ',
      },
      {
        q: 'ระบบ Donchian Breakout เข้าซื้อเมื่อใด?',
        choices: ['RSI ต่ำกว่า 30', 'ราคาปิดทะลุ High สูงสุดของ N แท่งก่อนหน้า', 'ราคาแตะ SMA 200', 'มีข่าวดี'],
        answer: 1,
        explain: 'Donchian ใช้ช่องราคาสูงสุด/ต่ำสุดของ N แท่ง ทะลุขึ้นคือสัญญาณเข้า',
      },
    ],
  },
  {
    id: 'mean-reversion',
    title: 'Mean Reversion และ Range Trading',
    summary: 'RSI และ Bollinger Band reversion + เลือกกลยุทธ์ตามสภาพตลาด',
    minutes: 9,
    Body: MeanReversion,
    quiz: [
      {
        q: 'Mean Reversion ทำงานได้ดีที่สุดในตลาดแบบใด?',
        choices: ['ขาลงแรง', 'Sideway / แกว่งในกรอบ', 'ขาขึ้นแรง', 'ทุกตลาดเท่ากัน'],
        answer: 1,
        explain: 'ในตลาด sideway ราคามักกลับสู่ค่าเฉลี่ย ส่วนในเทรนด์แรงการซื้อสวนเทรนด์เสี่ยงมาก',
      },
      {
        q: 'ความเสี่ยงหลักของ Mean Reversion โดยไม่มี stop คืออะไร?',
        choices: ['กำไรน้อยเกินไป', 'ซื้อ Oversold แล้วราคาลงต่อเรื่อยๆ ในขาลงแรง', 'เทรดน้อยเกินไป', 'ไม่มีความเสี่ยง'],
        answer: 1,
        explain: '"ถูกแล้วยังถูกได้อีก" ในขาลงแรง ต้องมี stop หรือ trend filter',
      },
      {
        q: 'กลยุทธ์ Options ใดใช้แนวคิดคล้าย Mean Reversion?',
        choices: ['Long Straddle', 'Iron Condor', 'Long Call', 'Protective Put'],
        answer: 1,
        explain: 'Iron Condor ได้กำไรเมื่อราคาอยู่ในกรอบ เหมือนการเดิมพันว่าราคาจะไม่หนีค่าเฉลี่ยไปไกล',
      },
    ],
  },
  {
    id: 'backtest-playground',
    title: 'Backtest Playground และ Monte Carlo',
    summary: 'ทดสอบ 6 กลยุทธ์ อ่านผล และจำลองลำดับเทรดหลายร้อยรอบ',
    minutes: 15,
    Body: Playground4,
    quiz: [
      {
        q: 'Profit Factor 0.8 หมายความว่าอย่างไร?',
        choices: ['กำไร 80%', 'ขาดทุนรวมมากกว่ากำไรรวม (ระบบขาดทุน)', 'Win rate 80%', 'ดีกว่า buy & hold'],
        answer: 1,
        explain: 'Profit Factor = กำไรรวม ÷ ขาดทุนรวม ต่ำกว่า 1 = ขาดทุนสุทธิ',
      },
      {
        q: 'Monte Carlo ในบทนี้ช่วยตอบคำถามใด?',
        choices: ['พารามิเตอร์ที่ดีที่สุดคืออะไร', 'Drawdown อาจแย่แค่ไหนถ้าลำดับแพ้/ชนะต่างไป', 'หุ้นตัวไหนจะขึ้น', 'ควรใช้ indicator อะไร'],
        answer: 1,
        explain: 'สลับลำดับเทรดเดิมเพื่อดูการกระจายของ drawdown ที่เป็นไปได้',
      },
      {
        q: 'ทำไมเครื่องมือนี้ส่งคำสั่งที่ราคาเปิดแท่งถัดไป แทนราคาปิดของแท่งที่เกิดสัญญาณ?',
        choices: ['เพื่อให้ผลดีขึ้น', 'เพื่อหลีกเลี่ยง look-ahead bias เพราะรู้สัญญาณหลังราคาปิดเท่านั้น', 'เพราะตลาดปิด', 'ไม่มีเหตุผล'],
        answer: 1,
        explain: 'สัญญาณคำนวณจากราคาปิด จึงส่งคำสั่งได้เร็วที่สุดคือแท่งถัดไป',
      },
    ],
  },
  {
    id: 'backtest-pitfalls',
    title: 'หลุมพรางของ Backtest',
    summary: 'Overfitting, Look-ahead, Survivorship bias และการทดสอบ Out-of-Sample',
    minutes: 9,
    Body: Pitfalls,
    quiz: [
      {
        q: 'Overfitting คืออะไร?',
        choices: ['การเทรดบ่อยเกินไป', 'การปรับพารามิเตอร์ให้เข้ากับข้อมูลอดีตมากเกินไปจนใช้กับข้อมูลใหม่ไม่ได้', 'การใช้ leverage สูง', 'การถือนานเกินไป'],
        answer: 1,
        explain: 'กลยุทธ์ที่ overfit จับ noise ในอดีต จึงไม่ทำงานกับข้อมูลใหม่',
      },
      {
        q: 'Backtest เฉพาะหุ้นที่อยู่ใน S&P 500 ปัจจุบันย้อนหลัง 20 ปี มีปัญหาอะไร?',
        choices: ['Look-ahead bias', 'Survivorship bias', 'ไม่มีปัญหา', 'Overtrading'],
        answer: 1,
        explain: 'หุ้นที่ล้มหรือถูกถอดออกไปไม่อยู่ในรายชื่อ ผลจึงดูดีเกินจริง',
      },
      {
        q: 'ลักษณะของกลยุทธ์ที่แข็งแรง (robust) คืออะไร?',
        choices: ['มีพารามิเตอร์เดียวที่ให้ผลดีมาก', 'หลายค่าพารามิเตอร์รอบๆ ให้ผลดีพอๆ กัน และใช้ได้กับข้อมูลใหม่', 'กำไรทุกเดือน', 'ใช้ indicator มากที่สุด'],
        answer: 1,
        explain: 'ถ้าผลดีเฉพาะค่าเดียว มักเป็นความบังเอิญ กลยุทธ์ที่ดีต้องไม่อ่อนไหวต่อพารามิเตอร์มาก',
      },
    ],
  },
];
