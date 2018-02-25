// Wrapper for bigterminal.
// Adds a static and editable part to the dynamic line.
// Adds edit controls
// Adds command history
// Adds a mode with asterisks only (for passwords)

class Cli {
  constructor(bigterminal){
    this.bigterminal = bigterminal;
    this.static = '';
    this.editable = '';
    this.enabled = false; // whether we are allowing the user to type
    this.asterisks = false; // whether we are hiding the typed characters
  }

  // prompt, aka enable
  prompt(content){ // prompt the user to input something (and display static content)
    this.static = content;
    this.enabled = true;
    this.bigterminal.modify(this.static + this.editable);
  }

  // commit, aka apply and disable
  commit(){ // turn the currently typed text into a "command"
    this.bigterminal.commit();
    let wasCommited = this.editable;
    this.static = '';
    this.editable = '';
    this.enabled = false;
    return wasCommited;
  }

  handleKey(char){
    if(!this.enabled || char.length !== 1){
      // not handling the key
      return false;
    }
    this.editable += char
    this.bigterminal.modify(this.static + this.editable);
    return true;
  }

  backspace(){
    if(this.enabled && this.editable.length > 0){
      this.editable = this.editable.substring(0, this.editable.length - 1);
      this.bigterminal.modify(this.static + this.editable);
    }
  }

  left(){

  }

  right(){

  }

  up(){

  }

  down(){

  }
}
