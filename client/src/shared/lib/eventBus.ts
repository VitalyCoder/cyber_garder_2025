type Handler = () => void;

class EventBus {
	private listeners: Record<string, Set<Handler>> = {};

	on(event: string, handler: Handler) {
		if (!this.listeners[event]) this.listeners[event] = new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}

	off(event: string, handler: Handler) {
		this.listeners[event]?.delete(handler);
	}

	emit(event: string) {
		this.listeners[event]?.forEach(h => h());
	}
}

export const appEvents = new EventBus();
export const HISTORY_UPDATED_EVENT = 'history:updated';
