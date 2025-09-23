let Pserver;
let PNT;
let SQ;
let particleSystem;
let trailSystem;
let dynamicBackground;
let scoreSystem;
let obstacleSystem;
function setup() {
  createCanvas(windowWidth, windowHeight);
  Pserver = new PointServer();
  // PNT = new PlayerPntsManager();
  SQ = new SeqManager();
  particleSystem = new ParticleSystem();
  trailSystem = new TrailSystem();
  dynamicBackground = new DynamicBackground();
  scoreSystem = new ScoreSystem();
  obstacleSystem = new ObstacleSystem();
}

function draw() {
  // Dibujar fondo dinámico primero
  dynamicBackground.update();
  dynamicBackground.display();

  // Actualizar y mostrar rastros
  trailSystem.update();
  trailSystem.display();
  
  // Actualizar y mostrar secuencias
  SQ.display();
  SQ.update();

  // Actualizar y mostrar el servidor de puntos
  Pserver.display();
  Pserver.update();
  
  // Actualizar y mostrar obstáculos
  obstacleSystem.update();
  obstacleSystem.display();
  
  // Comprobar colisiones con obstáculos
  const collisionResult = obstacleSystem.checkCollisions(Pserver.getAllPoints());
  if (collisionResult.collision) {
    // Penalizar al jugador
    scoreSystem.addScore(-10, collisionResult.collisionPoint.x, collisionResult.collisionPoint.y);
    
    // Reiniciar secuencias activas
    SQ.reiniciarTodasLasSecuencias();
    
    // Reiniciar combo
    scoreSystem.resetCombo();
  }
  
  // Actualizar y mostrar efectos de partículas
  particleSystem.update();
  particleSystem.display();
  
  // Actualizar y mostrar sistema de puntuación
  scoreSystem.update();
  scoreSystem.display();
  
  // Agregar rastros para cada punto del servidor
  const allPoints = Pserver.getAllPoints();
  for (let i = 0; i < allPoints.length; i++) {
    const p = allPoints[i];
    if (frameCount % 3 === 0) { // Añadir un punto cada 3 frames para no saturar
      trailSystem.addTrail(p.x, p.y, p.id, color(255, 100, 100));
    }
    
    // Añadir ondas al fondo cuando hay movimiento significativo
    if (frameCount % 30 === 0) {
      dynamicBackground.addRipple(p.x, p.y);
    }
  }
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
  dynamicBackground.resize();
}

