
class Player {
  constructor(color){
    this.x = 0;
    this.y = 0;
		this.cursorx = 0;
    this.cursory = 0;
    this.reach = 0;
    this.color = color;
    this.inventory = 'nyi';
  }

  playerBlock(){
    return 'P'+this.color;
  }

  applyPlayerUpdate(data){
    this.x = data.x;
    this.y = data.y;
    this.reach = data.reach;
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
    if(x < this.reach && x > -this.reach && y < this.reach && y > -this.reach){
      this.cursorx = x;
      this.cursory = y;
    }
  }
}
