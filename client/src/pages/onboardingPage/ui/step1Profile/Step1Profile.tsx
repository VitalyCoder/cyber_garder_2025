import type { User } from '@/types';
import styles from './Step1Profile.module.css';

interface Props {
  formData: Partial<User>;
  onChange: (updates: Partial<User>) => void;
  onNext: () => void;
}

export const Step1Profile = ({ formData, onChange, onNext }: Props) => {
  const isValid = 
    (formData.nickname?.length || 0) >= 3 && 
    (formData.monthlyIncome || 0) > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>📊 Твой профиль</h2>
        <p className={styles.subtitle}>Чтобы ИИ давал точные советы</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Никнейм <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Например: Ivan"
            value={formData.nickname || ''}
            onChange={(e) => onChange({ nickname: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Месячный доход (₽) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={styles.input}
            placeholder="100000"
            value={formData.monthlyIncome || ''}
            onChange={(e) => onChange({ monthlyIncome: Number(e.target.value) })}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Откладываю (₽)</label>
            <input
              type="number"
              className={styles.input}
              placeholder="10000"
              value={formData.monthlySavings || ''}
              onChange={(e) => onChange({ monthlySavings: Number(e.target.value) })}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Сейчас есть (₽)</label>
            <input
              type="number"
              className={styles.input}
              placeholder="50000"
              value={formData.currentSavings || ''}
              onChange={(e) => onChange({ currentSavings: Number(e.target.value) })}
            />
          </div>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={formData.useSavings || false}
            onChange={(e) => onChange({ useSavings: e.target.checked })}
          />
          <span className="text-sm font-medium">Учитывать накопления при расчете</span>
        </label>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={`${styles.button} ${isValid ? styles.buttonActive : styles.buttonDisabled}`}
      >
        Далее →
      </button>
    </div>
  );
};