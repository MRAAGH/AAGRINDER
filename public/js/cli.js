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
    this.history = [];
    this.historyPos = 0;
  }

  // prompt, aka enable
  prompt(content){ // prompt the user to input something (and display static content)
    this.static = content;
    this.enabled = true;
    this.display();
  }

  promptPassword(content){
    this.static = content;
    this.enabled = true;
    this.asterisks = true;
    this.display();
  }

  toAsterisks(line){
    let ast = '';
    for(let i = 0; i < line.length; i++){
      ast += '*';
    }
    return ast;
  }

  display(){
    if(this.asterisks){
      this.bigterminal.modify(this.static + this.toAsterisks(this.editable));
    }
    else{
      this.bigterminal.modify(this.static + this.editable);
    }
  }

  // commit, aka apply and disable
  commit(){ // turn the currently typed text into a "command"
  let wasCommited = this.editable;
    if(this.asterisks){
      // hide them
      this.editable = '';
      this.display();
    }
    this.bigterminal.commit();

    // add to command history (if it makes sense)
    if(this.editable !== ''){
      if(this.history.length === 0 || this.editable !== this.history[this.history.length - 1]){
        // it's no dupe.
        // then it makes sense to add this to history.
        this.history.push(this.editable);
      }
    }
    // jump to the end of history
    this.historyPos = this.history.length;

    this.static = '';
    this.editable = '';
    this.enabled = false;
    this.asterisks = false;
    return wasCommited;
  }

  handleKey(key){
    if(!this.enabled){
      return false;
    }
    if(key.length !== 1){

      // It is not a simple key, such as 'A' or '~'

			switch(key){
				case 'Backspace':
				this.backspace();
				break;

				case 'PageUp':
				this.bigterminal.scrollUp();
				break;

				case 'PageDown':
				this.bigterminal.scrollDown();
				break;

				case 'End':
				this.bigterminal.scrollToEnd();
				break;

				case 'ArrowUp':
				this.up();
				break;

				case 'ArrowDown':
				this.down();
				break;

				case 'ArrowLeft':
				this.left();
				break;

				case 'ArrowRight':
				this.right();
				break;

				case 'Enter':
				let result = this.commit();
        return result;
				default:
				console.log('ignored key: ' + key);
			}
      // whatever it was, it is not going to be typed.
      return false;
    }
    // type this:
    this.editable += key
    this.display();
    return false;
  }

  backspace(){
    if(this.enabled && this.editable.length > 0){
      this.editable = this.editable.substring(0, this.editable.length - 1);
      this.display();
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
