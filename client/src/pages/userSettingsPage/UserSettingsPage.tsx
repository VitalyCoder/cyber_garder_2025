import { usersSettingsApi } from '@/shared/api/api';
import { useUserStore } from '@/store/userStore';
import { useEffect, useState } from 'react';
import styles from './UserSettingsPage.module.css';

type Frequency = 'daily' | 'weekly' | 'monthly';
type Channel = 'browser' | 'email' | 'telegram';

export const UserSettingsPage = () => {
	const user = useUserStore(s => s.user);
	const [freq, setFreq] = useState<Frequency>('weekly');
	const [chan, setChan] = useState<Channel>('browser');
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			if (!user) return;
			try {
				const data = await usersSettingsApi.get(user.id);
				setFreq(data.notificationFrequency);
				setChan(data.notificationChannel);
			} catch (e) {
				console.error(e);
			}
		};
		void load();
	}, [user]);

	const save = async () => {
		if (!user) return;
		setLoading(true);
		setMsg(null);
		try {
			await usersSettingsApi.upsert(user.id, {
				notificationFrequency: freq,
				notificationChannel: chan,
			});
			setMsg('Сохранено');
		} catch (e) {
			console.error(e);
			setMsg('Ошибка сохранения');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<h1>Настройки уведомлений</h1>
			<div className={styles.row}>
				<label className={styles.muted}>Частота:</label>
				<select
					className={styles.select}
					value={freq}
					onChange={e => setFreq(e.target.value as Frequency)}
				>
					<option value='daily'>Ежедневно</option>
					<option value='weekly'>Еженедельно</option>
					<option value='monthly'>Ежемесячно</option>
				</select>
			</div>
			<div className={styles.row}>
				<label className={styles.muted}>Канал:</label>
				<select
					className={styles.select}
					value={chan}
					onChange={e => setChan(e.target.value as Channel)}
				>
					<option value='browser'>Браузер</option>
					<option value='email'>Email</option>
					<option value='telegram'>Telegram</option>
				</select>
			</div>
			<button
				className={`${styles.btn} ${styles.primary}`}
				onClick={save}
				disabled={loading}
			>
				Сохранить
			</button>
			{msg && <p className={styles.muted}>{msg}</p>}
		</div>
	);
};
