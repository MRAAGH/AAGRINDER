
// let BLOCKED_KEYS = [9, 35, 36, 70, 71];
const BLOCKED_KEYS = [8, 9, 33, 34, 35, 36, 37, 38, 39, 40, 191, 111];
const CLI_SIZE = 0.25;
const MIN_CANVAS_WIDTH = 200;
const STATES = Object.freeze({ // enum
  loginscreen: 0,
  loginpassword: 1,
  loginwait: 2,
  registerscreen: 3,
  registerpassword: 4,
  registerpassword2: 5,
  registerwait: 6,
  ingame: 7,
  connecting: 8
});

let key_states = [];

let socket;

let mycanvas;
let cliterminal;
let guiterminal;
let bigterminal;
let cli;
let gui;
let cliFocused = true;
let state = STATES.connecting;
let player;
let syncher;
let map;


let name = '';
let registration = {};

$('document').ready(function () {



  mycanvas = document.getElementById('terminal');

  cliterminal = new Terminal(mycanvas,10,10,0);
  guiterminal = new Terminal(mycanvas,10,10,10);
  bigterminal = new BigTerminal(cliterminal);
  cli = new Cli(bigterminal);

  //Align everything for the first time:
  onResize(undefined);

  bigterminal.println('connecting...');

  setInterval(()=>cli.blink(), 500);
  setInterval(()=>{
    if(state === STATES.ingame){

      //game tick goes here

      
      gui.display();

    }
  }, 100);

  //Request socket connection from server:
  socket = io();

  // Start listening for events
  setEventHandlers();
});

let setEventHandlers = function () {
  // Keyboard
  // window.addEventListener("keypress", onKeypress, false);
  window.addEventListener('keydown', onKeydown, false);
  window.addEventListener('keyup', onKeyup, false);

  window.addEventListener('focus', event=>{
    cli.focus();
  }, false);
  window.addEventListener('blur', event=>{
    cli.blur();
  }, false);


  // Window resize
  window.addEventListener('resize', onResize, false);

  socket.on('connect', data=>{
    bigterminal.println('');
    bigterminal.println('');
    bigterminal.println('AAGRINDER');
    bigterminal.println('');
    bigterminal.println('try /register');
    bigterminal.println('');
    cli.prompt('login: ');
    state = STATES.loginscreen;
  });

  socket.on('disconnect', data=>{
    bigterminal.println('disconnected.');
    cli.prompt('login: ');
    state = STATES.loginscreen;
  });

  socket.on('loginsuccess', data=>{
    bigterminal.println('login successful');
    if(state === STATES.loginwait){
      cli.promptCommand('> ');
      state = STATES.ingame;
      startGame();
    }
  });

  socket.on('loginerror', data=>{
    bigterminal.println(data.message);
    if(state === STATES.loginwait){
      cli.prompt('login: ');
      state = STATES.loginscreen;
    }
  });

  socket.on('t', data=>{ // terrain update
    syncher.applyTerrainUpdate(data);
  });

  socket.on('p', data=>{ // player update
    player.applyPlayerUpdate(data);
  });
};

function startGame(){
  player = new Player();
  map = new Map();
  syncher = new Syncher(map, player);
  gui = new Gui(guiterminal, map, player);
  cliFocused = false;

}

function onKeydown(e) {
  if (BLOCKED_KEYS.indexOf(e.keyCode) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  if(cliFocused){
    let result = cli.handleKey(e.key);
    if(result !== false) {
      // we got back what the user typed

      switch(state){

      case STATES.connecting:
        // nothing
        break;

      case STATES.loginscreen:
        if(result.length === 0){
          // nothing was typed ... redisplay form
          cli.prompt('login: ');
        }
        else{
          // is it /register?
          if(result === '/register'){
            // straight to registration
            cli.prompt('name: ');
            state = STATES.registerscreen;
          }
          else{
            // alright got username
            name = result;
            // prompt for password
            cli.promptPassword('password for ' + name + ': ');
            state = STATES.loginpassword;
          }
        }
        break;

      case STATES.loginpassword:
        if(result.length === 0){
          // nothing was typed ... redisplay form
          cli.promptPassword('password for ' + name + ': ');
        }
        else{
          // alright got username and password
          let password = result;
          // try to login
          socket.emit('login', {
            username: name,
            password: password
          });
          // and now we wait
          state = STATES.loginwait;
        }
        break;

      case STATES.loginwait:
        // nothing
        break;

      case STATES.registerscreen:
        if(result.length === 0){
          // nothing was typed ... redisplay form
          cli.prompt('name: ');
        }
        else{
          // alright got username
          registration.name = result;
          // prompt for password
          cli.promptPassword('choose password: ');
          state = STATES.registerpassword;
        }
        break;

      case STATES.registerpassword:
        if(result.length === 0){
          // nothing was typed ... redisplay form
          cli.promptPassword('choose password: ');
        }
        else{
          // alright got username
          registration.password = result;
          // prompt for password
          cli.promptPassword('repeat password: ');
          state = STATES.registerpassword2;
        }
        break;

      case STATES.registerpassword2:

        if(result.length === 0){
          // nothing was typed ... redisplay form
          cli.promptPassword('repeat password: ');
        }
        else{
          // alright got username and password
          let password2 = result;

          if(registration.password !== password2){
            bigterminal.println('passwords do not match');
            cli.prompt('login: ');
            state = STATES.loginscreen;
            registration = {};
          }
          else {
            // try to register
            bigterminal.println('requesting registration ...');

            let data = 'name=' + encodeURIComponent(registration.name) + '&password=' + encodeURIComponent(registration.password);
            registration = {};

            state = STATES.registerwait;

            $.ajax({
              type: 'POST',
              url: '/api/users/register',
              data: data,
              processData: false,
              success: function(msg) {
                bigterminal.println(msg.message);
                cli.prompt('login: ');
                state = STATES.loginscreen;
              }
            });
          }
        }
        break;

      case STATES.registerwait:
        // nothing
        break;

      case STATES.ingame:
        // either chat or an in-game command

        cli.promptCommand('> ');

        break;

      }
    }
  }
  //
  // // Keyboard key down
  // function onKeydown(e) {
  // return;
  // 	let keynum;
  //
  // 	if(window.event) { // IE
  // 		keynum = e.keyCode;
  // 	} else if(e.which){ // Netscape/Firefox/Opera
  // 		keynum = e.which;
  // 		//console.log(e.which);
  // 		//console.log(e)
  // 	}
  //
  // 	if(cliFocused){
  // 		if(!cli.handleKey(keynum)){
  // 			// cli did not handle it, let's do something else.
  //
  // 		}
  // 	}
  //
  //
  // 	key_code = e.keyCode;
  // 	if (!key_states[key_code]) {
  // 		key_states[key_code] = true;
  // 	}
}

// Keyboard key up
function onKeyup(e) {
  key_code = e.keyCode;
  if (BLOCKED_KEYS.indexOf(key_code) > -1) {
    e.preventDefault(); //Prevent some of the browser's key bindings
  }
  if (key_states[key_code]) {
    key_states[key_code] = false;
    //Do key action.
    /*
		switch (key_code) {
		case 37: // Left
		break;
	};
	*/
  }
}

// Browser window resize
function onResize(e) {
  let w = window.innerWidth;
  let h = window.innerHeight;
  if(w > MIN_CANVAS_WIDTH){ // only apply resize if the canvas is reasonably big
    mycanvas.width = w;
    mycanvas.height = h;
    let charWidth = Math.floor((mycanvas.width - 2 * PADDING) / CHAR_WIDTH) - 1;
    let charWidthLeft = Math.floor(charWidth * CLI_SIZE);
    let charWidthRight = charWidth - charWidthLeft;
    let charHeight = Math.floor((mycanvas.height - 2 * PADDING) / LINE_SPACING);
    cliterminal.resize(charWidthLeft, charHeight, 0);
    guiterminal.resize(charWidthRight, charHeight, charWidthLeft);
    bigterminal.reformat();
  }
}


// function myKeyPress(e){
// 	let keynum;
//
// 	if(window.event) { // IE
// 		keynum = e.keyCode;
// 	} else if(e.which){ // Netscape/Firefox/Opera
// 		keynum = e.which;
// 		//console.log(e.which);
// 		//console.log(e)
// 	}
//
// 	cli.handleKey(keynum);
//
// 	//console.log(String.fromCharCode(keynum));
// }
