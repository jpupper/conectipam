class TrailSystem {
    constructor() {
        this.trails = [];
        this.maxTrails = 200; // Límite para evitar problemas de rendimiento
    }

    addTrail(x, y, id, color) {
        // Agregar un nuevo punto de rastro
        this.trails.push(new TrailPoint(x, y, id, color));
        
        // Limitar la cantidad de puntos de rastro
        if (this.trails.length > this.maxTrails) {
            this.trails.shift(); // Eliminar el más antiguo
        }
    }

    update() {
        // Actualizar todos los puntos de rastro
        for (let i = this.trails.length - 1; i >= 0; i--) {
            this.trails[i].update();
            if (this.trails[i].isDead()) {
                this.trails.splice(i, 1);
            }
        }
    }

    display() {
        // Agrupar los puntos por ID para dibujar líneas continuas
        const trailsByID = {};
        
        // Organizar los puntos por ID
        for (let i = 0; i < this.trails.length; i++) {
            const trail = this.trails[i];
            if (!trailsByID[trail.id]) {
                trailsByID[trail.id] = [];
            }
            trailsByID[trail.id].push(trail);
        }
        
        // Dibujar cada rastro como una línea continua
        for (const id in trailsByID) {
            const points = trailsByID[id].sort((a, b) => b.age - a.age); // Ordenar por edad
            
            if (points.length > 1) {
                // Dibujar líneas conectando los puntos
                for (let i = 0; i < points.length - 1; i++) {
                    const current = points[i];
                    const next = points[i + 1];
                    
                    // Calcular opacidad basada en la edad
                    const alpha = map(current.age, 0, current.maxAge, 200, 0);
                    
                    // Dibujar línea con degradado
                    stroke(red(current.color), green(current.color), blue(current.color), alpha);
                    strokeWeight(map(current.age, 0, current.maxAge, 12, 1));
                    line(current.pos.x, current.pos.y, next.pos.x, next.pos.y);
                }
                
                // Dibujar puntos brillantes en las articulaciones
                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
                    const alpha = map(point.age, 0, point.maxAge, 150, 0);
                    
                    noStroke();
                    fill(red(point.color), green(point.color), blue(point.color), alpha);
                    ellipse(point.pos.x, point.pos.y, 8, 8);
                }
            }
        }
    }
}

class TrailPoint {
    constructor(x, y, id, baseColor) {
        this.pos = createVector(x, y);
        this.id = id;
        this.age = 0;
        this.maxAge = 60; // Duración del rastro
        
        // Usar el color base o generar uno aleatorio brillante
        if (baseColor) {
            this.color = color(
                constrain(red(baseColor) + 50, 0, 255),
                constrain(green(baseColor) + 50, 0, 255),
                constrain(blue(baseColor) + 50, 0, 255)
            );
        } else {
            this.color = color(random(150, 255), random(150, 255), random(150, 255));
        }
    }
    
    update() {
        this.age++;
    }
    
    isDead() {
        return this.age >= this.maxAge;
    }
}
