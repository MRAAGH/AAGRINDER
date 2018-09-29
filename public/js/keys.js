class Keys{
  constructor(){
    this.keyStates = [];
    this.freshKeys = [];
  }

  handleKeyDown(keyCode){
  	if (!this.keyStates[keyCode]) {
  		this.keyStates[keyCode] = true;
      this.freshKeys.push(keyCode);
      // console.log(keyCode);
  	}
  }

  handleKeyUp(keyCode){
		this.keyStates[keyCode] = false;
  }

  clearFresh(){
    this.freshKeys = [];
  }

  getFullKeyStates(){
    const fullKeyStates = this.keyStates.slice();
    for(const k of this.freshKeys){
      fullKeyStates[k] = true;
    }
    return fullKeyStates;
  }
}
