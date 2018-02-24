
let blocked_keys = [9, 35, 36, 70, 71];
let key_states = [];

let socket;

let terminal;
let bigTerminal;
let cli;
let gui;

function myKeyPress(e){
	var keynum;

	if(window.event) { // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
		console.log(e.which);
		console.log(e)
	}

	console.log(String.fromCharCode(keynum));
}

$("document").ready(function () {



	let canvas = document.getElementById("terminal");

	terminal = new Terminal(canvas);
	bigTerminal = new BigTerminal(terminal);
	cli = new Cli(bigTerminal);
	gui = new Gui(terminal);

	bigTerminal.println('hello world');
	bigTerminal.println('another line');
	bigTerminal.println('a very long line which is probably too long for your screen and I am hoping this gets wrapped nicely. Woops it was not long enough so let\'s add some more.');
	bigTerminal.display();

	//Align everything for the first time:
	onResize(undefined);

	//Request socket connection from server:
	socket = io();
	console.log("Attempting to connect");

	// Start listening for events
	setEventHandlers();
});

let setEventHandlers = function () {
	// // Keyboard
	// window.addEventListener("keydown", onKeydown, false);
	// window.addEventListener("keyup", onKeyup, false);
	//
	// Window resize
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnected);
	// socket.on("w", onWelcome);
	// socket.on("t", onTerrainUpdate);
	socket.on("loginsuccess", data=>{
		console.log('loginsuccess', data)
	});
	socket.on("loginerror", data=>{
		console.log('loginerror', data)
	});
};

function onSocketConnected(data){
	console.log('conn', data)
}
function onSocketDisconnected(data){
	console.log('disconn', data)
}

//
// // Keyboard key down
// function onKeydown(e) {
// 	if (logged_in) {
// 		key_code = e.keyCode;
// 		if (blocked_keys.indexOf(key_code) > -1) {
// 			e.preventDefault(); //Prevent some of the browser's key bindings
// 		}
// 		if (!key_states[key_code]) {
// 			key_states[key_code] = true;
// 			//console.log("Pressed: " + key_code);
// 			//Do key action.
//
// 			//Which mode are we in?
// 			if (inventory_open) {
// 				switch (key_code) {
// 					case 65: // A
// 					selectItem("A");
// 					break;
// 					case 66: // B
// 					selectItem("B");
// 					break;
// 					case 84: // T
// 					selectItem("T");
// 					break;
// 					case 72: // H
// 					selectItem("H");
// 					break;
// 					case 68: // D
// 					selectItem("D");
// 					break;
// 					case 107: // +
// 					case 187: // +
// 					selectItem("+");
// 					break;
// 					case 109: // -
// 					case 189: // -
// 					selectItem("-");
// 					break;
// 					case 79: // O
// 					selectItem("O");
// 					break;
// 					case 77: // M
// 					selectItem("M");
// 					break;
// 					case 71: // G
// 					selectItem("G");
// 					break;
// 					case 49: // 1
// 					craftItem(1);
// 					break;
// 					case 50: // 2
// 					craftItem(2);
// 					break;
// 					case 51: // 3
// 					craftItem(3);
// 					break;
// 					case 52: // 4
// 					craftItem(4);
// 					break;
// 					case 69: // E
// 					case 27: // Esc
// 					inventory_open = false;
// 					$(".inventory").hide();
// 					break;
// 				};
// 			}
// 			else {
// 				switch (key_code) {
// 					case 65: // A
// 					buttonCycle(65, () => {
// 						socket.emit('move', { dir: 2 });
// 					});
// 					break;
// 					case 68: // D
// 					buttonCycle(68, () => {
// 						socket.emit('move', { dir: 0 });
// 					});
// 					break;
// 					case 83: // S
// 					buttonCycle(83, () => {
// 						socket.emit('move', { dir: 3 });
// 					});
// 					break;
// 					case 87: // W
// 					buttonCycle(87, () => {
// 						socket.emit('move', { dir: 1 });
// 					});
// 					break;
// 					case 69: // E
// 					inventory_open = true;
// 					$(".inventory").show();
// 					break;
// 				};
// 			}
// 		}
// 	}
// };
//
// // Keyboard key up
// function onKeyup(e) {
// 	if (logged_in) {
// 		key_code = e.keyCode;
// 		if (blocked_keys.indexOf(key_code) > -1) {
// 			e.preventDefault(); //Prevent some of the browser's key bindings
// 		}
// 		if (key_states[key_code]) {
// 			key_states[key_code] = false;
// 			//Do key action.
// 			/*switch (key_code) {
// 			case 37: // Left
// 			break;
// 		};*/
// 	}
// }
// };

// Browser window resize
function onResize(e) {
	let w = window.innerWidth;
	let h = window.innerHeight;
	terminal.resize(w, h);
	bigTerminal.reformat();
	bigTerminal.display();
}
