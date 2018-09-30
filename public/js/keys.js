class Keys{
  constructor(){
    this.keyStates = [];
    this.freshKeys = [];
    this.freshKeyList = [];
  }

  handleKeyDown(keyCode){
  	if (!this.keyStates[keyCode]) {
  		this.keyStates[keyCode] = true;
      this.freshKeys[keyCode] = true;
      this.freshKeyList.push(keyCode);
      console.log(keyCode);
  	}
  }

  handleKeyUp(keyCode){
		this.keyStates[keyCode] = false;
  }

  clearFresh(){
    this.freshKeys = [];
    this.freshKeyList = [];
  }

  getFullKeyStates(){
    const fullKeyStates = this.keyStates.slice();
    for(const k of this.freshKeyList){
      fullKeyStates[k] = true;
    }
    return fullKeyStates;
  }
}
