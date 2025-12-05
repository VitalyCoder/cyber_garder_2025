import { useUserStore } from '@/entities/user/model/store';
import { WishlistList } from '@/widgets/wishlist/ui/wishList';
import { ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css'
import { CheckForm } from '@/features/check_impulse/ui/CheckForm';
import { checkProductApi } from '@/shared/api/checkService';

export const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useUserStore();
  const navigate = useNavigate();

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

    navigate('/result', {
      state: {
        result,
        product: { ...data, price: Number(data.price) }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-white p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={25} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{profile.nickname}</h1>
            <p className="text-gray-500 text-sm">
              Накопления: {profile.currentSavings.toLocaleString()} ₽
            </p>
          </div>
          {/* спросить будет ли кнопка редакта */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <h2 className="text-lg font-bold mb-4">Мой Wishlist</h2>
        <WishlistList />
      </div>

      <button
        className={styles.fab}
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>

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

