import { useUserStore } from '@/store/userStore';
import styles from './Profile.module.css';

export const Profile = () => {
	const user = useUserStore(s => s.user);

	if (!user) return null;

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h3 className={styles.cardTitle}>💰 Финансы</h3>
				<div className={styles.row}>
					<span className='text-gray-500'>Доход:</span>
					<span className='font-mono font-medium'>
						{(user.monthlyIncome ?? 0).toLocaleString()} ₽
					</span>
				</div>
				<div className={styles.row}>
					<span className='text-gray-500'>Накопления:</span>
					<span className='font-mono font-medium'>
						{(user.currentSavings ?? 0).toLocaleString()} ₽
					</span>
				</div>
				<div className={styles.row}>
					<span className='text-gray-500'>Цель в месяц:</span>
					<span className='font-mono font-medium'>
						{(user.monthlySavings ?? 0).toLocaleString()} ₽
					</span>
				</div>
			</div>

			<div className={styles.card}>
				<h3 className={styles.cardTitle}>⛔ Черный список</h3>
				<div className='flex flex-wrap gap-2 mt-2'>
					{(user.blacklistedCategories ?? []).length > 0 ? (
						(user.blacklistedCategories ?? []).map(cat => (
							<span key={cat} className={styles.tag}>
								{cat}
							</span>
						))
					) : (
						<span className='text-sm text-gray-400'>Список пуст</span>
					)}
				</div>
			</div>

			<button className={styles.editButton}>✏️ Редактировать профиль</button>
		</div>
	);
};
