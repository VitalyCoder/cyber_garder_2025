import { coolingRangeApi } from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useState } from 'react';
import styles from './CoolingRangesPage.module.css';

type RangeItem = { id: string; min: number; max: number | null; days: number };

export const CoolingRangesPage = () => {
	const user = useUserStore(s => s.user);
	const [items, setItems] = useState<RangeItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [min, setMin] = useState('');
	const [max, setMax] = useState('');
	const [days, setDays] = useState('');

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			const data = await coolingRangeApi.list(user.id);
			setItems(
				data.map(d => ({ id: d.id, min: d.min, max: d.max, days: d.days }))
			);
		} catch (e) {
			console.error(e);
			setError('Не удалось загрузить правила');
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		void load();
	}, [load]);

	const add = async () => {
		if (!user) return;
		const minVal = Number(min);
		const maxVal = max.trim() ? Number(max) : null;
		const daysVal = Number(days);
		if (
			Number.isNaN(minVal) ||
			Number.isNaN(daysVal) ||
			(maxVal !== null && Number.isNaN(maxVal))
		) {
			alert('Введите корректные числа');
			return;
		}
		try {
			await coolingRangeApi.add(user.id, {
				min: minVal,
				max: maxVal,
				days: daysVal,
			});
			setMin('');
			setMax('');
			setDays('');
			await load();
		} catch (e) {
			console.error(e);
			alert('Не удалось добавить правило');
		}
	};

	const remove = async (id: string) => {
		if (!user) return;
		if (!confirm('Удалить правило?')) return;
		try {
			await coolingRangeApi.remove(user.id, id);
			await load();
		} catch (e) {
			console.error(e);
			alert('Не удалось удалить правило');
		}
	};

	return (
		<div className={styles.container}>
			<h1>Правила охлаждения</h1>
			<p>
				Диапазоны цен → длительность ожидания (дней). Максимум может быть пустым
				(без верхнего порога).
			</p>

			<div className={styles.row}>
				<input
					className={styles.input}
					value={min}
					onChange={e => setMin(e.target.value)}
					placeholder='Мин, ₽'
				/>
				<input
					className={styles.input}
					value={max}
					onChange={e => setMax(e.target.value)}
					placeholder='Макс, ₽ (опц.)'
				/>
				<input
					className={styles.input}
					value={days}
					onChange={e => setDays(e.target.value)}
					placeholder='Дней'
				/>
				<button className={`${styles.btn} ${styles.primary}`} onClick={add}>
					Добавить
				</button>
			</div>

			{loading && <p>Загрузка...</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}

			<div className={styles.list}>
				{items.map(i => (
					<div key={i.id} className={styles.item}>
						<span>
							{i.min.toLocaleString()} —{' '}
							{i.max !== null ? i.max.toLocaleString() : '∞'} ₽
						</span>
						<span>{i.days} дн.</span>
						<button
							className={`${styles.btn} ${styles.danger}`}
							onClick={() => remove(i.id)}
						>
							Удалить
						</button>
					</div>
				))}
				{items.length === 0 && !loading && <p>Правила не заданы</p>}
			</div>
		</div>
	);
};
