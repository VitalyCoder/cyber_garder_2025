import { CATEGORIES, type User } from '@/types';
import styles from './Step2Settings.module.css';

interface Props {
  formData: Partial<User>;
  onChange: (updates: Partial<User>) => void;
  onBack: () => void;
  onFinish: () => void;
}

export const Step2Settings = ({ formData, onChange, onBack, onFinish }: Props) => {
  const selected = formData.blacklistedCategories || [];

  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      onChange({ blacklistedCategories: selected.filter(c => c !== cat) });
    } else {
      onChange({ blacklistedCategories: [...selected, cat] });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>⛔ Черный список</h2>
        <p className={styles.subtitle}>Категории, где ты часто тратишь лишнее</p>
      </div>

      <div className={styles.categoriesGrid }>
        {CATEGORIES.map((cat) => {
          const isActive = selected.includes(cat);
          return (
            <div 
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`${styles.categoryCard} ${isActive ? styles.active : styles.inactive}`}
            >
              <span>{cat}</span>
              {isActive && <span>✕</span>}
            </div>
          );
        })}
      </div>

      <div className={styles.infoBox}>
        <p>ℹ️ Для этих категорий ИИ будет включать "Жесткий режим" блокировки.</p>
      </div>

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.backButton}>
          ← Назад
        </button>
        <button onClick={onFinish} className={styles.finishButton}>
          Далее →
        </button>
      </div>
    </div>
  );
};