export interface BaseEventsInterface {
    trigger(event: string, args: Array<any>): void;
    listenTo(obj: BaseEventsInterface, event: string, handler: () => void): void;
    stopListening(obj: BaseEventsInterface, event: string): void;
    on(event: string, handler: () => void, context: BaseEventsInterface): void;
    off(event: string, context?: BaseEventsInterface): void;
}