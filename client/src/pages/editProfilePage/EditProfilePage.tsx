import { useUserStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditProfilePage.module.css';

export const EditProfilePage = () => {
    const navigate = useNavigate();
    const user = useUserStore(s => s.user);
    const updateUser = useUserStore(s => s.updateUser);

    const [formData, setFormData] = useState({
        monthlyIncome: 0,
        currentSavings: 0,
        monthlySavings: 0,
        useSavingsCalculation: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                monthlyIncome: user.monthlyIncome ?? 0,
                currentSavings: user.currentSavings ?? 0,
                monthlySavings: user.monthlySavings ?? 0,
                useSavingsCalculation: user.useSavingsCalculation ?? true
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        if (formData.monthlyIncome < 0 || formData.currentSavings < 0) {
            alert("Суммы не могут быть отрицательными");
            return;
        }

        await updateUser(formData);
        navigate('/dashboard'); // Возвращаемся в профиль после сохранения
    };

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    ← Назад
                </button>
            </div>
            <div className={styles.header}>
                <h1 className={styles.title}>✏️ Редактирование</h1>
                <p className={styles.subtitle}>Обнови свои финансовые данные для более точных расчетов ИИ.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Месячный доход (₽)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.monthlyIncome}
                        onChange={e => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Текущие накопления (₽)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.currentSavings}
                        onChange={e => setFormData({ ...formData, currentSavings: Number(e.target.value) })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Откладываю в месяц (₽)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.monthlySavings}
                        onChange={e => setFormData({ ...formData, monthlySavings: Number(e.target.value) })}
                    />
                </div>

                <label className={styles.checkboxRow}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={formData.useSavingsCalculation}
                        onChange={e => setFormData({ ...formData, useSavingsCalculation: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Учитывать накопления при расчете
                    </span>
                </label>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        Сохранить
                    </button>
                    <button className={styles.cancelBtn} onClick={() => navigate('/profile')}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};