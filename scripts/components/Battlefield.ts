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
    cells: Cell[][] = [];

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
        for (let i = 0; i < this.data.rows; i++) {
            this.cells[i] = <Cell[]>[];
            let rowElement = document.createElement('tr');
            this.el.appendChild(rowElement);

            for (let j = 0; j < this.data.cells; j++) {
                let cell = this.generateCell([i, j]);
                rowElement.appendChild(cell.el);
                this.cells[i][j] = cell;
            }
        }
    }

    private generateCell(index: [number, number]): Cell {
        let cell = new Cell(document.createElement('td'), {
            type: CellTypes.Regular,
            index: index,
            closed: true,
            marked: false,
            dangerRate: 0
        });
        
        this.bindCellEvents(cell);
        return cell;
    }

    private generateMines() {
        let minesLeft = this.data.mines;

        while (minesLeft > 0) {
            let rowIndex = Math.round(Math.random() * (this.data.rows - 1));
            let cellIndex = Math.round(Math.random() * (this.data.cells - 1));

            let cell: Cell = this.cells[rowIndex][cellIndex];

            if (cell.isMine()) {
                continue;
            }
            --minesLeft;

            cell.data.type = CellTypes.Mine;
            cell.update();
        }
    }
    
    private bindCellEvents(cell: Cell) {
        this.listenTo(cell, 'open', this.onCellOpen);
    }

    private updateDangerRates() {
        for (let i = 0; i < this.data.rows; i++) {
            for (let j = 0; j < this.data.cells; j++) {
                this.updateDangerRate(this.cells[i][j]);
            }
        }
    }

    private updateDangerRate(cell: Cell) {
        cell.data.dangerRate = 0;

        if (cell.isMine()) {
            return;
        }

        let neighbourCells: Cell[] = this.getAllNeighbourCells(cell.data.index);

        for (let neighbourCell of neighbourCells) {
            if (neighbourCell.isMine()) {
                ++cell.data.dangerRate;
            }
        }
        cell.update();
    }
    
    private getAllNeighbourCells(index: [number, number]): Cell[] {
        let cells: Cell[] = [];

        let topIndex = [index[0] - 1, index[1]];
        let bottomIndex = [index[1] + 1, index[1]];

        let topRow = [[topIndex[0], topIndex[1] - 1], topIndex, [topIndex[0], topIndex[1] + 1]];
        let currentRow = [[index[0], index[1] - 1], [index[0], index[1] + 1]];
        let bottomRow = [[bottomIndex[0], bottomIndex[1] - 1], bottomIndex, [bottomIndex[0], bottomIndex[1] + 1]];

        let indexes = topRow.concat(currentRow).concat(bottomRow);

        for (let neighbourIndex of indexes) {
            if (neighbourIndex[0] < 0 || neighbourIndex[0] > this.data.rows - 1) {
                continue;
            }
            if (neighbourIndex[1] < 0 || neighbourIndex[1] > this.data.cells - 1) {
                continue;
            }
            cells.push(this.cells[neighbourIndex[0]][neighbourIndex[1]]);
        }

        return cells;
    }

    private clear() {
        for (let i in this.cells) {
            if (!this.cells.hasOwnProperty(i)) {
                continue;
            }
            let row = this.cells[i];

            for (let j in row) {
                if (!row.hasOwnProperty(j)) {
                    continue;
                }
                let cell = row[j];

                cell.destroy();
                this.el.removeChild(cell.el);
                delete this.cells[i][j];
            }
            delete this.cells[i];
        }
    }

    private openNeighbourCells(cell: Cell) {
        let neighbours = this.getAllNeighbourCells(cell.data.index);

        for (let neighbourCell of neighbours) {
            if (!neighbourCell.data.closed) {
                continue;
            }
            if (!neighbourCell.data.dangerRate) {
                this.openNeighbourCells(neighbourCell);
            }
            neighbourCell.open();
        }
    }
    
    private onCellOpen(cell: Cell) {
        if (cell.isMine()) {
            this.trigger(BattlefieldEvents.MineClicked);
            return;
        }

        if (!cell.data.dangerRate) {
            this.openNeighbourCells(cell);
        }
    }
}