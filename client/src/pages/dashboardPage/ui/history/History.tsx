import { useEffect, useState } from 'react';
import { historyApi, type HistoryEntity } from '@/shared/api/api'; // Проверь имя файла (api.ts или client.ts)
import { useUserStore } from '@/store/userStore';
import styles from './History.module.css';

export const History = () => {
  const user = useUserStore((s) => s.user);
  
  const [items, setItems] = useState<HistoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await historyApi.list(user.id);
        // Сортируем: новые сверху
        const sorted = data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setItems(sorted);
      } catch (e) {
        console.error("Не удалось загрузить историю", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  if (isLoading) {
      return <div className="text-center py-10 text-gray-400">Загрузка истории...</div>;
  }

  if (items.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-2">📜</p>
            <p>История пуста</p>
            <p className="text-sm">Здесь будут отображаться твои покупки</p>
        </div>
      );
  }

  return (
    <div className={styles.container}>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <div className={styles.icon}>
            {getActionIcon(item.action)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.productName || 'Товар без названия'}</p>
            <p className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()} — {getActionLabel(item.action)}
            </p>
          </div>
          
          <div className="font-mono text-sm font-bold whitespace-nowrap">
            {item.price ? `${item.price.toLocaleString()} ₽` : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

const getActionIcon = (action: string) => {
    switch (action) {
        case 'bought': return '✅';
        case 'cancelled': return '❌'; 
        case 'removed': return '🗑';
        default: return 'ℹ️';
    }
};

const getActionLabel = (action: string) => {
    switch (action) {
        case 'bought': return 'Куплено';
        case 'cancelled': return 'Отменено';
        case 'removed': return 'Удалено';
        default: return 'Действие';
    }
};