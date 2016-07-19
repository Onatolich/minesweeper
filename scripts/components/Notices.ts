import {BaseView} from "../base/BaseView";

export class Notices extends BaseView {
    private clearDelay: number = 3000;
    private clearTimer: number;

    displayRegular(text: string, delay?: number) {
        this.display('regular', text, delay);
    }

    displaySuccess(text: string, delay?: number) {
        this.display('success', text, delay);
    }

    displayDanger(text: string, delay?: number) {
        this.display('danger', text, delay);
    }

    private display(type: string, text: string, delay?: number) {
        this.el.className = type;
        this.el.innerHTML = text;

        if (delay !== -1) {
            this.setClearTimeout(delay);
        }
    }

    private setClearTimeout(delay?: number) {
        clearTimeout(this.clearTimer);
        this.clearTimer = setTimeout(this.clear.bind(this), delay || this.clearDelay);
    }

    private clear() {
        this.el.className = '';
        this.el.innerHTML = '&nbsp;';
    }
}