// Wrapper for terminal.
// Adds println, text wrapping, output history, scrolling, dynamic last line

class BigTerminal {
  constructor(terminal){
    this.terminal = terminal;
    this.lines = []; // lines of output
    this.formatted = []; // 1 formatted line corresponds to 1 line on screen
    // (though it's not neccesarily on screen)
    this.scrollPos = 0; // index of the (formatted) line at the top
    this.dynamic = '';
  }

  println(content){
    this.lines.push(content);
    this.formatLine(content);
  }

  modify(content){
    this.dynamic = content;
  }

  commit(){
    this.println(this.dynamic);
    this.dynamic = '';
  }

  printTruncate(content){ // cut off instead of wrapping
    let truncated = truncateLine(content);
    this.println(truncated);
  }

  formatLine(line){
    let w = this.terminal.charWidth();
    while(line.length > w){
      this.formatted.push(line.substring(0, w - 1));
      line = line.substring(w - 1);
    }
    this.formatted.push(line);
  }

  truncateLine(line){
    let w = this.terminal.charWidth();
    if(line.length > w){
      return line.substring(0, w - 1);
    }
    else {
      return line;
    }
  }

  reformat(){ // wrap again (terminal size changed?)
    this.formatted = [];
    for(let i = 0; i < this.lines.length; i++){
      this.formatLine(this.lines[i]);
    }
  }

  display(){ // display current content
    let visibleLines = [];
    for(let i = 0; i < this.terminal.charHeight() && i + this.scrollPos < this.formatted.length; i++){
      visibleLines.push(this.formatted[i + this.scrollPos]);
    }
    // is there space left at the end for displaying the dynamic line?
    if(visibleLines.length < this.terminal.charHeight() && this.dynamic.length > 0){
      let formattedDynamic = this.formatLine(this.dynamic);
      for(let j = 0; j < formattedDynamic.length && visibleLines.length < this.terminal.charHeight(); j++){
        visibleLines.push(formattedDynamic[j]);
      }
    }
    this.terminal.clear();
    this.terminal.displayScreen(visibleLines);
  }

  scrollUp(){
    if(this.scrollPos > 0){
      this.scrollPos--;
    }
  }

  scrollDown(){
    if(this.scrollPos + this.terminal.charHeight() < this.formatted){
      this.scrollPos++;
    }
  }

  scrollToEnd(){
    this.scrollPos = this.formatted.length - this.terminal.charHeight();
    if(this.scrollpos < 0){
      this.scrollPos = 0;
    }
  }
}
