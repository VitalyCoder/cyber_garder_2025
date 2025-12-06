import { Trash2, ShoppingBag } from 'lucide-react';
import styles from './WishlistList.module.css';
import { useWishlistStore } from '@/entities/wishlist/model/store';
import { Button } from '@/shared/ui/Button';

export const WishlistList = () => {
  const { items, removeItem, updateStatus } = useWishlistStore();
  
  // активные (не купленные и не удаленные)
  const activeItems = items.filter(i => i.status === 'COOLING' || i.status === 'READY' || i.status === 'BLOCKED');

  if (activeItems.length === 0) {
    return <div className={styles.empty}>Вишлист пуст. Ты дзен-мастер!</div>;
  }

  return (
    <div className={styles.list}>
      {activeItems.map(item => {
        const isBlocked = item.status === 'BLOCKED';
        const isReady = !isBlocked && new Date() >= new Date(item.unlockDate);
        
        // считаю  дни
        const daysLeft = Math.ceil((new Date(item.unlockDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        
        let badgeClass = "bg-blue-100 text-blue-700";
        let badgeText = `Ждать ${daysLeft} дн.`;
        
        if (isBlocked) {
          badgeClass = "bg-red-100 text-red-700";
          badgeText = "ЗАБЛОКИРОВАНО";
        } else if (isReady) {
          badgeClass = "bg-green-100 text-green-700";
          badgeText = "ГОТОВО!";
        }

        return (
          <div key={item.id} className={styles.card}>
            <div className={styles.header}>
              <div>
                <h3 className={styles.title}>{item.name}</h3>
                <p className={styles.price}>{item.price.toLocaleString()} ₽</p>
              </div>
              <span className={`${styles.badge} ${badgeClass}`}>
                {badgeText}
              </span>
            </div>
            
            <p className={styles.advice}>💡 {item.aiAdvice}</p>

            <div className={styles.actions}>
              {!isBlocked && (
                <Button 
                  variant="primary" 
                  className="bg-green-600 hover:bg-green-700 py-2 text-sm"
                  onClick={() => updateStatus(item.id, 'BOUGHT')}
                  disabled={!isReady}
                >
                  <ShoppingBag size={16} /> Купил
                </Button>
              )}
              
              <Button 
                variant="danger" 
                className="py-2 px-3"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};