class GameOverAnimation {
    constructor() {
        this.startTime = millis();
        this.duration = 5000; // Duración total de la animación en ms
        this.particles = [];
        this.letters = [];
        
        // Crear partículas para el efecto explosivo
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                pos: createVector(width/2, height/2),
                vel: p5.Vector.random2D().mult(random(2, 10)),
                size: random(5, 20),
                color: color(random(150, 255), random(0, 100), random(0, 100), 255),
                life: 255
            });
        }
        
        // Configurar letras para "GAME OVER"
        const text = "GAME OVER";
        const spacing = width * 0.07;
        const startX = width/2 - (text.length * spacing) / 2 + spacing/2;
        
        for (let i = 0; i < text.length; i++) {
            this.letters.push({
                char: text[i],
                targetX: startX + i * spacing,
                targetY: height/2,
                currentX: random(-width, width * 2),
                currentY: random(-height, height * 2),
                rotation: random(TWO_PI),
                targetRotation: 0,
                size: 0,
                targetSize: height * 0.15,
                hue: i * 25 % 360
            });
        }
        
        // Sonido de Game Over (si está disponible)
        try {
            if (typeof soundFormats === 'function') {
                this.gameOverSound = loadSound('sounds/gameover.mp3');
                this.gameOverSound.play();
            }
        } catch (e) {
            console.log('Sound not supported or file not found');
        }
    }
    
    update() {
        const elapsed = millis() - this.startTime;
        const progress = constrain(elapsed / this.duration, 0, 1);
        
        // Actualizar partículas
        for (let p of this.particles) {
            p.pos.add(p.vel);
            p.vel.mult(0.97); // Desaceleración
            p.life -= 1.5;
        }
        
        // Filtrar partículas muertas
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Añadir nuevas partículas mientras dure la animación
        if (progress < 0.7 && frameCount % 5 === 0) {
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    pos: createVector(width/2 + random(-width/4, width/4), height/2 + random(-height/4, height/4)),
                    vel: p5.Vector.random2D().mult(random(1, 5)),
                    size: random(3, 15),
                    color: color(random(150, 255), random(0, 100), random(0, 100), 255),
                    life: 255
                });
            }
        }
        
        // Actualizar letras
        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];
            const letterProgress = constrain((progress - 0.2 - i * 0.05) * 3, 0, 1);
            
            // Interpolación suave con easing
            const easing = this.easeOutElastic(letterProgress);
            
            letter.currentX = lerp(letter.currentX, letter.targetX, easing * 0.2);
            letter.currentY = lerp(letter.currentY, letter.targetY, easing * 0.2);
            letter.rotation = lerp(letter.rotation, letter.targetRotation, easing * 0.1);
            letter.size = lerp(letter.size, letter.targetSize, easing * 0.1);
        }
    }
    
    display() {
        push();
        
        // Fondo semitransparente
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);
        
        // Dibujar partículas
        for (let p of this.particles) {
            noStroke();
            fill(red(p.color), green(p.color), blue(p.color), p.life);
            ellipse(p.pos.x, p.pos.y, p.size);
        }
        
        // Dibujar letras de "GAME OVER"
        for (let letter of this.letters) {
            push();
            translate(letter.currentX, letter.currentY);
            rotate(letter.rotation);
            
            // Sombra del texto
            fill(0, 0, 0, 150);
            textSize(letter.size);
            textAlign(CENTER, CENTER);
            text(letter.char, 5, 5);
            
            // Texto con color basado en hue
            colorMode(HSB, 360, 100, 100);
            fill(letter.hue, 80, 100);
            colorMode(RGB, 255);
            textSize(letter.size);
            textAlign(CENTER, CENTER);
            text(letter.char, 0, 0);
            
            pop();
        }
        
        // Mostrar puntuación final
        if (millis() - this.startTime > this.duration * 0.5) {
            const alpha = constrain(map(millis() - this.startTime, this.duration * 0.5, this.duration * 0.7, 0, 255), 0, 255);
            
            textAlign(CENTER);
            textSize(40);
            
            // Sombra
            fill(0, 0, 0, alpha * 0.7);
            text(`Puntuación Final: ${Math.floor(scoreSystem.score)}`, width/2 + 3, height * 0.7 + 3);
            
            // Texto
            fill(255, 255, 255, alpha);
            text(`Puntuación Final: ${Math.floor(scoreSystem.score)}`, width/2, height * 0.7);
            
            // Combo más alto
            textSize(30);
            fill(0, 0, 0, alpha * 0.7);
            text(`Combo más alto: x${scoreSystem.highestCombo}`, width/2 + 2, height * 0.7 + 50 + 2);
            
            fill(255, 200, 0, alpha);
            text(`Combo más alto: x${scoreSystem.highestCombo}`, width/2, height * 0.7 + 50);
            
            // Mensaje para reiniciar
            if (millis() - this.startTime > this.duration * 0.8) {
                const pulseAlpha = 127 + 127 * sin(frameCount * 0.1);
                textSize(25);
                fill(255, 255, 255, pulseAlpha);
                text("Toca la pantalla para reiniciar", width/2, height * 0.85);
            }
        }
        
        pop();
    }
    
    // Función de easing para animación más natural
    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        
        return x === 0
            ? 0
            : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
    
    isFinished() {
        return millis() - this.startTime > this.duration;
    }
}
