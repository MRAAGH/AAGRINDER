let top_of_game_screen_offset_in_px = 15;
let left_of_game_screen_offset_in_px = 2;
let line_height_in_px = 24;
let character_width_in_px;
let display_height_blocks;// = 21;
let display_width_blocks;// = 21;
let display_height_blocks_offset;// = Math.floor(display_height_blocks / 2);
let display_width_blocks_offset;// = Math.floor(display_width_blocks / 2);
let display_reach = 5;
let blocked_keys = [9, 35, 36, 70, 71];
let player_speed_ms = 200;
let block_codes = ["A", "B", "T", "H", "D", "+", "-", "O", "M", "G"];
let craftable = ["T", "O", "M", "G"];
let raw_recipes = {
	"T": [{ block: "A", amount: 5 }],
	"O": [{ block: "B", amount: 1 }],
	"M": [{ block: "+", amount: 20 }],
	"G": [{ block: "M", amount: 1 }, { block: "D", amount: 1 }]
};
let recipes;
let localChunk = [];
let display = [];


let logged_in = false;
let inventory_open = false;
let localPlayer = new Player();	// Local player
let terrain; // The visible terrain of this chunk (including other player characters)
let key_states = [];

let socket;

$("document").ready(function () {

	//Recipe stuff:
	for (let i = 0; i < block_codes.length; i++) {
		$('body').append(`<div class="inventory mono inventorychoose" id="inventorychoose${i}">${block_codes[i]}</div>`);
	}
	buildRecipeStrings();
	for (let i = 0; i < recipes.length; i++) {
		$('body').append(`<div class="inventory mono inventorycraft" id="inventorycraft${i}"></div>`);
	}

	//Align everything for the first time:
	onResize(undefined);

	//Request socket connection from server:
	socket = io();
	console.log("Attempting to connect");

	//The form is not visible yet, but when it will be it will be linked to a socket.
	$('#login_form').submit(function () {
		socket.emit('login', {
			username: $('#username').val(),
			password: $('#password').val()
		});
		$('#username').val('');
		$('#password').val('');
		return false;
	});

	//Prepare front-end terrain storage:
	localChunk = [];
	for (let y = 0; y < 256; y++) {
		localChunk[y] = [];
		for (let x = 0; x < 256; x++) {
			localChunk[y][x] = " ";
		}
	}

	// Start listening for events
	setEventHandlers();
});

let buildRecipeStrings = function () {
	recipes = [];
	for (let i = 0; i < craftable.length; i++) {
		let recipe = {};
		recipe.button = i + 1;
		recipe.for = craftable[i];
		recipe.raw = raw_recipes[craftable[i]];
		recipe.block_index = block_codes.indexOf(recipe.for);
		let stringified = "";
		for (let j = 0; j < recipe.raw.length; j++) {
			if (j > 0) {
				stringified += ",";
			}
			stringified += recipe.raw[j].amount + recipe.raw[j].block;
		}
		recipe.string = "[" + stringified + "]";
		recipes.push(recipe);
	}
}

let setEventHandlers = function () {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);
	socket.on("w", onWelcome);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("t", onTerrainUpdate);
	socket.on("loginsuccess", data=>{
		console.log('loginsuccess', data)
	});
	socket.on("loginerror", data=>{
		console.log('loginerror', data)
	});
};

// Keyboard key down
function onKeydown(e) {
	if (logged_in) {
		key_code = e.keyCode;
		if (blocked_keys.indexOf(key_code) > -1) {
			e.preventDefault(); //Prevent some of the browser's key bindings
		}
		if (!key_states[key_code]) {
			key_states[key_code] = true;
			//console.log("Pressed: " + key_code);
			//Do key action.

			//Which mode are we in?
			if (inventory_open) {
				switch (key_code) {
					case 65: // A
					selectItem("A");
					break;
					case 66: // B
					selectItem("B");
					break;
					case 84: // T
					selectItem("T");
					break;
					case 72: // H
					selectItem("H");
					break;
					case 68: // D
					selectItem("D");
					break;
					case 107: // +
					case 187: // +
					selectItem("+");
					break;
					case 109: // -
					case 189: // -
					selectItem("-");
					break;
					case 79: // O
					selectItem("O");
					break;
					case 77: // M
					selectItem("M");
					break;
					case 71: // G
					selectItem("G");
					break;
					case 49: // 1
					craftItem(1);
					break;
					case 50: // 2
					craftItem(2);
					break;
					case 51: // 3
					craftItem(3);
					break;
					case 52: // 4
					craftItem(4);
					break;
					case 69: // E
					case 27: // Esc
					inventory_open = false;
					$(".inventory").hide();
					break;
				};
			}
			else {
				switch (key_code) {
					case 65: // A
					buttonCycle(65, () => {
						socket.emit('move', { dir: 2 });
					});
					break;
					case 68: // D
					buttonCycle(68, () => {
						socket.emit('move', { dir: 0 });
					});
					break;
					case 83: // S
					buttonCycle(83, () => {
						socket.emit('move', { dir: 3 });
					});
					break;
					case 87: // W
					buttonCycle(87, () => {
						socket.emit('move', { dir: 1 });
					});
					break;
					case 69: // E
					inventory_open = true;
					$(".inventory").show();
					break;
				};
			}
		}
	}
};

function selectItem(block_code) {
	socket.emit('select', { what: block_code });
	inventory_open = false;
	$(".inventory").hide();
};

function craftItem(button) {
	socket.emit('craft', { what: recipes[button - 1].for });
};

function buttonCycle(key_code, callback) {
	if (key_states[key_code]) {
		callback();
		setTimeout(function () {
			buttonCycle(key_code, callback);
		}, player_speed_ms);
	}
};

// Keyboard key up
function onKeyup(e) {
	if (logged_in) {
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
}
};

// Browser window resize
function onResize(e) {
	let inventoryTop = window.innerWidth / 6;
	let inventoryStep = window.innerWidth / 60;

	$("div.mono").css("font-size", window.innerWidth / 90);
	$("div.inventory").css("font-size", window.innerWidth / 80);
	$("div.navbar").css("height", (window.innerWidth / 60) + "px");
	$("div.inventory").css("height", (window.innerWidth / 80) + "px");
	$("#inventorybg").css("height", (inventoryStep * (block_codes.length + 2)) + "px");
	$("#inventorybg").css("top", (inventoryTop - inventoryStep * 0.8) + "px");
	$("#inventoryhelp").css("top", (inventoryTop) + "px");
	for (let i = 0; i < block_codes.length; i++) {
		$("#inventorychoose" + i).css("top", (inventoryTop + i * inventoryStep) + "px");
	}
	for (let i = 0; i < recipes.length; i++) {
		$("#inventorycraft" + i).css("top", (inventoryTop + recipes[i].block_index * inventoryStep) + "px");
	}
	measureCharacterWidth();

	//Adjust world display to new window size (destroy and rebuild the display)
	let extra_padding = -50;
	display_height_blocks = Math.floor((window.innerHeight - top_of_game_screen_offset_in_px - extra_padding) / line_height_in_px);
	display_width_blocks = Math.floor((window.innerWidth - left_of_game_screen_offset_in_px - extra_padding) / character_width_in_px);
	display_height_blocks_offset = Math.floor(display_height_blocks / 2);
	display_width_blocks_offset = Math.floor(display_width_blocks / 2);

	//Remove current display:
	for (let y = 0; y < display.length; y++) {
		for (let x = 0; x < display[y].length; x++) {
			display[y][x].remove();
		}
	}

	//Abandon current display references because they are dead:
	display = [];

	//Prepare world display (even if it's hidden)
	for (let y = 0; y < display_height_blocks; y++) {
		display[y] = [];
		for (let x = 0; x < display_width_blocks; x++) {
			let pos_top = line_height_in_px * y + top_of_game_screen_offset_in_px;
			let pos_left = character_width_in_px * x + left_of_game_screen_offset_in_px;
			if (y == display_height_blocks_offset && x == display_width_blocks_offset) {
				$('#world').append(`
					<pre
					id="terrain${x}_${y}"
					style="
					top: ${pos_top}px;
					left: ${pos_left}px;
					background-color: rgb(156, 155, 232);"
					unselectable="on"
					onselectstart="return false;"
					onmousedown="return false;"
					></pre>`);
					$("#terrain" + x + "_" + y).contextmenu(eventData => { eventData.preventDefault(); });
				}
				else if (y > display_height_blocks_offset - display_reach
					&& y < display_height_blocks_offset + display_reach
					&& x > display_width_blocks_offset - display_reach
					&& x < display_width_blocks_offset + display_reach) {
						$('#world').append(`
							<pre
							id="terrain${x}_${y}"
							style="
							top: ${pos_top}px;
							left: ${pos_left}px;
							unselectable="on"
							onselectstart="return false;"
							></pre>`);
							addClickHandler(x, y);
							addHoverHandler(x, y);
							$("#terrain" + x + "_" + y).contextmenu(eventData => { eventData.preventDefault(); });
						}
						else {
							$('#world').append(`
								<pre
								id="terrain${x}_${y}"
								style="
								top: ${pos_top}px;
								left: ${pos_left}px;"
								unselectable="on"
								onselectstart="return false;"
								onmousedown="return false;"
								></pre>`);
								$("#terrain" + x + "_" + y).contextmenu(eventData => { eventData.preventDefault(); });
							}
							let the_pre = $("#terrain" + x + "_" + y);
							display[y][x] = the_pre;
						}
					}

					//Display again what was just displayed before resize:
					updateDisplay();
				};

				function addHoverHandler(x, y) {
					$("#terrain" + x + "_" + y).mouseover(() => {
						let permanent_x = x;
						let permanent_y = y;
						$("#terrain" + permanent_x + "_" + permanent_y).css("background-color", "rgb(180, 237, 204)");
					});
					$("#terrain" + x + "_" + y).mouseout(() => {
						let permanent_x = x;
						let permanent_y = y;
						$("#terrain" + permanent_x + "_" + permanent_y).css("background-color", "");
					});
				}

				function addClickHandler(x, y) {
					$("#terrain" + x + "_" + y).mousedown(eventData => {
						let permanent_x = x;
						let permanent_y = y;
						onCursorClick(eventData, permanent_x, permanent_y);
					});
				}

				function onCursorClick(eventData, x, y) {
					//console.log(eventData.which + "-click on block " + x + ", " + y);
					let clicked_subchunkX = localPlayer.getSubchunkX() - display_width_blocks_offset + x;
					let clicked_subchunkY = localPlayer.getSubchunkY() - display_height_blocks_offset + y;
					if (eventData.which == 1) { // LEFT MOUSE BUTTON
						socket.emit('d', {
							x: clicked_subchunkX,
							y: clicked_subchunkY
						});
					}
					if (eventData.which == 3) { // RIGHT MOUSE BUTTON
						if (localChunk[clicked_subchunkY] != undefined
							&& localChunk[clicked_subchunkY][clicked_subchunkX] != undefined
							&& localChunk[clicked_subchunkY][clicked_subchunkX] != " ") {
								socket.emit('i', {
									x: clicked_subchunkX,
									y: clicked_subchunkY
								});

							}
							else {
								socket.emit('p', {
									x: clicked_subchunkX,
									y: clicked_subchunkY
								});
							}
						}
					};

					function onSocketConnected() {
						console.log("Connected to server");
						$("#connecting").hide();
						$("#login_form").show();
						$("#username").focus();
						$(".navbar").hide();
						inventory_open = false;
						$(".inventory").hide();
						$("#world").hide();
					};

					function onSocketDisconnect() {
						console.log("Disconnected from server");
						logged_in = false;
						$(".navbar").hide();
						inventory_open = false;
						$(".inventory").hide();
						$("#login_form").hide();
						$("#connecting").show();
						$("#world").hide();
					};

					function onWelcome(data) {
						console.log("Welcome to the server!");
						logged_in = true;
						$("#login_form").hide();
						$(".navbar").show();
						$("#world").show();

						let uncompactified_terrain = [];
						for (let y = 0; y < 256; y++) {
							uncompactified_terrain[y] = [];
							for (let x = 0; x < 256; x++) {
								uncompactified_terrain[y][x] = data.t.charAt(256 * y + x);
							}
						}

						freshTerrain(uncompactified_terrain);
						localPlayer.setPlayerChunk(data.cx, data.cy);
						localPlayer.setPlayerPosition(data.sx, data.sy);
						localPlayer.displayCoordinates();
						setInventory(data.i);
						updateDisplay();

						//console.log("got welcome:");
						//console.log(data)
					};

					function onTerrainUpdate(data) {
						updateTerrain(data.t);
						localPlayer.setPlayerChunk(data.cx, data.cy);
						localPlayer.setPlayerPosition(data.sx, data.sy);
						localPlayer.displayCoordinates();
						setInventory(data.i);
						updateDisplay();

						//console.log("got update:");
						//console.log(data)
					};

					function freshTerrain(terrain) {
						for (let y = 0; y < 256; y++) {
							for (let x = 0; x < 256; x++) {
								localChunk[y][x] = terrain[y][x];
							}
						}
					};

					function updateTerrain(updates) {
						//Only update small pieces
						for (let i = 0; i < updates.length; i++) {
							localChunk[updates[i].y][updates[i].x] = updates[i].b;
						}
					}

					function updateDisplay() {
						for (let y = 0; y < display_height_blocks; y++) {
							for (let x = 0; x < display_width_blocks; x++) {
								let local_subchunk_y = localPlayer.getSubchunkY() - display_height_blocks_offset + y;
								let local_subchunk_x = localPlayer.getSubchunkX() - display_width_blocks_offset + x;
								let block_here = " ";
								//console.log(local_subchunk_x + ", " + local_subchunk_y + " got from " + localPlayer.getSubchunkX() + ", " + localPlayer.getSubchunkY());
								//console.log(localPlayer);
								if (localChunk[local_subchunk_y] != undefined && localChunk[local_subchunk_y][local_subchunk_x] != undefined) {
									block_here = localChunk[local_subchunk_y][local_subchunk_x];
									//console.log("yeea");
								}
								display[y][x].text(block_here);
							}
						}
					}

					function coords2pxX(x) {
						return character_width_in_px * x + left_of_game_screen_offset_in_px;
					}

					function coords2pxY(y) {
						return line_height_in_px * y + top_of_game_screen_offset_in_px;
					}

					function measureCharacterWidth() {
						//Fix horizontal position issues by measuring the width of 1 character:
						$('body').append('<pre id="testwidth"> </pre>');
						character_width_in_px = $('#testwidth').width();
						$('#testwidth').remove();
					}

					function canCraft(inventory_state, recipe_index) {
						let recipe = recipes[recipe_index];
						for (let i = 0; i < recipe.raw.length; i++) {
							if (inventory_state[recipe.raw[i].block] < recipe.raw[i].amount) {
								return false;
							}
						}
						return true;
					}

					function setInventory(inventory_state) {
						for (let i = 0; i < block_codes.length; i++) {
							$("#inventorychoose" + i).text(block_codes[i] + " " + inventory_state[block_codes[i]]);
						}
						for (let i = 0; i < recipes.length; i++) {
							if (canCraft(inventory_state, i)) {
								$("#inventorycraft" + i).text(recipes[i].string + " " + recipes[i].button + " to craft");
							}
							else {
								$("#inventorycraft" + i).text(recipes[i].string);
							}
						}
					}
