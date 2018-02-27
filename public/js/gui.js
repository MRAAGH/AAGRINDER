// Wrapper for terminal
// Displays the game view.
// Displays the section of the world that is visible
// and overlays GUI elements such as coordinates, hotbar, inventory, cursor

// Plain CPU rendering. Nothing fancy.

class Gui {
  constructor(terminal, map, player){
    this.terminal = terminal;
    this.map = map;
    this.player = player;
  }

  display(){
    this.terminal.clearScreen();

    let w = this.terminal.width;
    let h = this.terminal.height;
    let left = this.player.x - Math.floor(w / 2);
    let top = this.player.y - Math.floor(h / 2);
    // let lists = {};
    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        let block = this.map.getBlock(left + x, top + y);

        if(SPRITES[block]){ // fails for air and player
          this.terminal.displayCharacter(x, h - y - 1, SPRITES[block].char, SPRITES[block].color);
        }
        else if(block[0] === 'P'){
          this.terminal.displayCharacter(x, h - y - 1, 'P', '#' + block.substring(1));
        }
        // add to the appropriate list
        // lists[block].push({x: x, y: y});
      }
    }
  }
}
