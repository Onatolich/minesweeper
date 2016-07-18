import {Game} from "./components/Game";

let container = document.getElementById('minesweeper');
let game = new Game(container);

window.onerror = function() {
    game.handleError(arguments[4]);
};