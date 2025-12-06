import { useWishlistStore } from '@/entities/wishlist/model/store'
import { useUserStore } from '@/store/userStore'
import { useEffect } from 'react'
import styles from './Wishlist.module.css'

export const Wishlist = () => {
  const user = useUserStore((s) => s.user);
  const { items, fetchItems, isLoading, deleteItem, buyItem } = useWishlistStore();

  useEffect(() => {
    if (user) {
      fetchItems(user.id);
    }
  }, [fetchItems, user]);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);

  const handleDelete = async (id: string) => {
    if (user && confirm('Удалить из списка?')) {
        await deleteItem(user.id, id);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBuy = async (item: any) => {
    if (!user) return;
    if (confirm(`Ура! Покупаем "${item.productName}"?`)) {
        await buyItem(user.id, item);
    }
  };

  if (isLoading && items.length === 0) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-2">📭</p>
        <p>Список желаний пуст</p>
        <p className="text-sm">Нажми "+" чтобы добавить первую хотелку</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {items.map((item) => {
        const isReady = !item.unlockDate || new Date(item.unlockDate) <= new Date();

        return (
            <div key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.category}>{item.category}</span>
                <span className={styles.price}>{formatPrice(item.price)}</span>
            </div>
            <h3 className={styles.name}>{item.productName}</h3>
            
            <div className={styles.footer}>
                <StatusBadge item={item} isReady={isReady} />

                <div className="flex gap-2 items-center">
                    {isReady && (
                        <button 
                            onClick={() => handleBuy(item)}
                            className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all"
                        >
                            Купить
                        </button>
                    )}

                    <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 text-lg leading-none px-2"
                        title="Удалить"
                    >
                        🗑
                    </button>
                </div>
            </div>
            </div>
        );
      })}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatusBadge = ({ item, isReady }: { item: any, isReady: boolean }) => {
    if (item.status === 'BLOCKED') {
        return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold">⛔ ЗАПРЕТ</span>;
    }

    if (isReady) {
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">✅ ГОТОВО</span>;
    }
    
    const dateStr = new Date(item.unlockDate).toLocaleDateString();
    return (
        <div className="flex flex-col">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold text-center w-max">❄️ ЖДЕМ</span>
            <span className="text-[10px] text-gray-400 mt-1">До: {dateStr}</span>
        </div>
    );
};
