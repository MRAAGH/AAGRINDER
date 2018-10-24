/*
 * A class for holding data about the player who is logged in,
 * along with a few client-side actions the user can trigger.
 */

class Player {
  constructor(color){
    this.x = 0;
    this.y = 0;
		this.cursorx = 0;
    this.cursory = 0;
    this.reach = 0;
    this.color = color;
    this.inventory = new Inventory();
    this.invShown = false;
    this.invSelected = 'A';
  }

  playerBlock(){
    return 'P'+this.color;
  }

  cursorUp(){
    if(this.cursory < this.reach){
      this.cursory++;
    }
  }

  cursorDown(){
    if(this.cursory > -this.reach){
      this.cursory--;
    }
  }

  cursorRight(){
    if(this.cursorx < this.reach){
      this.cursorx++;
    }
  }

  cursorLeft(){
    if(this.cursorx > -this.reach){
      this.cursorx--;
    }
  }

  cursorSet(x, y){
    if(x <= this.reach && x >= -this.reach && y <= this.reach && y >= -this.reach){
      this.cursorx = x;
      this.cursory = y;
    }
  }

  selectUp(){
    console.log('up')
    const selected = this.selectGet();
    console.log(selected)
    if(selected%5 > 0){
      console.log('yu')
      this.selectSet(selected - 1);
    }
  }

  selectDown(){
    const selected = this.selectGet();
    if(selected%5 < 4){
      this.selectSet(selected + 1);
    }
  }

  selectRight(){
    const selected = this.selectGet();
    if(selected < 5){
      this.selectSet(selected + 5);
    }
  }

  selectLeft(){
    const selected = this.selectGet();
    if(selected >= 5){
      this.selectSet(selected - 5);
    }
  }

  selectGet(){
    return this.inventory.item_codes.indexOf(this.invSelected);
  }

  selectSet(i){
    console.log('set to', i)
    this.invSelected = this.inventory.item_codes[i];
    console.log(this.invSelected)
  }
}
