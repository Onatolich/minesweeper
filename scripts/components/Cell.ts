import {BaseView} from "../base/BaseView";

export enum CellTypes {
    Regular,
    Mine
}

interface CellData {
    type: CellTypes,
    closed: boolean,
    marked: boolean,
    dangerRate: number // neighbour mines
}

export class Cell extends BaseView {
    data: CellData;

    constructor(element: Element, data: CellData) {
        super(element, data);

        this.data = data;
        
        this.update();
        this.initEvents();
    }
    
    update() {
        if (this.data.type !== CellTypes.Mine && this.data.dangerRate > 0 && !this.data.closed) {
            this.el.innerHTML = this.data.dangerRate.toString();
        }
        this.actualizeClass();
    }

    isMine(): boolean {
        return this.data.type === CellTypes.Mine;
    }
    
    isMarked(): boolean {
        return this.data.marked;
    }

    destroy() {
        this.el.removeEventListener('click', this.onClick);
        this.el.removeEventListener('contextmenu', this.onRightClick);
    }

    private initEvents() {
        this.el.addEventListener('click', this.onClick.bind(this));
        this.el.addEventListener('contextmenu', this.onRightClick.bind(this));
    }

    private open() {
        this.data.closed = false;
        this.trigger('open', [this.data]);
        this.update();
    }

    private toggleMark() {
        this.data.marked = !this.data.marked;
        this.trigger('mark', [this.data]);
        this.update();
    }

    private actualizeClass() {
        let classes: string[] = [];

        if(this.data.marked) {
            classes.push('marked');
        }

        if (!this.data.closed) {
            classes.push('open');
            if (this.data.type === CellTypes.Mine) {
                classes.push('mine');
            } else if (this.data.dangerRate > 0) {
                classes.push('danger-' + this.data.dangerRate);
            }
        }

        this.el.className = classes.join(' ');
    }

    private onClick(e: Event) {
        e.preventDefault();
        this.open();
    }

    private onRightClick(e: Event) {
        e.preventDefault();
        this.toggleMark();
    }
}