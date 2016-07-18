import {BaseEventsInterface} from "./BaseEventsInterface";

export interface EventObjectInterface {
    name: string,
    handler: () => void,
    context?: BaseEventsInterface
}