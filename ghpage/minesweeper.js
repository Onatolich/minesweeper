var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("base/BaseEventsInterface", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("base/EventObjectInterface", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("base/BaseClass", ["require", "exports"], function (require, exports) {
    "use strict";
    var BaseClass = (function () {
        function BaseClass() {
            this._events = [];
        }
        BaseClass.prototype.trigger = function (event, args) {
            for (var _i = 0, _a = this._events; _i < _a.length; _i++) {
                var eventObj = _a[_i];
                if (eventObj.name !== event) {
                    continue;
                }
                eventObj.handler.apply(eventObj.context || this, args);
            }
        };
        BaseClass.prototype.listenTo = function (obj, event, handler) {
            obj.on(event, handler, this);
        };
        BaseClass.prototype.stopListening = function (obj, event) {
            obj.off(event, this);
        };
        BaseClass.prototype.on = function (event, handler, context) {
            var eventObj = {
                name: event,
                handler: handler,
                context: context
            };
            this._events.push(eventObj);
        };
        BaseClass.prototype.off = function (event, context) {
            for (var i in this._events) {
                if (!this._events.hasOwnProperty(i)) {
                    continue;
                }
                var eventObj = this._events[i];
                if (eventObj.name !== event) {
                    continue;
                }
                if (!context || eventObj.context === context) {
                    delete this._events[i];
                }
            }
        };
        return BaseClass;
    }());
    exports.BaseClass = BaseClass;
});
define("base/BaseView", ["require", "exports", "base/BaseClass"], function (require, exports, BaseClass_1) {
    "use strict";
    var BaseView = (function (_super) {
        __extends(BaseView, _super);
        function BaseView(element, options) {
            _super.call(this);
            this.el = element;
        }
        return BaseView;
    }(BaseClass_1.BaseClass));
    exports.BaseView = BaseView;
});
define("components/Cell", ["require", "exports", "base/BaseView"], function (require, exports, BaseView_1) {
    "use strict";
    (function (CellTypes) {
        CellTypes[CellTypes["Regular"] = 0] = "Regular";
        CellTypes[CellTypes["Mine"] = 1] = "Mine";
    })(exports.CellTypes || (exports.CellTypes = {}));
    var CellTypes = exports.CellTypes;
    var Cell = (function (_super) {
        __extends(Cell, _super);
        function Cell(element, data) {
            _super.call(this, element, data);
            this.data = data;
            this.update();
            this.initEvents();
        }
        Cell.prototype.update = function () {
            if (this.data.type !== CellTypes.Mine && this.data.dangerRate > 0 && !this.data.closed) {
                this.el.innerHTML = this.data.dangerRate.toString();
            }
            this.actualizeClass();
        };
        Cell.prototype.isMine = function () {
            return this.data.type === CellTypes.Mine;
        };
        Cell.prototype.isMarked = function () {
            return this.data.marked;
        };
        Cell.prototype.destroy = function () {
            this.el.removeEventListener('click', this.onClick);
            this.el.removeEventListener('contextmenu', this.onRightClick);
        };
        Cell.prototype.initEvents = function () {
            this.el.addEventListener('click', this.onClick.bind(this));
            this.el.addEventListener('contextmenu', this.onRightClick.bind(this));
        };
        Cell.prototype.open = function () {
            this.data.closed = false;
            this.trigger('open', [this.data]);
            this.update();
        };
        Cell.prototype.toggleMark = function () {
            this.data.marked = !this.data.marked;
            this.trigger('mark', [this.data]);
            this.update();
        };
        Cell.prototype.actualizeClass = function () {
            var classes = [];
            if (!this.data.closed) {
                classes.push('open');
                if (this.data.type === CellTypes.Mine) {
                    classes.push('mine');
                }
                else if (this.data.dangerRate > 0) {
                    classes.push('danger-' + this.data.dangerRate);
                }
            }
            else if (this.data.marked) {
                classes.push('marked');
            }
            this.el.className = classes.join(' ');
        };
        Cell.prototype.onClick = function (e) {
            e.preventDefault();
            this.open();
        };
        Cell.prototype.onRightClick = function (e) {
            e.preventDefault();
            this.toggleMark();
        };
        return Cell;
    }(BaseView_1.BaseView));
    exports.Cell = Cell;
});
define("components/Battlefield", ["require", "exports", "base/BaseView", "components/Cell"], function (require, exports, BaseView_2, Cell_1) {
    "use strict";
    var BattlefieldEvents = (function () {
        function BattlefieldEvents() {
        }
        BattlefieldEvents.MineClicked = 'MineClicked';
        BattlefieldEvents.NoSecureCellsLeft = 'NoSecureCellsLeft';
        return BattlefieldEvents;
    }());
    exports.BattlefieldEvents = BattlefieldEvents;
    var Battlefield = (function (_super) {
        __extends(Battlefield, _super);
        function Battlefield(element, data) {
            _super.call(this, element, data);
            this.cells = [];
            this.data = data;
        }
        Battlefield.prototype.generate = function () {
            if (this.data.mines > (this.data.rows * this.data.cells) / 2) {
                throw new Error('Mines count must be less then half of total cells count.');
            }
            this.clear();
            this.generateCells();
            this.generateMines();
            this.updateDangerRates();
        };
        Battlefield.prototype.generateCells = function () {
            var rowElement;
            for (var i = 0; i < this.data.rows * this.data.cells; i++) {
                if (!(i % this.data.cells)) {
                    rowElement = document.createElement('tr');
                    this.el.appendChild(rowElement);
                }
                rowElement.appendChild(this.generateCell(i));
            }
        };
        Battlefield.prototype.generateCell = function (index) {
            var cellElement = document.createElement('td');
            this.cells[index] = new Cell_1.Cell(cellElement, {
                type: Cell_1.CellTypes.Regular,
                closed: true,
                marked: false,
                dangerRate: 0
            });
            return cellElement;
        };
        Battlefield.prototype.generateMines = function () {
            var minesLeft = this.data.mines;
            var cellsCount = this.data.cells * this.data.rows;
            while (minesLeft > 0) {
                var index = Math.round(Math.random() * (cellsCount - 1) + 1);
                var cell = this.cells[index];
                if (cell.isMine()) {
                    continue;
                }
                --minesLeft;
                cell.data.type = Cell_1.CellTypes.Mine;
                cell.update();
            }
        };
        Battlefield.prototype.updateDangerRates = function () {
            for (var i = 0; i < this.cells.length; i++) {
                this.updateDangerRate(i);
            }
        };
        Battlefield.prototype.updateDangerRate = function (index) {
            var cell = this.cells[index];
            cell.data.dangerRate = 0;
            if (cell.isMine()) {
                return;
            }
            var relatedIndexes = [];
            var topIndex = index - this.data.cells;
            var bottomIndex = index + this.data.cells;
            relatedIndexes = relatedIndexes.concat([topIndex - 1, topIndex, topIndex + 1]);
            relatedIndexes = relatedIndexes.concat([index - 1, index + 1]);
            relatedIndexes = relatedIndexes.concat([bottomIndex - 1, bottomIndex, bottomIndex + 1]);
            for (var _i = 0, relatedIndexes_1 = relatedIndexes; _i < relatedIndexes_1.length; _i++) {
                var i = relatedIndexes_1[_i];
                if (this.cells[i] instanceof Cell_1.Cell && this.cells[i].isMine()) {
                    ++cell.data.dangerRate;
                }
            }
            cell.update();
        };
        Battlefield.prototype.clear = function () {
            for (var i in this.cells) {
                if (!this.cells.hasOwnProperty(i)) {
                    continue;
                }
                var cell = this.cells[i];
                cell.destroy();
                this.el.removeChild(cell.el);
                delete this.cells[i];
            }
        };
        return Battlefield;
    }(BaseView_2.BaseView));
    exports.Battlefield = Battlefield;
});
define("components/Notices", ["require", "exports", "base/BaseView"], function (require, exports, BaseView_3) {
    "use strict";
    var Notices = (function (_super) {
        __extends(Notices, _super);
        function Notices() {
            _super.apply(this, arguments);
            this.clearDelay = 3000;
        }
        Notices.prototype.displayRegular = function (text, delay) {
            this.display('regular', text, delay);
        };
        Notices.prototype.displaySuccess = function (text, delay) {
            this.display('success', text, delay);
        };
        Notices.prototype.displayDanger = function (text, delay) {
            this.display('danger', text, delay);
        };
        Notices.prototype.display = function (type, text, delay) {
            this.el.className = type;
            this.el.innerHTML = text;
            if (delay !== -1) {
                this.setClearTimeout(delay);
            }
        };
        Notices.prototype.setClearTimeout = function (delay) {
            clearTimeout(this.clearTimer);
            this.clearTimer = setTimeout(this.clear.bind(this), delay || this.clearDelay);
        };
        Notices.prototype.clear = function () {
            this.el.className = '';
            this.el.innerHTML = '';
        };
        return Notices;
    }(BaseView_3.BaseView));
    exports.Notices = Notices;
});
define("components/Game", ["require", "exports", "base/BaseView", "components/Battlefield", "components/Notices"], function (require, exports, BaseView_4, Battlefield_1, Notices_1) {
    "use strict";
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(element) {
            _super.call(this, element);
            var battlefieldContainer = document.getElementById('battlefield');
            this.battlefield = new Battlefield_1.Battlefield(battlefieldContainer, {
                cells: 0,
                rows: 0,
                mines: 0
            });
            var noticeAreaElement = document.getElementById('noticeArea');
            this.notices = new Notices_1.Notices(noticeAreaElement);
            this.notices.displayRegular('Hello!');
            this.restartButton = document.getElementById('restart');
            this.cover = document.getElementById('cover');
            this.updatePosition();
            this.initEvents();
            this.startGame();
        }
        Game.prototype.handleError = function (e) {
            this.notices.displayDanger(e.message);
        };
        Game.prototype.startGame = function () {
            this.notices.displayRegular('Game started. Good luck!', -1);
            this.battlefield.data = {
                cells: 10,
                rows: 10,
                mines: 10
            };
            this.battlefield.generate();
            this.updatePosition();
        };
        Game.prototype.updatePosition = function () {
            var el = this.el;
            el.style.marginLeft = -this.el.clientHeight / 2 + 'px';
            el.style.marginTop = -this.el.clientWidth / 2 + 'px';
        };
        Game.prototype.initEvents = function () {
            this.listenTo(this.battlefield, Battlefield_1.BattlefieldEvents.MineClicked, this.loose);
            this.listenTo(this.battlefield, Battlefield_1.BattlefieldEvents.NoSecureCellsLeft, this.win);
            this.restartButton.addEventListener('click', Game.onRestartButtonClick);
        };
        Game.prototype.loose = function () {
            this.notices.displayDanger('You lost!', -1);
            this.endGame();
        };
        Game.prototype.win = function () {
            this.notices.displaySuccess('Congrats! You win! :)', -1);
            this.endGame();
        };
        Game.prototype.endGame = function () {
            this.el.className = 'game-over';
            this.restartButton.className = '';
            this.cover.className = '';
        };
        Game.onRestartButtonClick = function (e) {
            e.preventDefault();
            window.location.reload();
        };
        return Game;
    }(BaseView_4.BaseView));
    exports.Game = Game;
});
define("minesweeper", ["require", "exports", "components/Game"], function (require, exports, Game_1) {
    "use strict";
    var container = document.getElementById('minesweeper');
    var game = new Game_1.Game(container);
    window.onerror = function () {
        game.handleError(arguments[4]);
    };
});
//# sourceMappingURL=minesweeper.js.map