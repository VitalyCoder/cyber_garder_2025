import { historyApi, type HistoryEntity } from '@/shared/api/api';
import { appEvents, HISTORY_UPDATED_EVENT } from '@/shared/lib/eventBus';
import { useUserStore } from '@/store/userStore';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import styles from './ExpensesDonut.module.css';

type Slice = { name: string; value: number; color: string };

// Простая карта ключевых слов → категории
const CATEGORY_MAP: Record<string, string> = {
	burger: 'Фастфуд',
	pizza: 'Фастфуд',
	kfc: 'Фастфуд',
	mcdonald: 'Фастфуд',
	food: 'Фастфуд',
	supermarket: 'Супермаркеты',
	grocery: 'Супермаркеты',
	magnit: 'Супермаркеты',
	pyaterochka: 'Супермаркеты',
	restaurant: 'Рестораны',
	cafe: 'Рестораны',
	bar: 'Рестораны',
	clothes: 'Одежда',
	adidas: 'Одежда',
	nike: 'Одежда',
};

const COLORS: Record<string, string> = {
	Фастфуд: '#F97316',
	Супермаркеты: '#F43F5E',
	Рестораны: '#EC4899',
	Одежда: '#8B5CF6',
	Остальное: '#94A3B8',
};

function detectCategory(name?: string | null): string {
	const n = (name || '').toLowerCase();
	for (const key of Object.keys(CATEGORY_MAP)) {
		if (n.includes(key)) return CATEGORY_MAP[key];
	}
	return 'Остальное';
}

export const ExpensesDonut = () => {
	const user = useUserStore(s => s.user);
	const [history, setHistory] = useState<HistoryEntity[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!user) return;
		const load = async () => {
			setLoading(true);
			try {
				const data = await historyApi.list(user.id);
				setHistory(data);
			} catch (e) {
				console.error('Не удалось загрузить историю трат', e);
			} finally {
				setLoading(false);
			}
		};
		load();

		// Подписка на изменения истории (например, покупка из wishlist)
		const unsubscribe = appEvents.on(HISTORY_UPDATED_EVENT, () => {
			load();
		});
		return unsubscribe;
	}, [user]);

	const slices: Slice[] = useMemo(() => {
		// Берём только покупки с ценой
		const bought = history.filter(
			h => h.action === 'bought' && (h.price ?? 0) > 0
		);
		const totals = new Map<string, number>();
		for (const item of bought) {
			const cat = detectCategory(item.productName);
			const prev = totals.get(cat) || 0;
			totals.set(cat, prev + (item.price || 0));
		}
		// Преобразуем в массив с цветами, сортируем по размеру
		const arr: Slice[] = Array.from(totals.entries()).map(([name, value]) => ({
			name,
			value,
			color: COLORS[name] || COLORS['Остальное'],
		}));
		arr.sort((a, b) => b.value - a.value);
		// Если нет данных — покажем пустой "Остальное"
		if (arr.length === 0) {
			return [{ name: 'Остальное', value: 0, color: COLORS['Остальное'] }];
		}
		return arr;
	}, [history]);

	const total = useMemo(
		() => slices.reduce((acc, s) => acc + s.value, 0),
		[slices]
	);

	return (
		<div className={styles.container}>
			{/* График */}
			<div className='w-64 h-64 relative'>
				<ResponsiveContainer width='100%' height='100%'>
					<PieChart>
						<Pie
							data={slices}
							innerRadius={80}
							outerRadius={120}
							paddingAngle={2}
							dataKey='value'
							stroke='none'
							cornerRadius={8}
						>
							{slices.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				{/* Текст по центру */}
				<div className={styles.centerText}>
					<div className={styles.totalAmount}>{total.toLocaleString()} ₽</div>
					<div className={styles.label}>{loading ? 'Загрузка…' : 'Траты'}</div>
				</div>
			</div>

			{/* Легенда снизу (Категории) */}
			<div className={styles.legend}>
				{slices.slice(0, 4).map(item => (
					<div key={item.name} className={styles.legendItem}>
						<div
							className={styles.dot}
							style={{ backgroundColor: item.color }}
						/>
						<div className='flex flex-col'>
							<span className='text-xs font-bold text-gray-700'>
								{item.name}
							</span>
							<span className='text-xs text-gray-500'>
								{item.value.toLocaleString()} ₽
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
