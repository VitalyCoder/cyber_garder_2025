import { useUserStore } from '@/store/userStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

export const Profile = () => {
	const user = useUserStore(s => s.user);
	const navigate = useNavigate();
	const updateUser = useUserStore(s => s.updateUser);
	const [monthlyIncome, setMonthlyIncome] = useState<number>(
		user?.monthlyIncome ?? 0
	);
	const [currentSavings, setCurrentSavings] = useState<number>(
		user?.currentSavings ?? 0
	);
	const [monthlySavings, setMonthlySavings] = useState<number>(
		user?.monthlySavings ?? 0
	);
	const [useSavingsCalculation, setUseSavingsCalculation] =
		useState<boolean>(true);

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

			<div className={styles.card}>
				<h3 className={styles.cardTitle}>✏️ Редактировать профиль</h3>
				<div className={styles.row}>
					<span className='text-gray-500'>Доход:</span>
					<input
						type='number'
						className='border px-2 py-1 rounded'
						value={monthlyIncome}
						onChange={e => setMonthlyIncome(Number(e.target.value))}
					/>
				</div>
				<div className={styles.row}>
					<span className='text-gray-500'>Накопления:</span>
					<input
						type='number'
						className='border px-2 py-1 rounded'
						value={currentSavings}
						onChange={e => setCurrentSavings(Number(e.target.value))}
					/>
				</div>
				<div className={styles.row}>
					<span className='text-gray-500'>Регулярные накопления/мес:</span>
					<input
						type='number'
						className='border px-2 py-1 rounded'
						value={monthlySavings}
						onChange={e => setMonthlySavings(Number(e.target.value))}
					/>
				</div>
				<div className={styles.row}>
					<label className='flex items-center gap-2'>
						<input
							type='checkbox'
							checked={useSavingsCalculation}
							onChange={e => setUseSavingsCalculation(e.target.checked)}
						/>
						Учитывать накопления при расчете
					</label>
				</div>
				<button
					className={styles.editButton}
					onClick={async () => {
						if (!user) return;
						await updateUser({
							monthlyIncome,
							currentSavings,
							monthlySavings,
							useSavingsCalculation,
						});
						alert('Профиль сохранен');
					}}
				>
					Сохранить изменения
				</button>
			</div>

			<button className={styles.editButton}>✏️ Редактировать профиль</button>

			<div className='mt-4 grid grid-cols-1 gap-2'>
				<button
					className={styles.editButton}
					onClick={() => navigate('/settings/blacklist')}
				>
					⚠️ Черный список
				</button>
				<button
					className={styles.editButton}
					onClick={() => navigate('/settings/cooling-ranges')}
				>
					❄️ Правила охлаждения
				</button>
				<button
					className={styles.editButton}
					onClick={() => navigate('/settings/notifications')}
				>
					🔔 Уведомления
				</button>
			</div>
		</div>
	);
};
