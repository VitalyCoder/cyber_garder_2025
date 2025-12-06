import { blacklistApi } from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { CATEGORIES } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BlacklistPage.module.css';

export const BlacklistPage = () => {
	const navigate = useNavigate();
	const user = useUserStore(s => s.user);
	const setBlacklistLocal = useUserStore(s => s.setBlacklistLocal);

	const [items, setItems] = useState<Array<{ id: string; name: string }>>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [newName, setNewName] = useState('');

	// Храним последнюю загруженную версию чёрного списка, чтобы избежать лишних обновлений стора
	const lastBlacklistRef = useRef<string[]>([]);

	// Стабильный id пользователя как зависимость (исключаем изменения user-объекта из-за обновлений стора)
	const userId = user?.id;

	useEffect(() => {
		let isActive = true;
		const load = async () => {
			if (!userId) return;
			setLoading(true);
			setError(null);
			try {
				const data = await blacklistApi.list(userId);
				if (!isActive) return;
				const mapped = data.map(d => ({ id: d.id, name: d.name }));
				setItems(mapped);

				// Обновляем локальный стор только если данные реально изменились
				const justNames = data.map(d => d.name);
				const prev = lastBlacklistRef.current;
				const changed =
					justNames.length !== prev.length ||
					justNames.some((n, i) => n !== prev[i]);
				if (changed) {
					setBlacklistLocal(justNames);
					lastBlacklistRef.current = justNames;
				}
			} catch (e) {
				console.error(e);
				if (!isActive) return;
				setError('Не удалось загрузить данные');
			} finally {
				if (isActive) setLoading(false);
			}
		};

		void load();
		return () => {
			isActive = false;
		};
	}, [userId, setBlacklistLocal]);

	const add = async (nameToAdd?: string) => {
		if (!user) return;

		const targetName = (nameToAdd || newName).trim();
		if (!targetName) return;

		if (items.some(i => i.name.toLowerCase() === targetName.toLowerCase())) {
			alert(`"${targetName}" уже в черном списке`);
			setNewName('');
			return;
		}

		try {
			await blacklistApi.add(user.id, { name: targetName });
			if (!nameToAdd) setNewName('');
			// После добавления инициируем локальную перезагрузку
			lastBlacklistRef.current = [];
			// Тригерим эффект через смену items (опционально загрузим заново)
			const data = await blacklistApi.list(user.id);
			const mapped = data.map(d => ({ id: d.id, name: d.name }));
			setItems(mapped);
			const justNames = data.map(d => d.name);
			setBlacklistLocal(justNames);
			lastBlacklistRef.current = justNames;
		} catch (e) {
			console.error(e);
			alert('Ошибка при добавлении');
		}
	};

	const remove = async (id: string, name: string) => {
		if (!user) return;
		if (!confirm(`Разблокировать категорию "${name}"?`)) return;

		try {
			await blacklistApi.remove(user.id, id);
			// Аналогично добавлению — обновляем локально без дергания эффекта из-за user-объекта
			lastBlacklistRef.current = [];
			const data = await blacklistApi.list(user.id);
			const mapped = data.map(d => ({ id: d.id, name: d.name }));
			setItems(mapped);
			const justNames = data.map(d => d.name);
			setBlacklistLocal(justNames);
			lastBlacklistRef.current = justNames;
		} catch (e) {
			console.error(e);
			alert('Ошибка при удалении');
		}
	};

	const suggestions = CATEGORIES.filter(
		cat => !items.some(i => i.name.toLowerCase() === cat.toLowerCase())
	);

	return (
		<div className={styles.container}>
			<div className={styles.topBar}>
				<button onClick={() => navigate(-1)} className={styles.backBtn}>
					← Назад
				</button>
			</div>

			<div className={styles.header}>
				<h1 className={styles.title}>⛔ Черный список</h1>
				<p className={styles.subtitle}>
					Категории, добавленные сюда, будут блокироваться ИИ или требовать
					строгого подтверждения.
				</p>
			</div>

			<div className={styles.card}>
				<div className={styles.inputRow}>
					<input
						className={styles.input}
						value={newName}
						onChange={e => setNewName(e.target.value)}
						placeholder='Например: Вкусняшки...'
						onKeyDown={e => e.key === 'Enter' && add()}
					/>
					<button
						className={styles.addButton}
						onClick={() => add()}
						disabled={!newName.trim()}
					>
						<span>Добавить</span>
						<span className='text-lg leading-none'>+</span>
					</button>
				</div>

				{suggestions.length > 0 && (
					<div className={styles.suggestionsArea}>
						<p className={styles.suggestionsTitle}>Быстрый выбор:</p>
						<div className={styles.suggestionsGrid}>
							{suggestions.slice(0, 6).map(cat => (
								<button
									key={cat}
									className={styles.suggestionChip}
									onClick={() => add(cat)}
								>
									+ {cat}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.listArea}>
				<div className={styles.listHeader}>
					<h3 className={styles.listTitle}>Ваши запреты</h3>
					<span className={styles.countBadge}>{items.length}</span>
				</div>

				{loading && items.length === 0 ? (
					<div className={styles.loading}>Загрузка списка...</div>
				) : items.length === 0 ? (
					<div className={styles.emptyState}>
						<span className='text-4xl mb-2'>🍃</span>
						<p>Список чист</p>
						<p className='text-xs mt-1'>Добавьте что-нибудь сверху</p>
					</div>
				) : (
					<div className={styles.tagsGrid}>
						{items.map(i => (
							<span key={i.id} className={styles.tag}>
								{i.name}
								<button
									className={styles.deleteBtn}
									onClick={() => remove(i.id, i.name)}
									title='Удалить из списка'
								>
									✕
								</button>
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
