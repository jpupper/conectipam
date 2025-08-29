let Pserver;
let PNT;
let SQ;
function setup() {
  createCanvas(windowWidth, windowHeight);
  Pserver = new PointServer();
 // PNT = new PlayerPntsManager();
  SQ = new SeqManager();
}

function draw() {
  background(0);

  SQ.display();
  SQ.update();

  //PNT.display();
  //PNT.update();

  /*fill(255);
  textSize(12);
  text(`Puntos Lidar: ${Pserver.points.length}`, 10, 20);
  */
 
  Pserver.display();
  Pserver.update();
  
}

// Touch event handlers for p5.js
function touchStarted() {
  return false; // Prevent default
}

function touchMoved() {
  return false; // Prevent default
}

function touchEnded() {
  return false; // Prevent default
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

