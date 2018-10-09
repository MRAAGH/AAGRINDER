/*
 * Main client script file.
 * I try to put code elsewhere.
 */

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
let cli;
const keys = new Keys();
let login;

$('document').ready(function () {
  socket = io();
  mycanvas = document.getElementById('terminal');
  cliterminal = new Terminal(mycanvas,10,10,0);
  guiterminal = new Terminal(mycanvas,10,10,10);
  bigterminal = new BigTerminal(cliterminal);
  cli = new Cli(bigterminal);
  login = new Login(cli, guiterminal, socket, keys);

  //Align everything for the first time:
  onResize(undefined);

  bigterminal.println('connecting...');


  setInterval(()=>cli.blink(), 500);


  window.addEventListener('keydown', onKeydown, false);
  window.addEventListener('keyup', onKeyup, false);

  window.addEventListener('focus', event=>login.focus(), false);
  window.addEventListener('blur', event=>login.blur(), false);

  window.addEventListener('resize', onResize, false);
});

function onKeydown(e) {
  if (BLOCKED_KEYS.indexOf(e.keyCode) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  cli.handleKey(e.key);
  keys.handleKeyDown(e.keyCode);
  login.handleKeyDown(e.keyCode);
}

function onKeyup(e) {
  if (BLOCKED_KEYS.indexOf(e.keyCode) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  keys.handleKeyUp(e.keyCode);
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
