import { useState } from 'react';
import styles from './ProductInput.module.css';
import { CATEGORIES } from '@/types';
import { Button } from '@/shared/ui/Button';

interface ProductData {
  product_name: string;
  price: number;
  category: string;
}

interface Props {
  onSubmit: (data: ProductData) => void;
  isLoading: boolean;
}

export const ProductInput = ({ onSubmit, isLoading }: Props) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    onSubmit({
      product_name: form.name,
      price: Number(form.price),
      category: form.category
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div>
        <label className={styles.label}>Что хочешь купить?</label>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Например: MacBook Pro"
          className={styles.input}
          required
        />
      </div>

      <div>
        <label className={styles.label}>Цена (₽)</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          placeholder="150000"
          className={styles.input}
          required
        />
      </div>

      <div>
        <label className={styles.label}>Категория</label>
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className={styles.select}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Анализируем...' : '⚡ Проверить'}
      </Button>
    </form>
  );
};