import { useState } from 'react';
import { useWishlistStore } from '@/entities/wishlist/model/store';
import { useUserStore } from '@/store/userStore';
import { productsApi, type CheckProductResponseDto } from '@/shared/api/api'; 
import styles from './AddProductModal.module.css';
import type { ApiCheckStatus } from '@/types';
import { ProductInput } from '../../features/checkProduct/ui/productInput';
import { ResultCard } from '../../features/checkProduct/ui/resultCard/ResultCard';

interface Props {
    onClose: () => void;
}

export const AddProductModal = ({ onClose }: Props) => {
    const user = useUserStore(s => s.user);
    const addItem = useWishlistStore(s => s.addItem);
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CheckProductResponseDto | null>(null);

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
        if (!user) return;
        setIsLoading(true);
        setCurrentProduct({ 
            name: data.product_name, 
            price: data.price, 
            category: data.category 
        });

        try {
            const res = await productsApi.check({
                userId: user.id,
                productName: data.product_name,
                price: data.price,
                category: data.category
            });
            setResult(res);
        } catch (e) {
            console.error(e);
            alert("Не удалось связаться с ИИ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result || !currentProduct || !user) return;
        try {
            await addItem(user.id, {
                productName: currentProduct.name,
                price: currentProduct.price,
                category: currentProduct.category,
                coolingPeriodDays: result.cooling_days || 0,
                unlockDate: result.unlock_date || null
            });
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert("Ошибка при сохранении");
        }
    };

    const mapStatusForUi = (apiStatus: string): ApiCheckStatus => {
        if (apiStatus === 'COOLING') return 'COOLDOWN';
        if (apiStatus === 'BLOCKED') return 'BLACKLIST';
        return apiStatus as ApiCheckStatus; // 'APPROVED' совпадает
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className="text-xl font-bold">Новая проверка</h2>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>

                <div className={styles.content}>
                    {!result ? (
                        <ProductInput onSubmit={handleCheck} isLoading={isLoading} />
                    ) : (
                        <ResultCard
                            result={{
                                status: mapStatusForUi(result.status), 
                                daysToWait: result.cooling_days || 0,
                                unlockDate: result.unlock_date || '',
                                aiAdvice: result.ai_advice || ''
                            }}
                            productName={currentProduct?.name || ''}
                            price={currentProduct?.price || 0}
                            onReset={() => setResult(null)}
                            onSave={handleSave}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};