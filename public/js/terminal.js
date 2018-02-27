// Wrapper for canvas, allows drawing text from an array of strings

const PADDING = 5;
const LINE_SPACING = 20;
const CHAR_WIDTH = 11.7;

class Terminal {
  constructor(canvas, width, height, xpos){
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ctx = canvas.getContext('2d');
  }

  resize(w, h, xpos){
    this.width = w;
    this.height = h;
    this.xpos = xpos;
  }

  displayScreen(lines){
    this.clearScreen();
    this.ctx.fillStyle = '#7f7f7f';
    for(let i = 0; i < lines.length; i++){
      this.ctx.fillText(
        lines[i],
        PADDING + this.xpos * CHAR_WIDTH,
        PADDING + (i + 1) * LINE_SPACING
      );
    }
  }

  clearScreen(){
    this.ctx.clearRect(this.xpos * CHAR_WIDTH, 0, 4 * PADDING + this.width * CHAR_WIDTH, this.canvas.height);
    this.ctx.font = '20px monospace';
  }

  displayCharacter(x, y, char, color){
    this.ctx.fillStyle = color;
    this.ctx.fillText(
      char,
      PADDING + (this.xpos + x) * CHAR_WIDTH,
      PADDING + (y + 1) * LINE_SPACING
    );
  }
}
