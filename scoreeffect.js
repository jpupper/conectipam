class ScoreSystem {
    constructor() {
        this.score = 0;
        this.displayScore = 0;
        this.scoreAnimations = [];
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboThreshold = 3000; // 3 segundos para mantener el combo
        this.highestCombo = 0;
    }
    
    addScore(points, x, y) {
        // Incrementar puntuación
        this.score += points;
        
        // Solo actualizar combo para puntos positivos
        if (points > 0) {
            // Actualizar combo
            const currentTime = millis();
            if (currentTime - this.comboTimer < this.comboThreshold) {
                this.comboCount++;
            } else {
                this.comboCount = 1;
            }
            this.comboTimer = currentTime;
            
            // Actualizar combo más alto
            if (this.comboCount > this.highestCombo) {
                this.highestCombo = this.comboCount;
            }
        }
        
        // Crear animación de puntos
        const bonusPoints = Math.floor(points * (1 + (this.comboCount - 1) * 0.1));
        const totalPoints = points + (bonusPoints - points);
        
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
            comboCount: this.comboCount
        });
    }
    
    resetCombo() {
        // Reiniciar el combo a cero cuando se golpea un obstáculo
        this.comboCount = 0;
        this.comboTimer = 0;
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
        
        // Verificar si el combo ha expirado
        if (millis() - this.comboTimer > this.comboThreshold && this.comboCount > 0) {
            this.comboCount = 0;
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
        
        // Mostrar combo actual si es mayor que 1
        if (this.comboCount > 1) {
            const comboRatio = constrain(1 - (millis() - this.comboTimer) / this.comboThreshold, 0, 1);
            const comboSize = map(comboRatio, 0, 1, 20, 30);
            const comboY = 90;
            
            // Calcular color basado en el tamaño del combo
            colorMode(HSB, 100);
            const hue = map(this.comboCount, 2, 10, 10, 100) % 100;
            const comboColor = color(hue, 80, 100);
            colorMode(RGB, 255);
            
            // Sombra del combo
            fill(0, 0, 0, 150);
            textSize(comboSize);
            text(`Combo x${this.comboCount}!`, width - 38, comboY + 2);
            
            // Texto del combo
            fill(red(comboColor), green(comboColor), blue(comboColor));
            text(`Combo x${this.comboCount}!`, width - 40, comboY);
            
            // Barra de tiempo del combo
            const barWidth = 200;
            const barHeight = 10;
            const barX = width - barWidth - 40;
            const barY = comboY + 40;
            
            // Fondo de la barra
            fill(50, 50, 50, 150);
            rect(barX, barY, barWidth, barHeight, barHeight/2);
            
            // Barra de progreso
            fill(red(comboColor), green(comboColor), blue(comboColor));
            rect(barX, barY, barWidth * comboRatio, barHeight, barHeight/2);
        }
        
        // Mostrar animaciones de puntuación
        for (let anim of this.scoreAnimations) {
            const fontSize = map(anim.points, 1, 20, 20, 40) * anim.scale;
            
            // Determinar color basado en el combo
            let pointColor;
            if (anim.comboCount <= 1) {
                pointColor = color(255, 255, 255);
            } else if (anim.comboCount < 5) {
                pointColor = color(255, 255, 0);
            } else if (anim.comboCount < 10) {
                pointColor = color(255, 150, 0);
            } else {
                pointColor = color(255, 50, 50);
            }
            
            // Sombra del texto
            fill(0, 0, 0, anim.alpha * 0.7);
            textAlign(CENTER, CENTER);
            textSize(fontSize);
            text(`+${anim.points}`, anim.x + 2, anim.y + 2);
            
            // Texto principal
            fill(red(pointColor), green(pointColor), blue(pointColor), anim.alpha);
            text(`+${anim.points}`, anim.x, anim.y);
            
            // Mostrar combo si es relevante
            if (anim.comboCount > 1) {
                const comboFontSize = fontSize * 0.5;
                fill(255, 255, 255, anim.alpha * 0.8);
                textSize(comboFontSize);
                text(`x${anim.comboCount}`, anim.x, anim.y + fontSize * 0.7);
            }
        }
    }
}
