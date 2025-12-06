import {
	historyApi,
	wishlistApi,
	type WishlistItemEntity,
} from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useState } from 'react';
import styles from './SurveyPage.module.css';

export const SurveyPage = () => {
	const user = useUserStore(s => s.user);
	const [items, setItems] = useState<WishlistItemEntity[]>([]);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const data = await wishlistApi.list(user.id);
			// Предлагаем опрос только по активным (waiting/ready)
			const active = data.filter(
				i => i.status === 'waiting' || i.status === 'ready'
			);
			setItems(active);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		void load();
	}, [load]);

	const keep = async (item: WishlistItemEntity) => {
		alert(`Оставляем в списке: ${item.productName}`);
	};
	const remove = async (item: WishlistItemEntity) => {
		if (!user) return;
		if (!confirm(`Удалить из желаний: ${item.productName}?`)) return;
		await wishlistApi.remove(user.id, item.id);
		await historyApi.add(user.id, {
			action: 'removed',
			productName: item.productName,
			price: item.price,
		});
		await load();
	};

	return (
		<div className={styles.container}>
			<h1>Опрос: Ты всё ещё хочешь купить…</h1>
			{loading && <p>Загрузка…</p>}
			{items.map(i => (
				<div key={i.id} className={styles.card}>
					<span className={styles.title}>{i.productName}</span>
					<div className='flex gap-8'>
						<button
							className={`${styles.btn} ${styles.primary}`}
							onClick={() => keep(i)}
						>
							Да
						</button>
						<button
							className={`${styles.btn} ${styles.danger}`}
							onClick={() => remove(i)}
						>
							Нет
						</button>
					</div>
				</div>
			))}
			{!loading && items.length === 0 && <p>Активных желаний нет</p>}
		</div>
	);
};
