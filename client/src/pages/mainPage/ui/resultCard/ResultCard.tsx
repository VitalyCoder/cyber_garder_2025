import clsx from 'clsx';
import styles from './ResultCard.module.css';
import type { CheckResult } from '@/entities/product/lib/cooling-logic';
import { Button } from '@/shared/ui/Button';

interface Props {
  result: CheckResult;
  productName: string;
  price: number;
  onReset: () => void;
  onSave: () => void;
}

export const ResultCard = ({ result, productName, onReset, onSave }: Props) => {
  const { status, daysToWait, aiAdvice, unlockDate } = result;

  if (status === 'BLACKLIST') {
    return (
      <div className={clsx(styles.card, styles.blocked)}>
        <span className={styles.icon}>⛔</span>
        <h2 className={clsx(styles.title, styles.titleBlocked)}>Покупка Заблокирована</h2>
        <p className={styles.description}>{productName} относится к запрещенным категориям.</p>
        
        <div className={clsx(styles.adviceBox, "border border-red-100")}>
          <p className={clsx(styles.adviceLabel, "text-red-400")}>Совет ИИ:</p>
          <p className={styles.adviceText}>"{aiAdvice}"</p>
        </div>

        <Button variant="secondary" onClick={onReset}>Понятно</Button>
      </div>
    );
  }

  if (status === 'COOLDOWN') {
    const dateStr = new Date(unlockDate).toLocaleDateString();
    
    return (
      <div className={clsx(styles.card, styles.cooling)}>
        <span className={styles.icon}>🧊</span>
        <h2 className={clsx(styles.title, styles.titleCooling)}>Охлаждение: {daysToWait} дн.</h2>
        <p className="text-sm text-blue-400 mb-6 font-mono">Разблокировка: {dateStr}</p>

        <div className={clsx(styles.adviceBox, "border border-blue-100 pl-6")}>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <p className={clsx(styles.adviceLabel, "text-blue-400")}>Анализ бюджета:</p>
          <p className={styles.adviceText}>"{aiAdvice}"</p>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onReset}>Отмена</Button>
          <Button variant="primary" onClick={onSave} className="bg-black text-white">В Wishlist</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.card, styles.approved)}>
      <span className={styles.icon}>✅</span>
      <h2 className={clsx(styles.title, styles.titleApproved)}>Покупка Одобрена!</h2>
      <p className={styles.description}>Бюджет позволяет купить {productName} прямо сейчас.</p>

      <div className={clsx(styles.adviceBox, "border border-green-100")}>
        <p className={clsx(styles.adviceLabel, "text-green-500")}>Вердикт:</p>
        <p className={styles.adviceText}>"{aiAdvice || 'Хороший выбор! Это не ударит по твоему карману.'}"</p>
      </div>

      <div className={styles.actionsVertical}>
        <Button variant="primary" className="bg-green-600 hover:bg-green-700 text-white">
          Купить сейчас
        </Button>
        <button onClick={onSave} className={styles.linkButton}>
          Или сохранить в Wishlist
        </button>
      </div>
    </div>
  );
};