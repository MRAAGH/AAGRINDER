
// let blocked_keys = [9, 35, 36, 70, 71];
let blocked_keys = [8, 9];
let key_states = [];

let socket;

let mycanvas;
let cliterminal;
let guiterminal;
let bigterminal;
let cli;
let gui;
let cliMode = true;
const CLI_SIZE = 0.25;
const MIN_CANVAS_WIDTH = 200;


$("document").ready(function () {



	mycanvas = document.getElementById("terminal");

	cliterminal = new Terminal(mycanvas,10,10,0);
	guiterminal = new Terminal(mycanvas,10,10,10);
	bigterminal = new BigTerminal(cliterminal);
	cli = new Cli(bigterminal);
	gui = new Gui(guiterminal);

	//Align everything for the first time:
	onResize(undefined);

	bigterminal.println('AAGRINDER');
	bigterminal.println('');

	cli.prompt('login: ');


	//Request socket connection from server:
	socket = io();
	console.log("Attempting to connect");

	// Start listening for events
	setEventHandlers();
});

let setEventHandlers = function () {
	// Keyboard
	// window.addEventListener("keypress", onKeypress, false);
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnected);
	// socket.on("w", onWelcome);
	// socket.on("t", onTerrainUpdate);
	socket.on("loginsuccess", data=>{
		console.log('loginsuccess', data)
		bigterminal.println(data)
	});
	socket.on("loginerror", data=>{
		console.log('loginerror', data)
		bigterminal.println(data)
	});
};

function onSocketConnected(data){
	console.log('conn', data)
	bigterminal.println('connected to server');
}
function onSocketDisconnected(data){
	console.log('disconn', data)
	bigterminal.println('disconnected from server');
}

function onKeydown(e) {
	if (blocked_keys.indexOf(e.keyCode) > -1) {
		e.preventDefault(); //Prevent some of the browser's key bindings
	}
	if(cliMode){
		if(!cli.handleKey(e.key)){
			// cli did not handle it, let's do something else.

			switch(e.key){
				case 'Backspace':
				cli.backspace();
				break;
				case 'PageUp':
				bigterminal.scrollUp();
				break;
				case 'PageDown':
				bigterminal.scrollDown();
				break;
				case 'End':
				bigterminal.scrollToEnd();
				break;
				case 'ArrowUp':
				cli.up();
				break;
				case 'ArrowDown':
				cli.down();
				break;
				case 'ArrowLeft':
				cli.left();
				break;
				case 'ArrowRight':
				cli.right();
				break;
				case 'Enter':
				let result = cli.commit();
				cli.prompt('lalala ')
				console.log(result);
				break;
				default:
				console.log('ignored key: ' + e.key);
			}
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
// 	if(cliMode){
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
// };

// Keyboard key up
function onKeyup(e) {
	key_code = e.keyCode;
	if (blocked_keys.indexOf(key_code) > -1) {
		e.preventDefault(); //Prevent some of the browser's key bindings
	}
	if (key_states[key_code]) {
		key_states[key_code] = false;
		//Do key action.
		/*switch (key_code) {
		case 37: // Left
		break;
	};*/
}
};

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
