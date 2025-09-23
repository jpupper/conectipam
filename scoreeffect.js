class ScoreSystem {
    constructor() {
        this.score = 0;
        this.displayScore = 0;
        this.scoreAnimations = [];
        this.comboCount = 0;
        this.comboTimer = 0;
        // Ya no usaremos comboThreshold porque el combo no expira con el tiempo
        this.highestCombo = 0;
        this.lives = 3; // Sistema de vidas
        this.gameOver = false; // Estado de juego terminado
        this.gameOverAnimation = null; // Animación de Game Over
        this.scoreParticles = []; // Partículas que fluyen hacia el score
        this.scorePosition = createVector(width - 120, 40); // Posición del score para atracción
        this.scoreEffect = { // Efecto visual en el score
            active: false,
            startTime: 0,
            duration: 500,
            isPositive: true,
            intensity: 0
        };
    }
    
    addScore(points, x, y) {
        // Si el juego terminó, no sumar más puntos
        if (this.gameOver) return;
        
        // Calcular puntos con bonificación por combo
        let totalPoints = points;
        
        // Solo actualizar combo para puntos positivos
        if (points > 0) {
            // Incrementar el combo (ya no hay límite de tiempo)
            this.comboCount++;
            
            // Actualizar combo más alto
            if (this.comboCount > this.highestCombo) {
                this.highestCombo = this.comboCount;
            }
            
            // Aplicar bonificación por combo (más generosa)
            const comboMultiplier = 1 + (this.comboCount - 1) * 0.2; // 20% más por cada nivel de combo
            totalPoints = Math.floor(points * comboMultiplier);
        } else {
            // Para puntos negativos, no aplicamos multiplicador de combo
            totalPoints = points;
        }
        
        // Incrementar puntuación
        this.score += totalPoints;
        
        // Activar efecto visual en el score
        this.scoreEffect = {
            active: true,
            startTime: millis(),
            duration: 800,
            isPositive: points > 0,
            intensity: abs(totalPoints) / 10 // Intensidad basada en la cantidad de puntos
        };
        
        // Añadir animación de puntuación
        const anim = {
            points: totalPoints,
            x: x,
            y: y,
            alpha: 255,
            scale: 1,
            velocity: createVector(random(-1, 1), -3),
            age: 0,
            maxAge: 60,
            comboCount: this.comboCount,
            isPositive: points > 0,
            phase: 'rising', // Fases: rising -> falling -> attracting
            phaseStartTime: millis(),
            phaseDuration: {
                rising: 800,
                falling: 1000,
                attracting: 1200
            },
            gravity: 0.15,
            particles: []
        };
        
        // Crear partículas para la animación
        const particleCount = map(abs(totalPoints), 5, 50, 10, 30);
        for (let i = 0; i < particleCount; i++) {
            anim.particles.push({
                pos: createVector(x + random(-20, 20), y + random(-20, 20)),
                vel: createVector(random(-2, 2), random(-5, -2)),
                size: random(3, 8),
                alpha: 255,
                color: points > 0 ? 
                    color(50, 200 + random(-50, 50), 50) : // Verde para positivos
                    color(200 + random(-50, 50), 50, 50)   // Rojo para negativos
            });
        }
        
        this.scoreAnimations.push(anim);
    }
    
    resetCombo() {
        // Reiniciar el combo a cero cuando se golpea un obstáculo
        this.comboCount = 0;
    }
    
    loseLife() {
        // Perder una vida cuando se golpea un obstáculo
        if (this.gameOver) return;
        
        this.lives--;
        
        // Si no quedan vidas, activar Game Over
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameOverAnimation = new GameOverAnimation();
        }
    }
    
    update() {
        // Animar la puntuación mostrada para que se acerque suavemente a la puntuación real
        this.displayScore = lerp(this.displayScore, this.score, 0.1);
        
        // Actualizar efecto visual del score
        if (this.scoreEffect.active) {
            const elapsed = millis() - this.scoreEffect.startTime;
            if (elapsed > this.scoreEffect.duration) {
                this.scoreEffect.active = false;
            }
        }
        
        // Actualizar animaciones de puntuación con fases
        for (let i = this.scoreAnimations.length - 1; i >= 0; i--) {
            const anim = this.scoreAnimations[i];
            const currentTime = millis();
            
            // Actualizar fase de la animación
            if (anim.phase === 'rising') {
                if (currentTime - anim.phaseStartTime > anim.phaseDuration.rising) {
                    anim.phase = 'falling';
                    anim.phaseStartTime = currentTime;
                }
            } else if (anim.phase === 'falling') {
                if (currentTime - anim.phaseStartTime > anim.phaseDuration.falling) {
                    anim.phase = 'attracting';
                    anim.phaseStartTime = currentTime;
                }
            }
            
            // Comportamiento según la fase
            if (anim.phase === 'rising') {
                // Fase de subida inicial
                anim.age++;
                anim.y += anim.velocity.y;
                anim.x += anim.velocity.x;
                anim.velocity.y *= 0.95; // Desaceleración
                anim.alpha = 255;
                anim.scale = map(anim.age, 0, 20, 0.5, 1.5);
                
                // Actualizar partículas en fase de subida
                for (let p of anim.particles) {
                    p.pos.add(p.vel);
                    p.vel.x *= 0.98;
                    p.vel.y *= 0.98;
                }
            } else if (anim.phase === 'falling') {
                // Fase de caída con gravedad
                anim.velocity.y += anim.gravity;
                anim.y += anim.velocity.y;
                anim.x += anim.velocity.x * 0.5;
                
                // Actualizar partículas en fase de caída
                for (let p of anim.particles) {
                    p.vel.y += anim.gravity * 0.8;
                    p.pos.add(p.vel);
                    p.vel.x *= 0.98;
                }
            } else if (anim.phase === 'attracting') {
                // Fase de atracción hacia el score
                const progress = (currentTime - anim.phaseStartTime) / anim.phaseDuration.attracting;
                
                // Mover hacia la posición del score
                const targetX = this.scorePosition.x;
                const targetY = this.scorePosition.y;
                
                // Atracción con aceleración
                const dx = targetX - anim.x;
                const dy = targetY - anim.y;
                const distance = sqrt(dx*dx + dy*dy);
                
                // Velocidad basada en la distancia
                const speed = map(progress, 0, 1, 0.02, 0.2);
                
                anim.x += dx * speed;
                anim.y += dy * speed;
                
                // Reducir tamaño a medida que se acerca
                anim.scale = map(progress, 0, 1, 1, 0.2);
                
                // Actualizar partículas en fase de atracción
                for (let p of anim.particles) {
                    const dx = targetX - p.pos.x;
                    const dy = targetY - p.pos.y;
                    const distance = sqrt(dx*dx + dy*dy);
                    
                    // Velocidad basada en la distancia y el progreso
                    const particleSpeed = map(progress, 0, 1, 0.01, 0.15);
                    
                    p.vel.x = dx * particleSpeed;
                    p.vel.y = dy * particleSpeed;
                    p.pos.add(p.vel);
                    
                    // Reducir tamaño y opacidad
                    p.size = map(progress, 0, 1, p.size, p.size * 0.5);
                    p.alpha = map(progress, 0.5, 1, 255, 0);
                }
                
                // Desvanecer cuando está cerca del objetivo
                if (distance < 50) {
                    anim.alpha = map(distance, 50, 10, 255, 0);
                }
            }
            
            // Eliminar animaciones completadas
            if (anim.phase === 'attracting' && 
                currentTime - anim.phaseStartTime > anim.phaseDuration.attracting) {
                this.scoreAnimations.splice(i, 1);
            }
        }
        
        // Actualizar animación de Game Over si existe
        if (this.gameOverAnimation) {
            this.gameOverAnimation.update();
        }
    }
    
    display() {
        // No necesitamos push/pop aquí ya que estamos en el contexto de p5.js
        
        // Mostrar puntuación principal con efecto
        textAlign(RIGHT, TOP);
        
        // Aplicar efecto visual al score si está activo
        let scoreSize = 40;
        let scoreOffset = 0;
        let scoreColor = color(255, 255, 255);
        
        if (this.scoreEffect.active) {
            const progress = (millis() - this.scoreEffect.startTime) / this.scoreEffect.duration;
            const effectIntensity = sin(progress * PI) * this.scoreEffect.intensity;
            
            // Tamaño pulsante
            scoreSize = 40 + effectIntensity * 2;
            
            // Desplazamiento vertical
            scoreOffset = sin(progress * PI * 2) * effectIntensity * 0.5;
            
            // Color basado en si es positivo o negativo
            if (this.scoreEffect.isPositive) {
                // Verde pulsante para puntos positivos
                const greenIntensity = 150 + effectIntensity * 5;
                scoreColor = color(255, greenIntensity, 255);
            } else {
                // Rojo pulsante para puntos negativos
                const redIntensity = 150 + effectIntensity * 5;
                scoreColor = color(redIntensity, 100, 100);
            }
        }
        
        // Actualizar posición del score para las partículas atraidas
        this.scorePosition = createVector(width - 120, 40 + scoreOffset);
        
        // Sombra de texto
        textSize(scoreSize);
        fill(0, 0, 0, 150);
        text(`Score: ${Math.floor(this.displayScore)}`, width - 38, 42 + scoreOffset);
        
        // Texto principal con color dinámico
        fill(red(scoreColor), green(scoreColor), blue(scoreColor));
        text(`Score: ${Math.floor(this.displayScore)}`, width - 40, 40 + scoreOffset);
        
        // Mostrar combo siempre (incluso si es 0)
        const comboY = 90;
        const comboSize = 30;
        
        // Calcular color basado en el tamaño del combo
        colorMode(HSB, 100);
        const hue = map(this.comboCount, 0, 10, 10, 100) % 100;
        const comboColor = this.comboCount > 0 ? color(hue, 80, 100) : color(0, 0, 70);
        colorMode(RGB, 255);
        
        // Sombra del combo
        fill(0, 0, 0, 150);
        textSize(comboSize);
        text(`Combo x${this.comboCount}`, width - 38, comboY + 2);
        
        // Texto del combo
        fill(red(comboColor), green(comboColor), blue(comboColor));
        text(`Combo x${this.comboCount}`, width - 40, comboY);
        
        // Mostrar vidas
        const lifeSize = 30;
        const lifeY = 150;
        const lifeSpacing = 40;
        
        textAlign(LEFT, TOP);
        
        // Sombra del texto de vidas
        fill(0, 0, 0, 150);
        textSize(lifeSize);
        text(`Vidas: `, 42, lifeY + 2);
        
        // Texto de vidas
        fill(255, 100, 100);
        text(`Vidas: `, 40, lifeY);
        
        // Dibujar corazones para las vidas
        for (let i = 0; i < this.lives; i++) {
            this.drawHeart(150 + i * lifeSpacing, lifeY + lifeSize/2, lifeSize);
        }
        
        // Mostrar animaciones de puntuación con fases
        for (let anim of this.scoreAnimations) {
            // Dibujar partículas primero
            for (let p of anim.particles) {
                noStroke();
                fill(red(p.color), green(p.color), blue(p.color), p.alpha);
                ellipse(p.pos.x, p.pos.y, p.size, p.size);
            }
            
            // Solo mostrar el texto si no está en fase de atracción
            if (anim.phase !== 'attracting') {
                const fontSize = map(Math.abs(anim.points), 1, 20, 20, 40) * anim.scale;
                
                // Determinar color basado en si es positivo o negativo
                let pointColor;
                let prefix = anim.points >= 0 ? '+' : '';
                
                if (!anim.isPositive) {
                    // Puntos negativos en rojo
                    pointColor = color(255, 50, 50);
                } else {
                    // Puntos positivos en verde con intensidad basada en el combo
                    const intensity = map(anim.comboCount, 1, 10, 150, 255);
                    pointColor = color(50, intensity, 50);
                }
                
                // Sombra del texto
                fill(0, 0, 0, anim.alpha * 0.7);
                textAlign(CENTER, CENTER);
                textSize(fontSize);
                text(`${prefix}${anim.points}`, anim.x + 2, anim.y + 2);
                
                // Texto principal
                fill(red(pointColor), green(pointColor), blue(pointColor), anim.alpha);
                text(`${prefix}${anim.points}`, anim.x, anim.y);
                
                // Mostrar combo si es relevante
                if (anim.comboCount > 1 && anim.isPositive) {
                    const comboFontSize = fontSize * 0.5;
                    fill(255, 255, 255, anim.alpha * 0.8);
                    textSize(comboFontSize);
                    text(`x${anim.comboCount}`, anim.x, anim.y + fontSize * 0.7);
                }
            }
            
            // Efectos adicionales según la fase
            if (anim.phase === 'attracting') {
                // Dibujar línea de atracción hacia el score
                const progress = (millis() - anim.phaseStartTime) / anim.phaseDuration.attracting;
                if (progress < 0.7) { // Solo mostrar líneas al principio de la atracción
                    stroke(anim.isPositive ? color(100, 255, 100, 100) : color(255, 100, 100, 100));
                    strokeWeight(1);
                    line(anim.x, anim.y, this.scorePosition.x, this.scorePosition.y);
                }
            }
        }
        
        // Mostrar animación de Game Over si el juego terminó
        if (this.gameOver && this.gameOverAnimation) {
            this.gameOverAnimation.display();
        }
    }
    
    drawHeart(x, y, size) {
        // Usar ancho y alto separados para el corazón
        const ancho = size * 1.2; // Un poco más ancho que alto
        const alto = size;
        
        push();
        translate(x, y);
        
        // Sombra del corazón
        fill(0, 0, 0, 100);
        noStroke();
        beginShape();
        vertex(0, -alto/4);
        bezierVertex(ancho/4, -alto/2, ancho/2, -alto/4, 0, alto/2);
        bezierVertex(-ancho/2, -alto/4, -ancho/4, -alto/2, 0, -alto/4);
        endShape(CLOSE);
        
        // Corazón
        fill(255, 0, 0);
        noStroke();
        beginShape();
        vertex(0, -alto/4);
        bezierVertex(ancho/4, -alto/2, ancho/2, -alto/4, 0, alto/2);
        bezierVertex(-ancho/2, -alto/4, -ancho/4, -alto/2, 0, -alto/4);
        endShape(CLOSE);
        
        // Brillo
        fill(255, 255, 255, 100);
        ellipse(-ancho/5, -alto/5, ancho/4, alto/4);
        
        pop();
    }
}
