import { useState } from 'react';
import styles from './CheckForm.module.css';
import { CATEGORIES } from '@/types';
import { Button } from '@/shared/ui/Button';

//  запрос на сервер с сссылкой виталика  
// const handleCheck = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   try {
//     const response = await fetch('http://localhost:8000/api/check', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         product_name: data.name,
//         price: Number(data.price),
//         category: data.category,
//         user_id: 1 // Или никнейм
//       })
//     });

//     // Получаем ответ от ИИ
//     const result = await response.json(); 
    
//     // Переходим
//     navigate('/result', { state: { result, product: { ... } } });

//   } catch (error) {
//     alert("Ошибка соединения с сервером");
//   }
// };

interface Props {
  onSubmit?: (data: { name: string; price: string; category: string }) => void;
}

export const CheckForm = ({ onSubmit }: Props) => {
  const [data, setData] = useState({ name: '', price: '', category: CATEGORIES[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log("No submit handler provided");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
       <div>
        <label className={styles.label}>Что хочешь купить?</label>
        <input 
          required
          placeholder="Например: MacBook Pro" 
          className={styles.input}
          value={data.name}
          onChange={e => setData({...data, name: e.target.value})}
        />
      </div>

      <div>
        <label className={styles.label}>Цена (₽)</label>
        <input 
          required type="number"
          placeholder="150000" 
          className={styles.input}
          value={data.price}
          onChange={e => setData({...data, price: e.target.value})}
        />
      </div>

      <div>
        <label className={styles.label}>Категория</label>
        <select 
          className={styles.select}
          value={data.category}
          onChange={e => setData({...data, category: e.target.value})}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Button type="submit" variant="primary">
        Анализ
      </Button>
    </form>
  );
};