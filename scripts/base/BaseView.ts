import {BaseClass} from "./BaseClass";

export class BaseView extends BaseClass {
    el: Element;

    constructor(element: Element, options?: Object) {
        super();
        this.el = element;
    }
}