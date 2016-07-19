import {BaseView} from "../base/BaseView";
import {Battlefield, BattlefieldEvents} from "./Battlefield";
import {Notices} from "./Notices";

class GameDifficults {
    static easy = {
        cells: 10,
        rows: 10,
        mines: 10
    };

    static medium = {
        cells: 20,
        rows: 20,
        mines: 40
    };

    static hard = {
        cells: 40,
        rows: 20,
        mines: 100
    };
}

export class Game extends BaseView {
    private battlefield: Battlefield;
    private notices: Notices;
    private restartButton: Element;
    private difficultPopup: Element;

    constructor(element: Element) {
        super(element);

        let battlefieldContainer = document.getElementById('battlefield');
        this.battlefield = new Battlefield(battlefieldContainer, {
            cells: 0,
            rows: 0,
            mines: 0
        });
        
        let noticeAreaElement = document.getElementById('noticeArea');
        this.notices = new Notices(noticeAreaElement);

        this.notices.displayRegular('Hello!');

        this.restartButton = document.getElementById('restart');
        this.difficultPopup = document.getElementById('difficult');

        this.updatePosition();
        this.initEvents();
    }

    handleError(e: Error) {
        this.notices.displayDanger(e.message);
    }

    private startGame(difficult: string = 'easy') {
        this.el.className = difficult;
        this.difficultPopup.className = 'hidden';
        this.notices.displayRegular('Game started. Good luck!', -1);

        this.battlefield.data = GameDifficults[difficult];

        this.battlefield.generate();
        this.updatePosition();
    }

    private updatePosition() {
        let el = <HTMLScriptElement>this.el;
        el.style.marginLeft = -el.offsetWidth / 2 + 'px';
        el.style.marginTop = -el.offsetHeight / 2 + 'px';
    }

    private initEvents() {
        this.listenTo(this.battlefield, BattlefieldEvents.MineClicked, this.loose);
        this.listenTo(this.battlefield, BattlefieldEvents.NoSecureCellsLeft, this.win);

        this.restartButton.addEventListener('click', Game.onRestartButtonClick);

        let difficultButtons = this.difficultPopup.getElementsByTagName('button');
        for (let i = 0; i < difficultButtons.length; i++) {
            let button = difficultButtons.item(i);
            button.addEventListener('click', this.startGame.bind(this, button.value));
        }
    }

    private loose() {
        this.notices.displayDanger('You lost!', -1);
        this.endGame();
    }

    private win() {
        this.notices.displaySuccess('Congrats! You win! :)', -1);
        this.endGame();
    }

    private endGame() {
        this.battlefield.showAllMines();
        this.el.className = 'game-over';
    }

    private static onRestartButtonClick(e: Event) {
        e.preventDefault();
        window.location.reload();
    }
}