import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

export const Profile = () => {
    const user = useUserStore(s => s.user);
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h3 className={styles.cardTitle}>💰 Финансы</h3>
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

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>⛔ Черный список</h3>
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

            <div className='mt-6 grid grid-cols-1 gap-3'>
                <button
                    className={styles.navButton}
                    onClick={() => navigate('/settings/profile')}
                >
                    <span className="text-xl">✏️</span>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-gray-800">Редактировать финансы</span>
                        <span className="text-xs text-gray-400">Доход, накопления, настройки</span>
                    </div>
                </button>

                <button
                    className={styles.navButton}
                    onClick={() => navigate('/settings/blacklist')}
                >
                    <span className="text-xl">⚠️</span>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-gray-800">Черный список</span>
                        <span className="text-xs text-gray-400">Управление запрещенными категориями</span>
                    </div>
                </button>

                <button
                    className={styles.navButton}
                    onClick={() => navigate('/settings/cooling-ranges')}
                >
                    <span className="text-xl">❄️</span>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-gray-800">Правила охлаждения</span>
                        <span className="text-xs text-gray-400">Настройка периодов ожидания</span>
                    </div>
                </button>
            </div>
        </div>
    );
};