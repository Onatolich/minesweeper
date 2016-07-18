import {BaseView} from "../base/BaseView";
import {Cell, CellTypes} from "./Cell";

export class BattlefieldEvents {
    static MineClicked = 'MineClicked';
    static NoSecureCellsLeft = 'NoSecureCellsLeft';
}

interface BattlefieldData {
    cells: number,
    rows: number,
    mines: number
}

export class Battlefield extends BaseView {
    data: BattlefieldData;
    cells: Cell[] = [];

    constructor(element: Element, data: BattlefieldData) {
        super(element, data);

        this.data = data;
    }

    generate() {
        if (this.data.mines > (this.data.rows * this.data.cells) / 2) {
            throw new Error('Mines count must be less then half of total cells count.');
        }

        this.clear();

        this.generateCells();
        this.generateMines();
        this.updateDangerRates();
    }

    private generateCells() {
        let rowElement: Element;
        for (let i = 0; i < this.data.rows * this.data.cells; i++) {
            if (!(i % this.data.cells)) {
                rowElement = document.createElement('tr');
                this.el.appendChild(rowElement);
            }
            rowElement.appendChild(this.generateCell(i));
        }
    }

    private generateCell(index: number): Element {
        let cellElement = document.createElement('td');

        this.cells[index] = new Cell(cellElement, {
            type: CellTypes.Regular,
            closed: true,
            marked: false,
            dangerRate: 0
        });

        return cellElement;
    }

    private generateMines() {
        let minesLeft = this.data.mines;
        let cellsCount = this.data.cells * this.data.rows;

        while (minesLeft > 0) {
            let index = Math.round(Math.random() * (cellsCount - 1) + 1);

            let cell: Cell = this.cells[index];

            if (cell.isMine()) {
                continue;
            }
            --minesLeft;

            cell.data.type = CellTypes.Mine;
            cell.update();
        }
    }

    private updateDangerRates() {
        for (let i = 0; i < this.cells.length; i++) {
            this.updateDangerRate(i);
        }
    }

    private updateDangerRate(index: number) {
        let cell: Cell = this.cells[index];
        cell.data.dangerRate = 0;

        if (cell.isMine()) {
            return;
        }

        let relatedIndexes: number[] = [];

        let topIndex = index - this.data.cells;
        let bottomIndex = index + this.data.cells;
        relatedIndexes = relatedIndexes.concat([topIndex - 1, topIndex, topIndex + 1]); // Top row
        relatedIndexes = relatedIndexes.concat([index - 1, index + 1]); // Current row
        relatedIndexes = relatedIndexes.concat([bottomIndex - 1, bottomIndex, bottomIndex + 1]); // Bottom row

        for (let i of relatedIndexes) {
            if (this.cells[i] instanceof Cell && this.cells[i].isMine()) {
                ++cell.data.dangerRate;
            }
        }
        cell.update();
    }

    private clear() {
        for (let i in this.cells) {
            if (!this.cells.hasOwnProperty(i)) {
                continue;
            }

            let cell = this.cells[i];
            cell.destroy();
            this.el.removeChild(cell.el);
            delete this.cells[i];
        }
    }
}