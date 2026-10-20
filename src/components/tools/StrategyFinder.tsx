import { useState } from 'react';
import { OUTLOOK_LABEL, STRATEGIES, type IvView, type Outlook } from '../../data/strategies';
import { Segmented } from '../ui';
import { StrategyCard } from './StrategyCard';

type RiskPref = 'defined' | 'any';

export function StrategyFinder() {
  const [outlook, setOutlook] = useState<Outlook>('bullish');
  const [iv, setIv] = useState<IvView>('any');
  const [risk, setRisk] = useState<RiskPref>('defined');

  const matches = STRATEGIES.filter(
    (s) =>
      s.outlook === outlook &&
      (iv === 'any' || s.ivView === iv || s.ivView === 'any') &&
      (risk === 'any' || s.definedRisk),
  );

  return (
    <div>
      <div className="space-y-4 rounded-xl bg-white p-4 dark:bg-slate-950/60">
        <div>
          <div className="mb-1.5 text-sm font-medium">1. คุณคิดว่าราคาหุ้นจะไปทางไหน?</div>
          <Segmented
            value={outlook}
            onChange={setOutlook}
            options={(Object.keys(OUTLOOK_LABEL) as Outlook[]).map((o) => ({ value: o, label: OUTLOOK_LABEL[o] }))}
          />
        </div>
        <div>
          <div className="mb-1.5 text-sm font-medium">2. IV ตอนนี้เป็นอย่างไร?</div>
          <Segmented
            value={iv}
            onChange={setIv}
            options={[
              { value: 'any', label: 'ไม่แน่ใจ / ไม่สนใจ' },
              { value: 'high', label: 'IV สูง (option แพง → เน้นขาย)' },
              { value: 'low', label: 'IV ต่ำ (option ถูก → เน้นซื้อ)' },
            ]}
          />
        </div>
        <div>
          <div className="mb-1.5 text-sm font-medium">3. รับความเสี่ยงแบบไหนได้?</div>
          <Segmented
            value={risk}
            onChange={setRisk}
            options={[
              { value: 'defined', label: 'ต้องรู้ขาดทุนสูงสุดล่วงหน้า' },
              { value: 'any', label: 'รับความเสี่ยงไม่จำกัดได้' },
            ]}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        พบ <strong className="text-slate-900 dark:text-white">{matches.length}</strong> กลยุทธ์ที่เหมาะ
      </p>
      {matches.length === 0 ? (
        <p className="mt-3 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800/60">
          ไม่มีกลยุทธ์ที่ตรงทุกเงื่อนไข ลองเปลี่ยนมุมมอง IV เป็น "ไม่แน่ใจ" หรือยอมรับความเสี่ยงไม่จำกัด
        </p>
      ) : (
        matches.map((s) => <StrategyCard key={s.id} id={s.id} />)
      )}
    </div>
  );
}
