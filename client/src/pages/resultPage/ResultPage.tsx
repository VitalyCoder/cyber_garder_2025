import { useLocation, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/entities/wishlist/model/store';
import { Button } from '@/shared/ui/Button';
import styles from './ResultPage.module.css';
import clsx from 'clsx';

export const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const addItem = useWishlistStore(s => s.addItem);

  // валидация   
  if (!state?.result || !state?.product) {
    return <div className="p-10 text-center">Ошибка: Данные не найдены</div>;
  }

  const { result, product } = state;
  const isBlocked = result.status === 'BLOCKED';

  const handleSave = () => {
    addItem({
      id: Date.now().toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      status: result.status,
      unlockDate: result.unlockDate,
      aiAdvice: result.aiAdvice
    });
    navigate('/profile');
  };

  return (
    <div className={clsx(styles.container, isBlocked ? 'bg-red-50' : 'bg-blue-50')}>
      <div className={styles.card}>
        <span className={styles.emoji}>{isBlocked ? '⛔' : '🧊'}</span>
        
        <h1 className={clsx(styles.title, isBlocked ? 'text-red-600' : 'text-blue-600')}>
          {isBlocked ? 'Покупка Заблокирована' : `Охлаждение: ${result.daysToWait} день`}
        </h1>

        <div className={styles.adviceBox}>
          <p className={styles.adviceTitle}>Совет ИИ:</p>
          <p className={styles.adviceText}>"{result.aiAdvice}"</p>
        </div>

        {!isBlocked && (
           <div className={styles.dateBox}>
             <p className="text-gray-500">Разблокировка:</p>
             <p className="font-mono font-bold text-lg">
               {new Date(result.unlockDate).toLocaleDateString()}
             </p>
           </div>
        )}

        <div className={styles.buttons}>
          <Button variant="secondary" onClick={() => navigate('/check')}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isBlocked ? 'Понял, не беру' : 'В Wishlist'}
          </Button>
        </div>
      </div>
    </div>
  );
};