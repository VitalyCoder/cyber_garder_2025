import { blacklistApi } from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useState } from 'react';
import styles from './BlacklistPage.module.css';

export const BlacklistPage = () => {
	const user = useUserStore(s => s.user);
	const [items, setItems] = useState<Array<{ id: string; name: string }>>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [newName, setNewName] = useState('');

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			const data = await blacklistApi.list(user.id);
			setItems(data.map(d => ({ id: d.id, name: d.name })));
		} catch (e) {
			console.error(e);
			setError('Не удалось загрузить черный список');
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		void load();
	}, [load]);

	const add = async () => {
		if (!user || !newName.trim()) return;
		try {
			await blacklistApi.add(user.id, { name: newName.trim() });
			setNewName('');
			await load();
		} catch (e) {
			console.error(e);
			alert('Не удалось добавить категорию');
		}
	};

	const remove = async (id: string) => {
		if (!user) return;
		if (!confirm('Удалить категорию из черного списка?')) return;
		try {
			await blacklistApi.remove(user.id, id);
			await load();
		} catch (e) {
			console.error(e);
			alert('Не удалось удалить категорию');
		}
	};

	return (
		<div className={styles.container}>
			<h1>Черный список категорий</h1>
			<div className={styles.row}>
				<input
					className={styles.input}
					value={newName}
					onChange={e => setNewName(e.target.value)}
					placeholder='Например: Видеоигры'
				/>
				<button className={`${styles.btn} ${styles.primary}`} onClick={add}>
					Добавить
				</button>
			</div>
			{loading && <p>Загрузка...</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<div className={styles.list}>
				{items.map(i => (
					<span key={i.id} className={styles.tag}>
						{i.name}
						<button
							className={`${styles.btn} ${styles.danger}`}
							onClick={() => remove(i.id)}
						>
							✕
						</button>
					</span>
				))}
				{items.length === 0 && !loading && <p>Список пуст</p>}
			</div>
		</div>
	);
};
