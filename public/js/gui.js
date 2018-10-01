// Wrapper for terminal
// Displays the game view.
// Displays the section of the world that is visible
// and overlays GUI elements such as coordinates, hotbar, inventory, cursor

// Plain CPU rendering. Nothing fancy.

const GUI_FRAME_COLOR = '#aaaaaa';
const GUI_TEXT_COLOR = '#aaaaaa';
const CURSOR_COLOR = '#209090';

class Gui {
  constructor(terminal, map, player){
    this.terminal = terminal;
    this.map = map;
    this.player = player;
  }

  display(){
    this.terminal.clearScreen();

    const w = this.terminal.width;
    const h = this.terminal.height;
    const left = this.player.x - Math.floor(w / 2);
    const top = this.player.y - Math.ceil(h / 2) + 1;
    const buffer = [];

    // render the terrain
    for(let y = 0; y < h; y++){
      buffer[h - y - 1] = [];
      for(let x = 0; x < w; x++){
        const block = this.map.getBlock(left + x, top + y);

        if(SPRITES[block]){ // fails for air and player
          buffer[h - y - 1][x] = SPRITES[block];
          // this.terminal.displayCharacter(x, h - y - 1, SPRITES[block].char, SPRITES[block].color);
        }
        else if(block[0] === 'P'){
          buffer[h - y - 1][x] = {
            char: 'P',
            color: '#' + block.substring(1)
          };
          // this.terminal.displayCharacter(x, h - y - 1, 'P', '#' + block.substring(1));
        }
      }
    }

    // render coordinates
    if(w > 10 && h > 8){
      // render coordinates frame
      const frame =
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

      const x = this.player.x.toString();
      const y = this.player.y.toString();
      for(let i = 0; i < 7; i++){
        if(i < x.length) buffer[1][i + 4] = {char: x[i], color: GUI_TEXT_COLOR};
        if(i < y.length) buffer[2][i + 4] = {char: y[i], color: GUI_TEXT_COLOR};
      }

    }

    // render inventory
    if(this.player.invShown && w > 14 && h > 6){
      const invX = Math.floor(w/2) - 7;
      const invY = Math.floor(h/2) - 3;

      const item = this.player.invSelected;
      const recipe = this.player.inventory.recipes[item];
      if(typeof recipe !== 'undefined' && h > 12){
        // also display crafting instructions:
        const frame =
        [
          '┌──────┬──────┐',
          '│B     │+     │',
          '│A     │-     │',
          '│T     │O     │',
          '│H     │M     │',
          '│D     │G     │',
          '├──────┴──────┤',
          '│             │',
          '│ C to craft  │',
          '└─────────────┘',
        ]
        for(const i in frame){
          for(const j in frame[i]){
            buffer[parseInt(i)+invY][parseInt(j)+invX] = {char: frame[i][j], color: GUI_FRAME_COLOR};
          }
        }

        // recipe:
        let str = '';
        for(const r of recipe){
          str += ' ' + r.amount + r.block;
        }
        str = str.substr(1);
        for(const j in str){
          buffer[invY+7][invX+2+parseInt(j)] = {char: str[j], color: GUI_FRAME_COLOR};
        }
      }

      else{
        // without crafting instructions
        const frame =
        [
          '┌──────┬──────┐',
          '│B     │+     │',
          '│A     │-     │',
          '│T     │O     │',
          '│H     │M     │',
          '│D     │G     │',
          '└──────┴──────┘',
        ]
        for(const i in frame){
          for(const j in frame[i]){
            buffer[parseInt(i)+invY][parseInt(j)+invX] = {char: frame[i][j], color: GUI_FRAME_COLOR};
          }
        }
      }

      {
        let i = 0;
        for(let count of Object.values(this.player.inventory.state)){
          if(count > 9999){
            count = 9999;
          }
          const countStr = count.toString();
          const col = Math.floor(i/5);
          const row = i%5;
          const x = invX + 3 + col * 7;
          const y = invY + 1 + row;
          for(const j in countStr){
            buffer[y][x+parseInt(j)] = {char: countStr[j], color: GUI_FRAME_COLOR};
          }
          i++;
        }
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
    if(!this.player.invShown){
      this.terminal.displayCharacter(
        Math.floor(w / 2) + this.player.cursorx,
        h - Math.ceil(h / 2) - this.player.cursory,
        '░',
        CURSOR_COLOR
      );
    }
    else{
      const i = this.player.inventory.item_codes.indexOf(this.player.invSelected);
      const col = Math.floor(i/5);
      const row = i%5;
      const invX = Math.floor(w/2) - 7;
      const invY = Math.floor(h/2) - 3;
      const x = invX + 1 + col * 7;
      const y = invY + 1 + row;
      this.terminal.displayCharacter(
        x,
        y,
        '░',
        CURSOR_COLOR
      );

    }
  }

  focus(){
    // nothing to do, the gui is just a display and does not require focus for anything
  }

  blur(){
    // nothing to do, the gui is just a display and does not require focus for anything
  }
}
