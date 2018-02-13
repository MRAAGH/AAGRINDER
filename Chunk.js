// /*
// Chunk coordinates do not exist here.
// There are no missing chunks.
// Assume the whole infinite world already exists.
// Different chunks are not important any more.
// There is only one coordinate system:
// it is centered (0,0) at the top left block of this block.
// Negative coordinates and coordinates above 255 are valid,
// and they reference terrain outside this chunk.
// */
//
//
// let Tree = require("./Tree").Tree;
// let Flying = require("./Flying").Flying;
//
// let Chunk = function (_x, _y, _terrain, _getChunk) {
//   let x = _x;
//   let y = _y;
//   let terrain = _terrain;
//   let online_chunk_players = [];
//   let dirty_blocks = [];
//   let dirty_canvas;
//   let dirty_color;
//   let dirty_chunks = [];
//   let getChunk = _getChunk;
//   let max_plant_cycle_ms = 60 * 1000;
//   let tree_surface_size = 32; //The ultimate upper bound for tree size
//   let plant_cycle_active = false;
//   let plant_list = [];
//
//   let clean_canvas = function () {
//     dirty_color = 1;
//     dirty_canvas = [];
//     for (let y = 0; y < 256; y++) {
//       dirty_canvas[y] = [];
//       for (let x = 0; x < 256; x++) {
//         dirty_canvas[y][x] = 0;
//       }
//     }
//   };
//   clean_canvas();
//
//   let centralizedBlockAt = function (checkX, checkY) {
//     //console.log("CBA " + checkX + ", " + checkY)
//     if (checkX > -1 && checkX < 256 && checkY > -1 && checkY < 256) {
//       return terrain[checkY][checkX];
//     }
//     else {
//       let chunkX = x;
//       let chunkY = y;
//       while (checkX < 0) {
//         chunkX--;
//         checkX += 256;
//       }
//       while (checkX > 255) {
//         chunkX++;
//         checkX -= 256;
//       }
//       while (checkY < 0) {
//         chunkY--;
//         checkY += 256;
//       }
//       while (checkY > 255) {
//         chunkY++;
//         checkY -= 256;
//       }
//       return getChunk(chunkX, chunkY).terrain[checkY][checkX];
//     }
//   };
//
//   let centralizedSetBlock = function (setX, setY, new_content) {
//     //console.log("CSB " + setX + ", " + setY)
//     if (setX > -1 && setX < 256 && setY > -1 && setY < 256) {
//       localSetBlock(setX, setY, new_content);
//     }
//     else {
//       let chunkX = x;
//       let chunkY = y;
//       while (setX < 0) {
//         chunkX--;
//         setX += 256;
//       }
//       while (setX > 255) {
//         chunkX++;
//         setX -= 256;
//       }
//       while (setY < 0) {
//         chunkY--;
//         setY += 256;
//       }
//       while (setY > 255) {
//         chunkY++;
//         setY -= 256;
//       }
//       let other_chunk = getChunk(chunkX, chunkY);
//       other_chunk.localSetBlock(setX, setY, new_content);
//       //Mark chunk as dirty:
//       let already_dirty = false;
//       for (let i = 0; i < dirty_chunks.length; i++) { //This loop hardly ever executes more than once, so no worries
//         if (dirty_chunks[i].x == chunkX && dirty_chunks[i].y == chunkY) {
//           already_dirty = true;
//           return;
//         }
//       }
//       if (!already_dirty) {
//         dirty_chunks.push({ x: chunkX, y: chunkY });
//       }
//     }
//   };
//
//   let localSetBlock = function (setX, setY, new_content) {
//     //Only used by centralizedSetBlock. Allows each chunk to keep track of its own changes.
//     terrain[setY][setX] = new_content;
//     if (dirty_canvas[setY][setX] != dirty_color) {
//       dirty_canvas[setY][setX] = dirty_color;
//       dirty_blocks.push({ x: setX, y: setY });
//     }
//   };
//
//   let getTerrainWithoutPlayers = function () {
//     //Copy terrain:
//     let changed_terrain = [];
//     for (let y = 0; y < 256; y++) {
//       changed_terrain[y] = []
//       for (let x = 0; x < 256; x++) {
//         changed_terrain[y][x] = terrain[y][x];
//       }
//     }
//     //Remove players:
//     for (let i = 0; i < online_chunk_players.length; i++) {
//       let online_player = online_chunk_players[i];
//       changed_terrain[online_player.subchunkY][online_player.subchunkX] = " ";
//     }
//     //*
//     //Test for ghost players (this shouldn't occur if everything works):
//     for (let y = 0; y < 256; y++) {
//       for (let x = 0; x < 256; x++) {
//         if (changed_terrain[y][x] == "P") {
//           console.log("A ghost player block got into the database!")
//         }
//       }
//     }
//     //*/
//     return changed_terrain;
//   };
//
//   let centralizedApplyChangesToClients = function () {
//     //Apply changes to clients in every chunk that's been affected:
//     //First, this one:
//     localApplyChangesToClients();
//     //Then all the others:
//     for (let i = 0; i < dirty_chunks.length; i++) {
//       getChunk(dirty_chunks[i].x, dirty_chunks[i].y).localApplyChangesToClients();
//     }
//     dirty_chunks = [];
//   };
//
//   let localApplyChangesToClients = function () {
//     //Next color:
//     dirty_color++;
//     if (dirty_color > 16777215) { //2^24, but it could just as well be anything else.
//       clean_canvas();
//       console.log("dirty color overflow at " + x + ", " + y);
//     }
//
//     //Send dirty blocks to the clients of all players in this chunk:
//     if (dirty_blocks.length > 0) {
//       let message = [];
//       for (let i = 0; i < dirty_blocks.length; i++) {
//         message.push({
//           x: dirty_blocks[i].x,
//           y: dirty_blocks[i].y,
//           b: terrain[dirty_blocks[i].y][dirty_blocks[i].x]
//         })
//       }
//
//       //Dirty blocks have just been cleaned.
//       dirty_blocks = [];
//
//       for (let i = 0; i < online_chunk_players.length; i++) {
//         online_chunk_players[i].sendTerrainUpdate(message);
//       }
//     }
//   };
//
//   let isValidSpawnSpot = function (subchunkX, subchunkY) {
//     if (centralizedBlockAt(subchunkX, subchunkY) != " ") return false; //Can't spawn in a wall
//     if (centralizedBlockAt(subchunkX, subchunkY + 1) == " ") return false; //Can't spawn floating
//     return true;
//   };
//
//   let playerIn = function (joining_player) {
//     online_chunk_players.push(joining_player);
//     centralizedSetBlock(joining_player.subchunkX, joining_player.subchunkY, "P");
//     centralizedApplyChangesToClients();
//     //If this player just joined after the chunk has been empty, start the plant cycle.
//     if (online_chunk_players.length == 1) {
//       startPlantCycle();
//     }
//   };
//
//   let playerOut = function (leaving_player_id) {
//     //Find player:
//     let leaving_player_index = chunkPlayerById(leaving_player_id);
//     if (leaving_player_index > -1) {
//       let leaving_player = online_chunk_players[leaving_player_index];
//       centralizedSetBlock(leaving_player.subchunkX, leaving_player.subchunkY, " ");
//       playerCascade(leaving_player.subchunkX, leaving_player.subchunkY);
//       online_chunk_players.splice(leaving_player_index, 1);
//       centralizedApplyChangesToClients();
//     }
//     else {
//       console.log("Could not out player " + leaving_player_id + " from chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//     }
//   };
//
//   let playerNinjaIn = function (joining_player) {
//     online_chunk_players.push(joining_player);
//     //If this player just joined after the chunk has been empty, start the plant cycle.
//     if (online_chunk_players.length == 1) {
//       startPlantCycle();
//     }
//   };
//
//   let playerNinjaOut = function (leaving_player_id) {
//     //Find player:
//     let leaving_player_index = chunkPlayerById(leaving_player_id);
//     if (leaving_player_index > -1) {
//       let leaving_player = online_chunk_players[leaving_player_index];
//       online_chunk_players.splice(leaving_player_index, 1);
//     }
//     else {
//       console.log("Could not ninja out player " + leaving_player_id + " from chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//     }
//   };
//
//   let playerMove = function (moving_player_id, direction) {
//     //Find player:
//     let moving_player_index = chunkPlayerById(moving_player_id);
//     if (moving_player_index == -1) {
//       console.log("Could not move player " + moving_player_id + " in chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//       return false;
//     }
//     let moving_player = online_chunk_players[moving_player_index];
//     //Check if movement is valid:
//     if (!validPlayerMovement(moving_player, direction)) {
//       //Invalid movement. Abort.
//       //console.log("You can't do that movement!");
//       return false;
//     }
//     //Move player:
//     applyPlayerMovement(moving_player, direction);
//     return true;
//   };
//
//   let playerDig = function (digging_player_id, digPosX, digPosY) {
//     //Find player:
//     let digging_player_index = chunkPlayerById(digging_player_id);
//     if (digging_player_index == -1) {
//       console.log("Could not dig / place by player " + digging_player_id + " in chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//       return false;
//     }
//     let digging_player = online_chunk_players[digging_player_index];
//     //Check if dig/place is valid:
//     if (!validPlayerDiggment(digging_player, digPosX, digPosY)) {
//       //Invalid diggment. Abort.
//       return false;
//     }
//     //Dig/place:
//     applyPlayerDiggment(digging_player, digPosX, digPosY);
//     return true;
//   };
//
//   let playerPlace = function (digging_player_id, digPosX, digPosY) {
//     //Find player:
//     let digging_player_index = chunkPlayerById(digging_player_id);
//     if (digging_player_index == -1) {
//       console.log("Could not dig / place by player " + digging_player_id + " in chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//       return false;
//     }
//     let digging_player = online_chunk_players[digging_player_index];
//     //Check if dig/place is valid:
//     if (!validPlayerPlacement(digging_player, digPosX, digPosY)) {
//       //Invalid diggment. Abort.
//       return false;
//     }
//     //Dig/place:
//     applyPlayerPlacement(digging_player, digPosX, digPosY);
//     return true;
//   };
//
//   let playerInteract = function (interacting_player_id, interactPosX, interactPosY) {
//     //console.log("interact");
//     let interacting_player = online_chunk_players[chunkPlayerById(interacting_player_id)];
//
//     if (Math.abs(interacting_player.subchunkX - interactPosX) > interacting_player.reach) return false;
//     if (Math.abs(interacting_player.subchunkY - interactPosY) > interacting_player.reach) return false;
//
//     let success = Flying(
//       centralizedBlockAt,
//       centralizedSetBlock,
//       online_chunk_players,
//       plant_list,
//       removePlantAt,
//       interactPosX,
//       interactPosY,
//       interacting_player
//     );
//     //console.log("flight success: " + success);
//     if (success) {
//       centralizedApplyChangesToClients();
//     }
//     return false;
//   };
//
//   let playerSelect = function (selecting_player_id, block_code) {
//     //Find player:
//     let selecting_player_index = chunkPlayerById(selecting_player_id);
//     if (selecting_player_index == -1) {
//       console.log("Could not select by player " + selecting_player_id + " in chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//       return false;
//     }
//     let selecting_player = online_chunk_players[selecting_player_index];
//     if (selecting_player.inventory.blockCodeExists(block_code)) {
//       selecting_player.inventory.selected = block_code;
//     }
//     else {
//       return false;
//     }
//     return true;
//   };
//
//   let playerCraft = function (crafting_player_id, block_code) {
//     //Find player:
//     let crafting_player_index = chunkPlayerById(crafting_player_id);
//     if (crafting_player_index == -1) {
//       console.log("Could not craft by player " + crafting_player_id + " in chunk " + this.x + ", " + this.y + " because such a player does not exist.");
//       return false;
//     }
//     let crafting_player = online_chunk_players[crafting_player_index];
//     if (crafting_player.inventory.blockCodeExists(block_code)) {
//       if (crafting_player.inventory.canCraft(block_code)) {
//         crafting_player.inventory.craft(block_code);
//         crafting_player.sendTerrainUpdate([]);
//       }
//       else {
//         return false;
//       }
//     }
//     else {
//       return false;
//     }
//     return true;
//   };
//
//   let validPlayerMovement = function (moving_player, direction) {
//     let playerX = moving_player.subchunkX;
//     let playerY = moving_player.subchunkY;
//     switch (direction) {
//       case 0: case 2: // RIGHT LEFT
//         let x_dir = (direction == 0 ? 1 : -1);
//         if (centralizedBlockAt(playerX + x_dir, playerY) != " ") {
//           //Block in ya face
//           if (centralizedBlockAt(playerX + x_dir, playerY - 1) != " ") return false;
//           if (centralizedBlockAt(playerX, playerY - 1) != " ") return false;
//         }
//         else {
//           //No block in ya face.
//           if (centralizedBlockAt(playerX + x_dir, playerY + 1) != " ") {
//             //Ooh, nice path.
//           }
//           else {
//             //Drop! But how deep?
//             if (centralizedBlockAt(playerX + x_dir, playerY + 2) == " ") return false;
//           }
//         }
//         return true;
//       case 1: // UP
//         if (centralizedBlockAt(playerX, playerY - 1) != "H") return false;
//         if (centralizedBlockAt(playerX, playerY - 2) == " ") return true; //To move 2 blocks up
//         if (centralizedBlockAt(playerX, playerY - 2) != "H") return false;
//         if (centralizedBlockAt(playerX, playerY - 3) == " ") return true; //To move 3 blocks up
//         return false;
//       case 3: // DOWN
//         if (centralizedBlockAt(playerX, playerY + 1) != "H") return false;
//         if (centralizedBlockAt(playerX, playerY + 2) == " ") {
//           if (centralizedBlockAt(playerX, playerY + 3) != " ") return true; //To move 2 blocks down
//           return false;
//         }
//         if (centralizedBlockAt(playerX, playerY + 2) != "H") return false;
//         if (centralizedBlockAt(playerX, playerY + 3) == " ") {
//           if (centralizedBlockAt(playerX, playerY + 4) != " ") return true; //To move 3 blocks down
//           return false;
//         }
//         return false;
//     }
//     return false; //never executes
//   };
//
//   let applyPlayerMovement = function (moving_player, direction) {
//     //console.log("removing player from currentposition: " + moving_player.subchunkX + " " + moving_player.subchunkY);
//     centralizedSetBlock(moving_player.subchunkX, moving_player.subchunkY, ' ');
//     playerCascade(moving_player.subchunkX, moving_player.subchunkY);
//     switch (direction) {
//       case 0: case 2: // RIGHT LEFT
//         let x_dir = (direction == 0 ? 1 : -1);
//         if (centralizedBlockAt(moving_player.subchunkX + x_dir, moving_player.subchunkY) != " ") {
//           //Block in ya face
//           moving_player.subchunkX += x_dir;
//           moving_player.subchunkY--;
//         }
//         else {
//           //No block in ya face.
//           if (centralizedBlockAt(moving_player.subchunkX + x_dir, moving_player.subchunkY + 1) != " ") {
//             //Ooh, nice path.
//             moving_player.subchunkX += x_dir;
//           }
//           else {
//             //Drop!
//             moving_player.subchunkX += x_dir;
//             moving_player.subchunkY++;
//           }
//         }
//         break;
//       case 1: // UP
//         if (centralizedBlockAt(moving_player.subchunkX, moving_player.subchunkY - 2) == " ") {
//           moving_player.subchunkY -= 2;
//         }
//         else {
//           moving_player.subchunkY -= 3;
//         }
//         break;
//       case 3: // DOWN
//         if (centralizedBlockAt(moving_player.subchunkX, moving_player.subchunkY + 2) == " ") {
//           moving_player.subchunkY += 2;
//         }
//         else {
//           moving_player.subchunkY += 3;
//         }
//         break;
//     }
//     //console.log("placing player on other position: " + moving_player.subchunkX + " " + moving_player.subchunkY);
//     centralizedSetBlock(moving_player.subchunkX, moving_player.subchunkY, 'P');
//     playerCentralizeCoordinates(moving_player);
//     centralizedApplyChangesToClients();
//   };
//
//   let validPlayerDiggment = function (digging_player, digPosX, digPosY) {
//     if (Math.abs(digging_player.subchunkX - digPosX) > digging_player.reach) return false;
//     if (Math.abs(digging_player.subchunkY - digPosY) > digging_player.reach) return false;
//
//     if (centralizedBlockAt(digPosX, digPosY) == " ") return false; //Can't dig air
//     if (centralizedBlockAt(digPosX, digPosY) == "P") return false; //Can't murder
//     if (centralizedBlockAt(digPosX, digPosY - 1) == "P") return false; //Can't spleef
//
//     return true;
//   };
//
//   let applyPlayerDiggment = function (digging_player, digPosX, digPosY) {
//     //Dig:
//     let dug_block = centralizedBlockAt(digPosX, digPosY);
//     let dug_block_code = digging_player.inventory.block2blockCode(dug_block);
//     digging_player.inventory.earnBlock(dug_block_code);
//     centralizedSetBlock(digPosX, digPosY, ' ');
//     if (dug_block == "T") {
//       removePlantAt(digPosX, digPosY);
//     }
//     centralizedApplyChangesToClients();
//   };
//
//   let validPlayerPlacement = function (digging_player, digPosX, digPosY) {
//     if (Math.abs(digging_player.subchunkX - digPosX) > digging_player.reach) return false;
//     if (Math.abs(digging_player.subchunkY - digPosY) > digging_player.reach) return false;
//
//     if (centralizedBlockAt(digPosX, digPosY) != " ") return false; //Can't replace an existing block
//     if (!digging_player.inventory.hasBlock(digging_player.inventory.selected)) {
//       return false; //Can't place what you don't have
//     }
//
//     return true;
//   };
//
//   let applyPlayerPlacement = function (digging_player, digPosX, digPosY) {
//     //Place:
//     let placed_block_code = digging_player.inventory.selected;
//     digging_player.inventory.spendBlock(placed_block_code);
//     let relativeCheck = function (relativeCheckX, relativeCheckY) {
//       return centralizedBlockAt(digPosX + relativeCheckX, digPosY + relativeCheckY);
//     }
//     let placed_block = digging_player.inventory.blockCode2block(placed_block_code, relativeCheck);
//     centralizedSetBlock(digPosX, digPosY, placed_block);
//     if (placed_block == "T") {
//       plant_list.push({ x: digPosX, y: digPosY });
//     }
//     //console.log("almost dun placement");
//     centralizedApplyChangesToClients();
//     //console.log("dun placement");
//   };
//
//   let playerCascade = function (sourceX, sourceY) {
//     //This is now an empty spot.
//     //Check if there's a player above:
//     if (centralizedBlockAt(sourceX, sourceY - 1) == "P") {
//       let falling_player_index = chunkPlayerByCoords(sourceX, sourceY - 1);
//       if (falling_player_index == -1) {
//         console.log("Falling player block has no player assigned! " + x + ", " + y + ", " + sourceX + ", " + (sourceY - 1));
//       }
//       else {
//         let falling_player = online_chunk_players[falling_player_index];
//         falling_player.subchunkY++;
//         playerCentralizeCoordinates(falling_player);
//       }
//       centralizedSetBlock(sourceX, sourceY, "P");
//       centralizedSetBlock(sourceX, sourceY - 1, " ");
//       playerCascade(sourceX, sourceY - 1);
//     }
//   };
//
//   let chunkPlayerById = function (id) {
//     let i;
//     for (i = 0; i < online_chunk_players.length; i++) {
//       if (online_chunk_players[i].client_id == id) {
//         return i;
//       }
//     };
//     return -1;
//   };
//
//   let chunkPlayerByCoords = function (subchunkX, subchunkY) {
//     let i;
//     for (i = 0; i < online_chunk_players.length; i++) {
//       if (online_chunk_players[i].subchunkX == subchunkX
//         && online_chunk_players[i].subchunkY == subchunkY) {
//         return i;
//       }
//     };
//     return -1;
//   };
//
//   let plant_cycle = function () {
//     //Abort if nobody is here:
//     if (online_chunk_players.length == 0) {
//       plant_cycle_active = false;
//       //console.log("last cycle (failed)");
//       return;
//     }
//
//     //console.log("plant growth cycle");
//     //This is the purpose of the cycle: a growth attempt:
//     if (plant_list.length > 0) {
//       let chosen_plant_index = Math.floor(Math.random() * plant_list.length);
//       let chosen_plant = plant_list[chosen_plant_index];
//       //console.log("chose plant " + chosen_plant_index + " (at " + chosen_plant.x + ", " + chosen_plant.y + ")");
//       let successful_growth = plantGrowthAttempt(chosen_plant.x, chosen_plant.y);
//       if (successful_growth) {
//         //This plant is no more.
//         //console.log("plant grew");
//         plant_list.splice(chosen_plant_index, 1);
//       }
//     }
//
//     //Prepare for next cycle:
//     let timeout = max_plant_cycle_ms * (0.7 + Math.random() * 0.6);
//     if (plant_list.length > 0) {
//       timeout /= plant_list.length;
//     }
//     setTimeout(plant_cycle, timeout);
//   };
//
//   let startPlantCycle = function () {
//     if (plant_cycle_active == true) {
//       //Two cycles running at once? Wut? Stop this madness.
//       return;
//     }
//     plant_cycle_active = true;
//
//     let timeout = max_plant_cycle_ms * (0.7 + Math.random() * 0.6);
//     if (plant_list.length > 0) {
//       timeout /= plant_list.length;
//     }
//     setTimeout(plant_cycle, timeout);
//   };
//
//   let removePlantAt = function (plantX, plantY) {
//     //console.log("plant killed");
//     for (let i = 0; i < plant_list.length; i++) {
//       if (plant_list[i].x == plantX && plant_list[i].y == plantY) {
//         plant_list.splice(i, 1);
//         return;
//       }
//     }
//   };
//
//   let plantGrowthAttempt = function (plantX, plantY) {
//     if (centralizedBlockAt(plantX, plantY) != "T"
//       || centralizedBlockAt(plantX, plantY + 1) != "B") {
//       return false;
//     }
//     //console.log("it's a tree");
//     let the_tree = new Tree(plantX, plantY, tree_surface_size, Math.floor(Math.random() * 1000000));
//     if (canPlaceTree(the_tree)) {
//       placeTree(the_tree);
//       return true;
//     }
//     return false;
//   };
//
//   let canPlaceTree = function (tree) {
//     //console.log("testing tree");
//     for (let tree_y = 0; tree_y < tree_surface_size; tree_y++) {
//       let island_y = tree.cornerSubislandY - tree_y;
//       for (let tree_x = 0; tree_x < tree_surface_size; tree_x++) {
//         let island_x = tree_x + tree.cornerSubislandX;
//         if (tree.terrain[tree_y][tree_x] != " ") {
//           //Part of the tree is here. Need to check existing terrain.
//           //Checks in main layer:
//           if (centralizedBlockAt(island_x, island_y) != " ") {
//             //Tree wants to replace something
//             if (tree.terrain[tree_y][tree_x] == "A") {
//               //Leaves may not replace anything.
//               //console.log("NOPE 2");
//               return false;
//             }
//             else {
//               //It's wood.
//               if (centralizedBlockAt(island_x, island_y) != "T") {
//                 //console.log("NOPE 3");
//                 //Wood may only replace saplings.
//                 return false;
//               }
//             }
//           }
//         }
//       }
//     }
//     return true;
//   };
//
//   let placeTree = function (tree) {
//     //console.log("placing tree");
//     for (let tree_y = 0; tree_y < tree_surface_size; tree_y++) {
//       let island_y = tree.cornerSubislandY - tree_y;
//       for (let tree_x = 0; tree_x < tree_surface_size; tree_x++) {
//         let island_x = tree_x + tree.cornerSubislandX;
//         if (tree.terrain[tree_y][tree_x] != " ") {
//           //console.log("placing block " + tree.terrain[tree_y][tree_x] + " at tree coords " + tree_x + ", " + tree_y);
//           //Part of the tree is here. Place.
//           centralizedSetBlock(island_x, island_y, tree.terrain[tree_y][tree_x]);
//         }
//       }
//     }
//     centralizedApplyChangesToClients();
//   };
//
//   let playerCentralizeCoordinates = function (the_player) {
//     let original_chunkX = the_player.chunkX;
//     let original_chunkY = the_player.chunkY;
//     let switched_chunk = false;
//     while (the_player.subchunkX < 0) {
//       the_player.subchunkX += 256;
//       the_player.chunkX--;
//       switched_chunk = true;
//     }
//     while (the_player.subchunkX > 255) {
//       the_player.subchunkX -= 256;
//       the_player.chunkX++;
//       switched_chunk = true;
//     }
//     while (the_player.subchunkY < 0) {
//       the_player.subchunkY += 256;
//       the_player.chunkY--;
//       switched_chunk = true;
//     }
//     while (the_player.subchunkY > 255) {
//       the_player.subchunkY -= 256;
//       the_player.chunkY++;
//       switched_chunk = true;
//     }
//     if (switched_chunk) {
//       //The player switches chunks like a ninja.
//       let original_chunk = getChunk(original_chunkX, original_chunkY);
//       let other_chunk = getChunk(the_player.chunkX, the_player.chunkY);
//       original_chunk.playerNinjaOut(the_player.client_id);
//       other_chunk.playerNinjaIn(the_player);
//     }
//   };
//
//   return {
//     x,
//     y: y,
//     terrain: terrain,
//     plant_list: plant_list,
//     getTerrainWithoutPlayers: getTerrainWithoutPlayers,
//     isValidSpawnSpot: isValidSpawnSpot,
//     playerIn: playerIn,
//     playerOut: playerOut,
//     playerNinjaIn: playerNinjaIn,
//     playerNinjaOut: playerNinjaOut,
//     playerMove: playerMove,
//     playerDig: playerDig,
//     playerPlace: playerPlace,
//     playerInteract: playerInteract,
//     playerSelect: playerSelect,
//     playerCraft: playerCraft,
//     centralizedBlockAt: centralizedBlockAt,
//     centralizedSetBlock: centralizedSetBlock,
//     localSetBlock: localSetBlock,
//     localApplyChangesToClients: localApplyChangesToClients,
//     dirty_blocks: dirty_blocks
//   };
// };
//
// exports.Chunk = Chunk;


class Chunk {
  constructor(terrain){
    this.terrain = terrain; //a 2d char array
    this.subscribers = [];
    // this.change2D = {};
  }
}
