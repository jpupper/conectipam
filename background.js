class DynamicBackground {
    constructor() {
        this.waves = [];
        this.numWaves = 3;
        this.ripples = [];
        this.maxRipples = 20;
        this.gridSize = 30;
        this.cols = Math.ceil(width / this.gridSize) + 1;
        this.rows = Math.ceil(height / this.gridSize) + 1;
        
        // Crear ondas base
        for (let i = 0; i < this.numWaves; i++) {
            this.waves.push({
                amplitude: random(5, 15),
                period: random(500, 1500),
                phase: random(TWO_PI),
                speed: random(0.001, 0.005)
            });
        }
    }
    
    addRipple(x, y) {
        // Añadir una nueva onda expansiva
        this.ripples.push({
            pos: createVector(x, y),
            radius: 0,
            maxRadius: random(100, 300),
            speed: random(2, 5),
            alpha: 255
        });
        
        // Limitar la cantidad de ondas
        if (this.ripples.length > this.maxRipples) {
            this.ripples.shift();
        }
    }
    
    update() {
        // Actualizar ondas base
        for (let wave of this.waves) {
            wave.phase += wave.speed;
        }
        
        // Actualizar ondas expansivas
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];
            ripple.radius += ripple.speed;
            ripple.alpha = map(ripple.radius, 0, ripple.maxRadius, 255, 0);
            
            if (ripple.radius > ripple.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }
    
    display() {
        // Dibujar fondo base
        background(0, 0, 20); // Azul muy oscuro casi negro
        
        // Crear una cuadrícula de puntos
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const xPos = x * this.gridSize;
                const yPos = y * this.gridSize;
                
                // Calcular desplazamiento basado en ondas base
                let displacement = 0;
                for (let wave of this.waves) {
                    const distance = dist(width/2, height/2, xPos, yPos) * 0.01;
                    displacement += wave.amplitude * sin(distance * wave.period + wave.phase);
                }
                
                // Añadir influencia de ondas expansivas
                for (let ripple of this.ripples) {
                    const d = dist(ripple.pos.x, ripple.pos.y, xPos, yPos);
                    if (d < ripple.radius && d > ripple.radius - 30) {
                        const rippleEffect = map(abs(d - ripple.radius + 15), 0, 15, 10, 0);
                        displacement += rippleEffect;
                    }
                }
                
                // Calcular color basado en posición y desplazamiento
                const hue = map(displacement, -15, 15, 200, 250); // Tonos azules
                const saturation = map(displacement, -15, 15, 50, 100);
                const brightness = map(displacement, -15, 15, 10, 40);
                
                colorMode(HSB, 360, 100, 100, 255);
                const dotColor = color(hue, saturation, brightness);
                colorMode(RGB, 255, 255, 255, 255);
                
                // Dibujar punto
                noStroke();
                fill(dotColor);
                const size = map(displacement, -15, 15, 2, 6);
                ellipse(xPos, yPos, size, size);
            }
        }
        
        // Dibujar ondas expansivas
        for (let ripple of this.ripples) {
            noFill();
            stroke(100, 150, 255, ripple.alpha * 0.5);
            strokeWeight(2);
            ellipse(ripple.pos.x, ripple.pos.y, ripple.radius * 2);
        }
    }
    
    resize() {
        this.cols = Math.ceil(width / this.gridSize) + 1;
        this.rows = Math.ceil(height / this.gridSize) + 1;
    }
}
