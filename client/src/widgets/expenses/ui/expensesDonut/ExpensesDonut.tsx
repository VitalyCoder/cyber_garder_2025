import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './ExpensesDonut.module.css';

//  как на скриншоте (заглушка для визуализации)
const data = [
  { name: 'Фастфуд', value: 9789, color: '#F97316' }, // Оранжевый
  { name: 'Супермаркеты', value: 4829, color: '#F43F5E' }, // Розовый
  { name: 'Рестораны', value: 2339, color: '#EC4899' }, // Фуксия
  { name: 'Одежда', value: 899, color: '#8B5CF6' }, // Фиолетовый
  { name: 'Остальное', value: 2740, color: '#94A3B8' }, // Серый
];

export const ExpensesDonut = () => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className={styles.container}>
      {/* График */}
      <div className="w-64 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={80} // Делаем "дырку" внутри (Бублик)
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={8} // Скругленные края сегментов
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Текст по центру */}
        <div className={styles.centerText}>
          <div className={styles.totalAmount}>{total.toLocaleString()} ₽</div>
          <div className={styles.label}>Траты</div>
        </div>
      </div>

      {/* Легенда снизу (Категории) */}
      <div className={styles.legend}>
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className={styles.legendItem}>
            <div className={styles.dot} style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-700">{item.name}</span>
               <span className="text-xs text-gray-500">{item.value} ₽</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};