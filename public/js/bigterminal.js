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
    this.formatLine(content, this.formatted);
    this.display();
  }

  modify(content){
    this.dynamic = content;
    this.display();
  }

  commit(){
    this.println(this.dynamic);
    this.dynamic = '';
    this.display();
  }

  printTruncate(content){ // cut off instead of wrapping
    let truncated = truncateLine(content);
    this.println(truncated);
  }

  formatLine(line, buffer){
    let w = this.terminal.width;
    while(line.length > w){
      buffer.push(line.substring(0, w));
      line = line.substring(w);
    }
    buffer.push(line);
  }

  truncateLine(line){
    let w = this.terminal.width;
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
      this.formatLine(this.lines[i], this.formatted);
    }
  }

  display(){ // display current content
    let visibleLines = [];
    for(let i = 0; i < this.terminal.height && i + this.scrollPos < this.formatted.length; i++){
      visibleLines.push(this.formatted[i + this.scrollPos]);
    }
    // is there space left at the end for displaying the dynamic line?
    if(visibleLines.length < this.terminal.height){
      let formattedDynamic = [];
      this.formatLine(this.dynamic, formattedDynamic);
      for(let j = 0; j < formattedDynamic.length && visibleLines.length < this.terminal.height; j++){
        visibleLines.push(formattedDynamic[j]);
      }
    }
    this.terminal.displayScreen(visibleLines);
  }

  scrollUp(){
    if(this.scrollPos > 0){
      this.scrollPos--;
    }
  }

  scrollDown(){
    if(this.scrollPos + this.terminal.height < this.formatted){
      this.scrollPos++;
    }
  }

  scrollToEnd(){
    this.scrollPos = this.formatted.length - this.terminal.height;
    if(this.scrollpos < 0){
      this.scrollPos = 0;
    }
  }
}
