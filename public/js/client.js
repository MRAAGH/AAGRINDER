if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

const BLOCKED_KEYS = [8, 9, 33, 34, 35, 36, 37, 38, 39, 40, 191, 111];
const CLI_SIZE = 0.3;
const MIN_CANVAS_WIDTH = 200;

let mycanvas;
let cliterminal;
let guiterminal;
let bigterminal;
let game;
let login;
let cli;
let keys = new Keys();

$('document').ready(function () {
  socket = io();
  mycanvas = document.getElementById('terminal');
  cliterminal = new Terminal(mycanvas,10,10,0);
  guiterminal = new Terminal(mycanvas,10,10,10);
  bigterminal = new BigTerminal(cliterminal);
  cli = new Cli(bigterminal);
  game = new Game(cli, guiterminal, socket, keys);
  login = new Login(cli, game, socket);

  //Align everything for the first time:
  onResize(undefined);

  bigterminal.println('connecting...');


  setInterval(()=>cli.blink(), 500);
  setInterval(()=>game.gameTick(), 100);


  window.addEventListener('keydown', onKeydown, false);
  window.addEventListener('keyup', onKeyup, false);

  window.addEventListener('focus', event=>login.focus(), false);
  window.addEventListener('blur', event=>login.blur(), false);

  window.addEventListener('mousemove', onMouseMove, false);

  window.addEventListener('resize', onResize, false);
});

// function focusCli(){
//   cli.focus();
//   bigterminal.scrollToEnd();
// }
//
// function focusGui(){
//   cli.blur();
// }

function onMouseMove(e){
  //TODO: should be in game.js
  // IMPORTANT gui.handleMouse(e);
}

function onKeydown(e) {
  if (BLOCKED_KEYS.indexOf(e.keyCode) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  cli.handleKey(e.key);
  keys.handleKeyDown(e);
}

function onKeyup(e) {
  if (BLOCKED_KEYS.indexOf(e.keyCode) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  keys.handleKeyUp(e);
}

// Browser window resize
function onResize(e) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if(w > MIN_CANVAS_WIDTH){ // only apply resize if the canvas is reasonably big
    mycanvas.width = w;
    mycanvas.height = h;
    const charWidth = Math.floor((mycanvas.width - 2 * PADDING) / CHAR_WIDTH) - 1;
    const charWidthLeft = Math.floor(charWidth * CLI_SIZE);
    const charWidthRight = charWidth - charWidthLeft;
    const charHeight = Math.floor((mycanvas.height - 2 * PADDING) / LINE_SPACING);
    cliterminal.resize(charWidthLeft - 2, charHeight, 0);
    guiterminal.resize(charWidthRight, charHeight, charWidthLeft);
    bigterminal.reformat();
  }
}
