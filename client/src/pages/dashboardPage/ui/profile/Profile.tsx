import { useUserStore } from '@/store/userStore';
import { coolingRangeApi } from '@/shared/api/api'; // Импортируем API для подсчета правил (опционально)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

export const Profile = () => {
    const user = useUserStore(s => s.user);
    const navigate = useNavigate();
    
    // Состояние для количества правил охлаждения (для красоты)
    const [coolingCount, setCoolingCount] = useState<number | null>(null);

    // Подгружаем количество правил, чтобы показать в карточке
    useEffect(() => {
        if (user) {
            coolingRangeApi.list(user.id)
                .then(data => setCoolingCount(data.length))
                .catch(() => setCoolingCount(0));
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>💰 Финансы</h3>
                    <button 
                        className={styles.smallEditBtn}
                        style={{marginBottom: '18px'}}
                        onClick={() => navigate('/settings/profile')}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.row}>
                    <span className='text-gray-500'>Доход:</span>
                    <span className='font-mono font-medium text-lg'>
                        {(user.monthlyIncome ?? 0).toLocaleString()} ₽
                    </span>
                </div>
                <div className={styles.row}>
                    <span className='text-gray-500'>Накопления:</span>
                    <span className='font-mono font-medium text-lg'>
                        {(user.currentSavings ?? 0).toLocaleString()} ₽
                    </span>
                </div>
                <div className={styles.row}>
                    <span className='text-gray-500'>Цель в месяц:</span>
                    <span className='font-mono font-medium text-lg'>
                        {(user.monthlySavings ?? 0).toLocaleString()} ₽
                    </span>
                </div>
            </div>

            <div className={styles.card} >
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle} style={{fontSize: '17px'}}>⛔ Черный список</h3>
                    <button 
                        className={styles.smallEditBtn}
                        style={{marginBottom: '18px'}}
                        onClick={() => navigate('/settings/blacklist')}
                    >
                        Изменить
                    </button>
                </div>
                <div className='flex flex-wrap gap-2 mt-2'>
                    {(user.blacklistedCategories ?? []).length > 0 ? (
                        (user.blacklistedCategories ?? []).map(cat => (
                            <span key={cat} className={styles.tag}>
                                {cat}
                            </span>
                        ))
                    ) : (
                        <span className='text-sm text-gray-400'>Список пуст</span>
                    )}
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle} style={{marginBottom: '-5px'}}>❄️ Охлаждение</h3>
                    <button 
                        className={styles.smallEditBtn}
                        onClick={() => navigate('/settings/cooling-ranges')}
                    >
                        Изменить
                    </button>
                </div>
                <div className="text-sm text-gray-600">
                    {coolingCount !== null ? (
                        <>Активных правил: <span className="font-bold">{coolingCount}</span></>
                    ) : (
                        "Загрузка..."
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Настройка периодов ожидания для разных сумм.
                </p>
            </div>

            {/* 
            <div className='mt-4'>
                <button
                    className={styles.navButton}
                    onClick={() => navigate('/settings/notifications')}
                >
                    🔔 Настройки уведомлений
                </button>
            </div> 
            */}
        </div>
    );
};