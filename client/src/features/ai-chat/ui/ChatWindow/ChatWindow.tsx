import { useUserStore } from '@/store/userStore';
import clsx from 'clsx';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import styles from './ChatWindow.module.css';

interface Message {
	id: number;
	text: string;
	sender: 'user' | 'ai';
}

export const ChatWindow = () => {
	const navigate = useNavigate();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const user = useUserStore(s => s.user);
	const socketRef = useRef<Socket | null>(null);

	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);

	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			text: 'Привет! Я Мурад. Помогу тебе сэкономить. Что обсудим?',
			sender: 'ai',
		},
	]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		const s = io('/', { transports: ['websocket'] });
		socketRef.current = s;
		s.on('reply', (payload: { text: string }) => {
			const aiMsg: Message = {
				id: Date.now(),
				text: payload.text,
				sender: 'ai',
			};
			setMessages(prev => [...prev, aiMsg]);
			setIsTyping(false);
		});
		s.on('connect_error', () => {
			setIsTyping(false);
		});
		return () => {
			s.disconnect();
		};
	}, []);

	const handleSend = () => {
		if (!input.trim() || !socketRef.current || isTyping) return;

		const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
		setMessages(prev => [...prev, userMsg]);
		setInput('');
		setIsTyping(true);
		socketRef.current.emit('message', { text: userMsg.text, userId: user?.id });
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<button onClick={() => navigate(-1)} className='p-1'>
					<ArrowLeft size={24} />
				</button>
				<div>
					<h2 className='font-bold text-lg'>Финансовый Ассистент</h2>
					<div className='flex items-center gap-1'>
						<span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
						<span className='text-xs text-gray-500'>Online</span>
					</div>
				</div>
			</div>

			<div className={styles.messagesArea}>
				{messages.map(msg => (
					<div
						key={msg.id}
						className={clsx(
							styles.messageRow,
							msg.sender === 'user' ? styles.userRow : styles.aiRow
						)}
					>
						<div
							className={clsx(
								styles.bubble,
								msg.sender === 'user' ? styles.userBubble : styles.aiBubble
							)}
						>
							{msg.text}
						</div>
					</div>
				))}

				{isTyping && (
					<div className={clsx(styles.messageRow, styles.aiRow)}>
						<div
							className={clsx(
								styles.bubble,
								styles.aiBubble,
								'flex gap-1 items-center h-10'
							)}
						>
							<span
								className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
								style={{ animationDelay: '0ms' }}
							></span>
							<span
								className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
								style={{ animationDelay: '150ms' }}
							></span>
							<span
								className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
								style={{ animationDelay: '300ms' }}
							></span>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className={styles.inputArea}>
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && handleSend()}
					placeholder='Спроси совета...'
					className={styles.input}
				/>
				<button
					onClick={handleSend}
					disabled={!input.trim() || isTyping}
					className={styles.sendBtn}
				>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
};
