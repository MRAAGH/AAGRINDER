// Wrapper for canvas, allows drawing text

const PADDING = 5;
const LINE_SPACING = 30;
const CHAR_WIDTH = 18;

class Terminal {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.font = '30px monospace';
  }

  resize(w, h){
    $(this.canvas).attr('width', w + 'px');
    $(this.canvas).attr('height', h + 'px');
  }

  charHeight(){ // number of characters that fit
    return Math.floor((this.canvas.height - 2 * PADDING) / LINE_SPACING);
  }

  charWidth(){ // number of characters that fit
    return Math.floor((this.canvas.width - 2 * PADDING) / CHAR_WIDTH);
  }

  clear(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  test(content){
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText(content, PADDING, PADDING + LINE_SPACING);
    this.ctx.fillText(content, PADDING, PADDING + LINE_SPACING * 2);
  }

  displayScreen(lines){
    for(let i = 0; i < lines.length; i++){
      this.displayLine(lines[i], i);
    }
  }

  displayLine(line, ypos){
    this.ctx.fillStyle = "white";
    this.ctx.fillText(line, PADDING, PADDING + (ypos + 1) * LINE_SPACING);
  }
}
