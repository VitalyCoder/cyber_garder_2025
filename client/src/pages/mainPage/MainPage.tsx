import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';
import type { CheckResult } from '@/entities/product/lib/cooling-logic';
import { useWishlistStore } from '@/entities/wishlist/model/store';
import { checkProductApi } from '@/shared/api/checkService';
import { useUserStore } from '@/store/userStore';
import { ProductInput } from './ui/productInput';
import { ResultCard } from './ui/resultCard/ResultCard';
import { mapApiStatusToProductStatus } from '@/types';

export const MainPage = () => {
    const profile = useUserStore(s => s.user);
    const addItem = useWishlistStore(s => s.addItem);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);

    const [currentProduct, setCurrentProduct] = useState<{
        name: string;
        price: number;
        category: string;
    } | null>(null);

    const handleCheck = async (data: {
        product_name: string;
        price: number;
        category: string;
    }) => {
        if (!profile) return;

        setIsLoading(true);

        setCurrentProduct({
            name: data.product_name,
            price: data.price,
            category: data.category
        });

        const res = await checkProductApi(
            data.product_name,
            data.price,
            data.category,
            profile
        );

        setResult(res);
        setIsLoading(false);
    };

const handleSave = () => {
  if (!result || !currentProduct) return;

  addItem({
    id: Date.now().toString(),
    name: currentProduct.name,
    price: currentProduct.price,
    category: currentProduct.category,
    status: mapApiStatusToProductStatus(result.status), 
    unlockDate: result.unlockDate,
    aiAdvice: result.aiAdvice,
    createdAt: new Date().toISOString(),
    excludeFromNotifications: false
  });

  navigate('/dashboard');
};

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.logo}>ZenBalance</h1>
                <div onClick={() => navigate('/dashboard')} className={styles.avatar}>
                    👤
                </div>
            </div>

            <div className={styles.content}>
                {!result ? (
                    <>
                        <div className={styles.intro}>
                            <h2 className={styles.introTitle}>Анализатор покупок 🧠</h2>
                            <p className={styles.introText}>
                                Введи товар, и ИИ скажет, стоит ли его покупать сейчас.
                            </p>
                        </div>

                        <ProductInput onSubmit={handleCheck} isLoading={isLoading} />
                    </>
                ) : (
                    <ResultCard
                        result={result}
                        productName={currentProduct?.name || ''}
                        price={currentProduct?.price || 0}
                        onReset={() => setResult(null)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    );
};
