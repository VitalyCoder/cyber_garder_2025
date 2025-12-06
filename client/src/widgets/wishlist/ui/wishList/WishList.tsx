import { useWishlistStore } from '@/entities/wishlist/model/store';
import { Button } from '@/shared/ui/Button';
import { useUserStore } from '@/store/userStore';
import { ShoppingBag, Trash2 } from 'lucide-react';
import styles from './WishlistList.module.css';

export const WishlistList = () => {
	const { items, deleteItem, buyItem } = useWishlistStore();
	const user = useUserStore(s => s.user);

	// активные (не купленные и не отмененные)
	const activeItems = items.filter(
		i => i.status !== 'bought' && i.status !== 'cancelled'
	);

	if (activeItems.length === 0) {
		return <div className={styles.empty}>Вишлист пуст. Ты дзен-мастер!</div>;
	}

	return (
		<div className={styles.list}>
			{activeItems.map(item => {
				const isReady =
					!item.unlockDate || new Date(item.unlockDate) <= new Date();

				// считаю дни до разблокировки (если есть дата)
				const daysLeft = item.unlockDate
					? Math.ceil(
							(new Date(item.unlockDate).getTime() - new Date().getTime()) /
								(1000 * 3600 * 24)
					  )
					: 0;

				let badgeClass = 'bg-blue-100 text-blue-700';
				let badgeText = `Ждать ${daysLeft} дн.`;

				if (isReady) {
					badgeClass = 'bg-green-100 text-green-700';
					badgeText = 'ГОТОВО!';
				}

				return (
					<div key={item.id} className={styles.card}>
						<div className={styles.header}>
							<div>
								<h3 className={styles.title}>{item.productName}</h3>
								<p className={styles.price}>{item.price.toLocaleString()} ₽</p>
							</div>
							<span className={`${styles.badge} ${badgeClass}`}>
								{badgeText}
							</span>
						</div>

						{item.aiRecommendation && (
							<p className={styles.advice}>💡 {item.aiRecommendation}</p>
						)}

						<div className={styles.actions}>
							{isReady && user && (
								<Button
									variant='primary'
									className='bg-green-600 hover:bg-green-700 py-2 text-sm'
									onClick={() => buyItem(user.id, item)}
								>
									<ShoppingBag size={16} /> Купил
								</Button>
							)}

							<Button
								variant='danger'
								className='py-2 px-3'
								onClick={() => user && deleteItem(user.id, item.id)}
							>
								<Trash2 size={18} />
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
};
