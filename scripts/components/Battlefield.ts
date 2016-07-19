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
        this.clear();

        this.generateCells();
        this.generateMines();
        this.updateDangerRates();
    }

    showAllMines() {
        for (let row of this.cells) {
            for (let cCell of row) {
                if (cCell.isMine()) {
                    cCell.data.closed = false;
                    cCell.update();
                }
            }
        }
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
            clicked: false,
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
    
    private getAllNeighbourCells(index: [number, number], onlyClosed?: boolean): Cell[] {
        let cells: Cell[] = [];
        let indexes: number[][] = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                indexes.push([index[0] + i, index[1] + j]);
            }
        }

        for (let neighbourIndex of indexes) {
            if (neighbourIndex[0] < 0 || neighbourIndex[0] > this.data.rows - 1) {
                continue;
            }
            if (neighbourIndex[1] < 0 || neighbourIndex[1] > this.data.cells - 1) {
                continue;
            }
            let cell = this.cells[neighbourIndex[0]][neighbourIndex[1]];
            if (!onlyClosed || cell.data.closed) {
                cells.push(cell);
            }
        }

        return cells;
    }

    private openNeighbourCells(cell: Cell) {
        let neighbours = this.getAllNeighbourCells(cell.data.index, true);

        for (let nCell of neighbours) {
            nCell.open(true);
            if (nCell.data.dangerRate === 0) {
                this.openNeighbourCells(nCell);
            }
        }
    }

    private analyzeCells() {
        for (let row of this.cells) {
            for (let cell of row) {
                if (!cell.isMine() && cell.data.closed) {
                    return;
                }
            }
        }
        this.trigger(BattlefieldEvents.NoSecureCellsLeft);
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
    
    private onCellOpen(cell: Cell) {
        if (cell.isMine()) {
            this.trigger(BattlefieldEvents.MineClicked);
            return;
        }

        if (!cell.data.dangerRate) {
            this.openNeighbourCells(cell);
        }

        this.analyzeCells();
    }
}