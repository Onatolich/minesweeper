import {BaseEventsInterface} from "./BaseEventsInterface";
import {EventObjectInterface} from "./EventObjectInterface";

export class BaseClass implements BaseEventsInterface {
    private _events: Array<EventObjectInterface> = [];

    constructor() {}

    trigger(event: string, args: Array<any>) {
        for (let eventObj of this._events) {
            if (eventObj.name !== event) {
                continue;
            }
            eventObj.handler.apply(eventObj.context || this, args);
        }
    }

    listenTo(obj: BaseEventsInterface, event: string, handler: () => void) {
        obj.on(event, handler, this);
    }

    stopListening(obj: BaseEventsInterface, event: string) {
        obj.off(event, this);
    }

    on(event: string, handler: () => void, context: BaseEventsInterface) {
        let eventObj = <EventObjectInterface>{
            name: event,
            handler: handler,
            context: context
        };

        this._events.push(eventObj);
    }

    off(event: string, context?: BaseEventsInterface) {
        for (let i in this._events) {
            if (!this._events.hasOwnProperty(i)) {
                continue;
            }

            let eventObj = this._events[i];
            if (eventObj.name !== event) {
                continue;
            }
            if (!context || eventObj.context === context) {
                delete this._events[i];
            }
        }
    }
}