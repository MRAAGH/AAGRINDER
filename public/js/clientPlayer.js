
class Player {
  constructor(){
    this.x = 0;
    this.y = 0;
		this.cursorx = 0;
    this.cursory = 0;
    this.reach = 0;
    this.inventory = 'nyi';
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
}
