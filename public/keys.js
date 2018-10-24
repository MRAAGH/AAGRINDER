/*
 * Remembers the states of keys
 * so they can be polled at every game tick.
 * 
 * This gets around the issue of the browser sandbox
 * not allowing direct polling of keys.
 */

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
