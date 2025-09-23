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
        
        // Añadir animación de puntuación
        this.scoreAnimations.push({
            points: totalPoints,
            x: x,
            y: y,
            alpha: 255,
            scale: 1,
            velocity: createVector(random(-1, 1), -3),
            age: 0,
            maxAge: 60,
            comboCount: this.comboCount,
            isPositive: points > 0
        });
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
        
        // Actualizar animaciones de puntuación
        for (let i = this.scoreAnimations.length - 1; i >= 0; i--) {
            const anim = this.scoreAnimations[i];
            anim.age++;
            anim.y += anim.velocity.y;
            anim.x += anim.velocity.x;
            anim.velocity.y *= 0.95; // Desaceleración
            anim.alpha = map(anim.age, 0, anim.maxAge, 255, 0);
            anim.scale = map(anim.age, 0, anim.maxAge * 0.3, 0.5, 1.5);
            
            if (anim.age >= anim.maxAge) {
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
        
        // Mostrar puntuación principal
        textAlign(RIGHT, TOP);
        textSize(40);
        
        // Sombra de texto
        fill(0, 0, 0, 150);
        text(`Score: ${Math.floor(this.displayScore)}`, width - 38, 42);
        
        // Texto principal
        fill(255, 255, 255);
        text(`Score: ${Math.floor(this.displayScore)}`, width - 40, 40);
        
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
        const lifeY = 40;
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
        
        // Mostrar animaciones de puntuación
        for (let anim of this.scoreAnimations) {
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
        
        // Mostrar animación de Game Over si el juego terminó
        if (this.gameOver && this.gameOverAnimation) {
            this.gameOverAnimation.display();
        }
    }
    
    drawHeart(x, y, size) {
        push();
        translate(x, y);
        
        // Sombra del corazón
        fill(0, 0, 0, 100);
        noStroke();
        beginShape();
        vertex(0, -size/4);
        bezierVertex(size/4, -size/2, size/2, -size/4, 0, size/2);
        bezierVertex(-size/2, -size/4, -size/4, -size/2, 0, -size/4);
        endShape(CLOSE);
        
        // Corazón
        fill(255, 0, 0);
        noStroke();
        beginShape();
        vertex(0, -size/4);
        bezierVertex(size/4, -size/2, size/2, -size/4, 0, size/2);
        bezierVertex(-size/2, -size/4, -size/4, -size/2, 0, -size/4);
        endShape(CLOSE);
        
        // Brillo
        fill(255, 255, 255, 100);
        ellipse(-size/5, -size/5, size/4, size/4);
        
        pop();
    }
}
