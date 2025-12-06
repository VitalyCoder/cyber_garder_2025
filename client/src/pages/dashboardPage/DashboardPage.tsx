import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import styles from './DashboardPage.module.css';
import { AddProductModal } from '../addProductModal/AddProductModal';
import { Profile } from './ui/profile';
import { Wishlist } from './ui/wishlist';
import { History } from './ui/history';
import { LogOut, Sparkles, X } from 'lucide-react';
import { ExpensesDonut } from '@/widgets/expenses/ui/expensesDonut/ExpensesDonut';

type TabType = 'wishlist' | 'history' | 'profile';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const logout = useUserStore((s) => s.logout);

    const [activeTab, setActiveTab] = useState<TabType>('wishlist');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
        from: '',
        to: ''
    });

    const handleLogout = () => {
        if (confirm('Ты уверен, что хочешь выйти?')) {
            logout();
            navigate('/onboarding');
        }
    };

    const resetFilters = () => {
        setDateRange({ from: '', to: '' });
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/chat')}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-300 to-fuchsia-100 text-gray-950 px-3 py-2 rounded-xl text-xs font-bold border border-volet-200"
                    >
                        <Sparkles size={16} />
                        <span>Спросить ИИ</span>
                    </button>
                    {/* 
                    <div>
                        <h1 className={styles.title}>ZenBalance</h1>
                    </div> */}
                </div>

                <button onClick={handleLogout} className={styles.logoutButton}>
                    <LogOut size={18} />
                </button>
            </header>

            <div className={styles.filterContainer}>
                <div className={styles.dateInputsWrapper}>
                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>С:</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>По:</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={dateRange.to}
                            min={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>

                    {(dateRange.from || dateRange.to) && (
                        <button onClick={resetFilters} className={styles.resetBtn} title="Сбросить">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <ExpensesDonut
                fromDate={dateRange.from}
                toDate={dateRange.to}
            />

            <div className={styles.tabsContainer}>
                <div className={styles.tabsWrapper}>
                    <button
                        onClick={() => setActiveTab('wishlist')}
                        className={`${styles.tab} ${activeTab === 'wishlist' ? styles.activeTab : styles.inactiveTab}`}
                    >
                        Желания
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : styles.inactiveTab}`}
                    >
                        История
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : styles.inactiveTab}`}
                    >
                        Профиль
                    </button>
                </div>
            </div>

            <main className={styles.content}>
                {activeTab === 'wishlist' && <Wishlist />}
                {activeTab === 'history' && <History />}
                {activeTab === 'profile' && <Profile />}
            </main>

            {activeTab === 'wishlist' && (
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className={styles.fab}
                    aria-label="Добавить"
                >
                    +
                </button>
            )}
            {isAddModalOpen && (
                <AddProductModal onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
};