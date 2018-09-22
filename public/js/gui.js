// Wrapper for terminal
// Displays the game view.
// Displays the section of the world that is visible
// and overlays GUI elements such as coordinates, hotbar, inventory, cursor

// Plain CPU rendering. Nothing fancy.

const GUI_FRAME_COLOR = '#aaaaaa';
const GUI_TEXT_COLOR = '#ffffff';
const CURSOR_COLOR = '#209090';

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
    let buffer = [];

    // render the terrain
    for(let y = 0; y < h; y++){
      buffer[h - y - 1] = [];
      for(let x = 0; x < w; x++){
        let block = this.map.getBlock(left + x, top + y);

        if(SPRITES[block]){ // fails for air and player
          buffer[h - y - 1][x] = SPRITES[block];
          // this.terminal.displayCharacter(x, h - y - 1, SPRITES[block].char, SPRITES[block].color);
        }
        else if(block[0] === 'P'){
          console.log(block);
          buffer[h - y - 1][x] = {
            char: 'P',
            color: '#' + block.substring(1)
          };
          // this.terminal.displayCharacter(x, h - y - 1, 'P', '#' + block.substring(1));
        }
      }
    }

    // render coordinates
    if(w > 10 && h > 5){
      // render coordinates frame
      let frame =
      [
        '┌─   ─   ─┐',
        ' x:        ',
        ' y:        ',
        '└─   ─   ─┘',
      ]

      for(let i = 0; i < 4; i++){
        for(let j = 0; j < 11; j++){
          buffer[i][j] = {char: frame[i][j], color: GUI_FRAME_COLOR};
        }
      }

      // render coordinate values

      let x = player.x.toString();
      let y = player.y.toString();
      for(let i = 0; i < 7; i++){
        if(i < x.length) buffer[1][i + 4] = {char: x[i], color: GUI_TEXT_COLOR};
        if(i < y.length) buffer[2][i + 4] = {char: y[i], color: GUI_TEXT_COLOR};
      }

    }

    // display all of this on screen

    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        if(buffer[y][x]){
          this.terminal.displayCharacter(x, y, buffer[y][x].char, buffer[y][x].color);
        }
      }
    }

    // display cursor overlayed
    this.terminal.displayCharacter(
      Math.floor(w / 2) + this.player.cursorx,
      h - Math.floor(h / 2) - 1 - this.player.cursory,
      '░',
      CURSOR_COLOR
    );
  }

  handleMouse(e){
    let w = this.terminal.width;
    let h = this.terminal.height;

    let x = Math.floor((e.clientX - PADDING) / CHAR_WIDTH) - this.terminal.xpos;
    let y = Math.floor((e.clientY - PADDING) / LINE_SPACING);


    this.player.cursorSet(x - Math.floor(w / 2), h - Math.floor(h / 2) - 1 - y)
  }
}
