import { coolingRangeApi } from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useState } from 'react';
import styles from './CoolingRangesPage.module.css';
import { useNavigate } from 'react-router-dom';

type RangeItem = { id: string; min: number; max: number | null; days: number };

export const CoolingRangesPage = () => {
    const user = useUserStore(s => s.user);
    const navigate = useNavigate()
    const [items, setItems] = useState<RangeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [days, setDays] = useState('');

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await coolingRangeApi.list(user.id);
            const sorted = data.map(d => ({ id: d.id, min: d.min, max: d.max, days: d.days }))
                .sort((a, b) => a.min - b.min);
            setItems(sorted);
        } catch (e) {
            console.error(e);
            setError('Не удалось загрузить правила');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void load();
    }, [load]);

    const add = async () => {
        if (!user) return;
        const minVal = Number(min);
        const maxVal = max.trim() ? Number(max) : null;
        const daysVal = Number(days);

        if (Number.isNaN(minVal) || Number.isNaN(daysVal) || (maxVal !== null && Number.isNaN(maxVal))) {
            alert('Пожалуйста, введите корректные числа');
            return;
        }

        if (maxVal !== null && minVal >= maxVal) {
            alert('Мин. цена должна быть меньше Макс. цены');
            return;
        }

        try {
            await coolingRangeApi.add(user.id, {
                min: minVal,
                max: maxVal,
                days: daysVal,
            });
            setMin('');
            setMax('');
            setDays('');
            await load();
        } catch (e) {
            console.error(e);
            alert('Не удалось добавить правило');
        }
    };

    const remove = async (id: string) => {
        if (!user) return;
        if (!confirm('Удалить этот диапазон?')) return;
        try {
            await coolingRangeApi.remove(user.id, id);
            await load();
        } catch (e) {
            console.error(e);
            alert('Не удалось удалить правило');
        }
    };

    const formatMoney = (val: number) => val.toLocaleString('ru-RU');

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    ← Назад
                </button>
            </div>
            <div className={styles.header}>
                <h1 className={styles.title}>❄️ Диапазоны Охлаждения</h1>
                <p className={styles.subtitle}>
                    Настрой, сколько дней нужно ждать для покупок разной стоимости.
                </p>
            </div>

            <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Добавить новое правило</h3>
                <div className={styles.inputsGrid}>
                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            className={styles.input}
                            value={min}
                            onChange={e => setMin(e.target.value)}
                            placeholder="0"
                        />
                        <span className={styles.label}>От (₽)</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            className={styles.input}
                            value={max}
                            onChange={e => setMax(e.target.value)}
                            placeholder="∞"
                        />
                        <span className={styles.label}>До (₽)</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            className={styles.input}
                            value={days}
                            onChange={e => setDays(e.target.value)}
                            placeholder="1"
                        />
                        <span className={styles.label}>Дней</span>
                    </div>

                    <button
                        className={styles.addButton}
                        onClick={add}
                        disabled={!min || !days}
                    >
                        Добавить правило
                    </button>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.list}>
                <h3 className={styles.listHeader}>Твои диапазоны</h3>

                {loading && items.length === 0 ? (
                    <div className={styles.loading}>Загрузка данных...</div>
                ) : items.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className="text-2xl mb-2">🍃</p>
                        <p>Правил пока нет.</p>
                        <p className="text-sm">ИИ будет использовать стандартные настройки.</p>
                    </div>
                ) : (
                    items.map(i => (
                        <div key={i.id} className={styles.item}>
                            <div className={styles.rangeInfo}>
                                <div className={styles.rangeText}>
                                    {formatMoney(i.min)}
                                    <span className={styles.rangeArrow}>→</span>
                                    {i.max !== null ? formatMoney(i.max) : '∞'} ₽
                                </div>
                                <div className={styles.badge}>
                                    ⏳ Ждать: {i.days} {getDayDeclension(i.days)}
                                </div>
                            </div>

                            <button
                                className={styles.deleteButton}
                                onClick={() => remove(i.id)}
                                title="Удалить"
                            >
                                🗑
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

function getDayDeclension(days: number): string {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
}