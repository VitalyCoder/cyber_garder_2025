import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, X } from 'lucide-react';
import styles from './DashboardPage.module.css';
import { checkProductApi } from '@/shared/api/checkService';
import { useUserStore } from '@/entities/user/model/store';
import { ExpensesDonut } from '@/widgets/expenses/ui/expensesDonut/ExpensesDonut';
import { CheckForm } from '@/features/check_impulse/ui/CheckForm';

export const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const profile = useUserStore((s) => s.profile);

    const handleCheckSubmit = async (data: { name: string; price: string; category: string }) => {
        setIsLoading(true);

        const result = await checkProductApi(
            data.name,
            Number(data.price),
            data.category,
            profile
        );

        setIsLoading(false);
        setIsModalOpen(false);

        // Переходим на результат
        navigate('/result', {
            state: {
                result,
                product: { ...data, price: Number(data.price) }
            }
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className="text-2xl font-bold">ZenBalance</h1>
                <button className={styles.monthSelector}>авг 2023 ▾</button>
            </div>
            
            <ExpensesDonut />

            <button
                className={styles.fab}
                onClick={() => setIsModalOpen(true)}
            >
                +
            </button>

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

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setIsModalOpen(false);
                }}>
                    <div className={styles.modalContent}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Новая покупка</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-10 text-center space-y-4">
                                <div className="animate-spin text-4xl">🧠</div>
                                <p className="text-gray-500 font-medium">ИИ анализирует твои финансы...</p>
                            </div>
                        ) : (
                            <CheckForm onSubmit={handleCheckSubmit} />)}
                    </div>
                </div>
            )}
        </div>
    );
};