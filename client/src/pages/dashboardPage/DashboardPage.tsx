import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import styles from './DashboardPage.module.css';
import { AddProductModal } from '../addProductModal/AddProductModal';
import { Profile } from './ui/profile';
import { Wishlist } from './ui/wishlist';
import { History } from './ui/history'
import { Bot, User } from 'lucide-react';
import { ExpensesDonut } from '@/widgets/expenses/ui/expensesDonut/ExpensesDonut';

type TabType = 'wishlist' | 'history' | 'profile';

export const DashboardPage = () => {
    const navigate = useNavigate();

    const user = useUserStore((s) => s.user);
    const logout = useUserStore((s) => s.logout);

    const [activeTab, setActiveTab] = useState<TabType>('wishlist');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleLogout = () => {
        if (confirm('Ты уверен, что хочешь выйти?')) {
            logout();
            navigate('/onboarding');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>ZenBalance</h1>
                    {user && (
                        <p className="text-xs text-gray-400">
                            Привет, <span className="font-medium text-gray-600">{user.nickname}</span> 👋
                        </p>
                    )}
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Выйти
                </button>
            </header>

                    <ExpensesDonut />
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
                    aria-label="Добавить новую проверку"
                >
                    +
                </button>
            )}
            {isAddModalOpen && (
                <AddProductModal onClose={() => setIsAddModalOpen(false)} />
            )}

            <div className={styles.bottomNav}>
                <button
                    className={styles.navItem}
                    onClick={() => navigate('/chat')}
                >
                    <Bot size={24} />
                    <span>ИИ-Чат</span>
                </button>

                <div className="w-12" />

                <button className={styles.navItem} onClick={() => navigate('/profile')}>
                    <User size={24} />
                    <span>Профиль</span>
                </button>
            </div>
        </div>
    );
};