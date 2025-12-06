import { useWishlistStore } from '@/entities/wishlist/model/store';
import {
	historyApi,
	productsApi,
	type CheckProductResponseDto,
} from '@/shared/api/api';
import { appEvents, HISTORY_UPDATED_EVENT } from '@/shared/lib/eventBus';
import { useUserStore } from '@/store/userStore';
import type { ApiCheckStatus } from '@/types';
import { useState } from 'react';
import styles from './AddProductModal.module.css';
import { ResultCard } from '@/features/checkProduct/ui/resultCard/ResultCard';
import { ProductInput, type ProductData } from '@/features/checkProduct/ui/productInput/ProductInput';

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

	const handleCheck = async (data: ProductData) => {
		if (!user) return;
		setIsLoading(true);

		try {
			const res = await productsApi.check({
				userId: user.id,
				productName: data.product_name,
				price: data.price,
				category: data.category,
				productUrl: data.product_url
			});

			setResult(res);

			if (data.product_url) {
				setCurrentProduct({
					name: res.detected_name || 'Товар по ссылке',
					price: res.detected_price || 0,
					category: res.detected_category || 'Другое',
				});
			} else {
				setCurrentProduct({
					name: data.product_name!,
					price: data.price!,
					category: data.category!,
				});
			}

		} catch (e) {
			console.error(e);
			alert('Не удалось связаться с ИИ или распознать ссылку.');
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
				unlockDate: result.unlock_date || null,
			});
			onClose();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			alert('Ошибка при сохранении');
		}
	};

	const handleBuyNow = async () => {
		if (!result || !currentProduct || !user) return;
		try {
			await historyApi.add(user.id, {
				action: 'bought',
				productName: currentProduct.name,
				price: currentProduct.price,
			});
			appEvents.emit(HISTORY_UPDATED_EVENT);
			onClose();
		} catch {
			alert('Не удалось зафиксировать покупку');
		}
	};

	const mapStatusForUi = (apiStatus: string): ApiCheckStatus => {
		if (apiStatus === 'COOLING') return 'COOLDOWN';
		if (apiStatus === 'BLOCKED') return 'BLACKLIST';
		return apiStatus as ApiCheckStatus;
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<h2 className='text-xl font-bold'>Новая проверка</h2>
					<button onClick={onClose} className={styles.closeBtn}>
						✕
					</button>
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
								aiAdvice: result.ai_advice || '',
							}}
							productName={currentProduct?.name || ''}
							price={currentProduct?.price || 0}
							onReset={() => setResult(null)}
							onSave={handleSave}
							onBuy={handleBuyNow}
						/>
					)}
				</div>
			</div>
		</div>
	);
};