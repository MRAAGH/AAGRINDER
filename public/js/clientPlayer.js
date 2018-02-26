
class Player {
  constructor(){
    this.x = 0;
    this.y = 0;
    this.inventory = 'nyi';
  }

  applyPlayerUpdate(data){
    this.x = data.x;
    this.y = data.y;
		
  }
}
