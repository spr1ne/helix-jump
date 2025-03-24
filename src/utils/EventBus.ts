type EventHandler<T = any> = (data: T) => void;

export class EventBus {
    private subscribers: Record<string, EventHandler[]> = {};

    subscribe<T>(eventName: string, callback: EventHandler<T>): void {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);
    }

    unsubscribe<T>(eventName: string, callback: EventHandler<T>): void {
        if (!this.subscribers[eventName]) {
            return;
        }

        this.subscribers[eventName] = this.subscribers[eventName].filter(
            (subscriber) => subscriber !== callback
        );
    }

    publish<T>(eventName: string, data?: T): void {
        if (!this.subscribers[eventName]) {
            return;
        }

        this.subscribers[eventName].forEach((callback) => {
            callback(data);
        });
    }

    clearAllSubscribers(): void {
        if (Object.keys(this.subscribers).length > 0) {
            this.subscribers = {};
        }
    }
}
