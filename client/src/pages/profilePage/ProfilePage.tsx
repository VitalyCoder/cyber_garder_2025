import { useUserStore } from '@/entities/user/model/store';
import { WishlistList } from '@/widgets/wishlist/ui/wishList';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css'
import { AddProductModal } from '../addProductModal/AddProductModal';

export const ProfilePage = () => {
  const { profile } = useUserStore();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <h2 className="text-lg font-bold mb-4">Мой Wishlist</h2>
        <WishlistList />
      </div>

      <button
        className={styles.fab}
        onClick={() => setIsAddModalOpen(true)}
      >
        +
      </button>

      {isAddModalOpen && (
        <AddProductModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

