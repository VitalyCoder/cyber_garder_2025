import { useState } from 'react';
import styles from './ProductInput.module.css';
import { CATEGORIES } from '@/types'; 
import { Button } from '@/shared/ui/Button';

export interface ProductData {
  product_name?: string;
  price?: number;
  category?: string;
  product_url?: string;
}

interface Props {
  onSubmit: (data: ProductData) => void;
  isLoading: boolean;
}

export const ProductInput = ({ onSubmit, isLoading }: Props) => {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0] || 'Другое' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUrlMode) {
      if (!productUrl) return;
      onSubmit({
        product_url: productUrl
      });
    } else {
      if (!form.name || !form.price) return;
      onSubmit({
        product_name: form.name,
        price: Number(form.price),
        category: form.category
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
        <input
          id="url-mode"
          type="checkbox"
          checked={isUrlMode}
          onChange={(e) => setIsUrlMode(e.target.checked)}
          className="w-5 h-5 cursor-pointer accent-black"
        />
        <label htmlFor="url-mode" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
          Вставить ссылку на товар 
        </label>
      </div>

      {isUrlMode ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className={styles.label}>Ссылка на товар</label>
          <input
            type="url"
            value={productUrl}
            onChange={e => setProductUrl(e.target.value)}
            placeholder="https://market.yandex.ru/..."
            className={styles.input}
            required={isUrlMode} 
          />
          <p className="text-xs text-gray-400 mt-2">
            Мы попробуем автоматически определить название, цену и категорию.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className={styles.label}>Что хочешь купить?</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Например: MacBook Pro"
              className={styles.input}
              required={!isUrlMode}
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
              required={!isUrlMode}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Анализируем...' : isUrlMode ? '🔍 Сканировать ссылку' : '⚡ Проверить'}
        </Button>
      </div>
    </form>
  );
};