import { useState } from 'react';
import styles from './Step3Cooling.module.css';
import type { AddCoolingRangeDto } from '@/shared/api/api';

interface Props {
  ranges: AddCoolingRangeDto[];
  onChange: (ranges: AddCoolingRangeDto[]) => void;
  onBack: () => void;
  onFinish: () => void;
}

export const Step3Cooling = ({ ranges, onChange, onBack, onFinish }: Props) => {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [days, setDays] = useState('');

  const addRange = () => {
    const minVal = Number(min);
    const maxVal = max.trim() ? Number(max) : null;
    const daysVal = Number(days);

    if (Number.isNaN(minVal) || Number.isNaN(daysVal)) return;
    
    if (maxVal !== null && minVal >= maxVal) {
        alert("Мин. цена должна быть меньше макс.");
        return;
    }

    onChange([...ranges, { 
        min: minVal, 
        max: maxVal, 
        days: daysVal 
    }]);
    
    setMin('');
    setMax('');
    setDays('');
  };

  const removeRange = (index: number) => {
    const newRanges = [...ranges];
    newRanges.splice(index, 1);
    onChange(newRanges);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">❄️ Правила охлаждения</h2>
        <p className="text-sm text-gray-500 mt-1">
          Настрой, сколько дней ждать перед покупкой в зависимости от цены.
        </p>
      </div>
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-3 gap-2 mb-3">
            <input 
                type="number" 
                placeholder="От (₽)" 
                className={styles.input}
                value={min}
                onChange={e => setMin(e.target.value)}
            />
            <input 
                type="number" 
                placeholder="До (₽)" 
                className={styles.input}
                value={max}
                onChange={e => setMax(e.target.value)}
            />
            <input 
                type="number" 
                placeholder="Дней" 
                className={styles.input}
                value={days}
                onChange={e => setDays(e.target.value)}
            />
        </div>
        <button 
            onClick={addRange} 
            disabled={!min || !days}
            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
            + Добавить правило
        </button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {ranges.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Список пуст. Добавь хотя бы одно правило.</p>
        ) : (
            ranges.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="font-mono text-sm font-bold text-gray-800">
                        {r.min.toLocaleString()} — {r.max != null ? r.max.toLocaleString() : '∞'} ₽
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg font-bold">
                            {r.days} дн.
                        </span>
                        <button onClick={() => removeRange(idx)} className="text-gray-400 hover:text-red-500">
                            ✕
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Назад
        </button>
        <button onClick={onFinish} className="flex-[2] py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg active:scale-95 transition-all">
            Завершить ✅
        </button>
      </div>
    </div>
  );
};