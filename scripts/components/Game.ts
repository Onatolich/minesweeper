import {BaseView} from "../base/BaseView";
import {Battlefield, BattlefieldEvents} from "./Battlefield";
import {Notices} from "./Notices";

export class Game extends BaseView {
    private battlefield: Battlefield;
    private notices: Notices;
    private restartButton: Element;
    private cover: Element;

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
        this.cover = document.getElementById('cover');

        this.updatePosition();
        this.initEvents();
        this.startGame();
    }

    handleError(e: Error) {
        this.notices.displayDanger(e.message);
    }

    private startGame() {
        this.notices.displayRegular('Game started. Good luck!', -1);

        this.battlefield.data = {
            cells: 10,
            rows: 10,
            mines: 10
        };

        this.battlefield.generate();
        this.updatePosition();
    }

    private updatePosition() {
        let el = <HTMLScriptElement>this.el;
        el.style.marginLeft = -this.el.clientHeight / 2 + 'px';
        el.style.marginTop = -this.el.clientWidth / 2 + 'px';
    }

    private initEvents() {
        this.listenTo(this.battlefield, BattlefieldEvents.MineClicked, this.loose);
        this.listenTo(this.battlefield, BattlefieldEvents.NoSecureCellsLeft, this.win);

        this.restartButton.addEventListener('click', Game.onRestartButtonClick);
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
        this.el.className = 'game-over';
        this.restartButton.className = '';
        this.cover.className = '';
    }

    private static onRestartButtonClick(e: Event) {
        e.preventDefault();
        window.location.reload();
    }
}