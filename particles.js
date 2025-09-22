class ParticleSystem {
    constructor() {
        this.explosionParticles = [];
        this.hoverParticles = [];
    }

    // Create explosion particles when a sequence is completed
    createExplosion(x, y, color) {
        // Create a burst of particles
        for (let i = 0; i < 150; i++) { // Aumentado de 100 a 150 partículas
            this.explosionParticles.push(new ExplosionParticle(x, y, color));
        }
    }

    // Create hover particles when hovering over a point
    createHoverEffect(x, y, color) {
        // Create a small number of hover particles
        for (let i = 0; i < 5; i++) { // Aumentado de 3 a 5 partículas
            this.hoverParticles.push(new HoverParticle(x, y, color));
        }
    }

    update() {
        // Update and remove explosion particles
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            this.explosionParticles[i].update();
            if (this.explosionParticles[i].isDead()) {
                this.explosionParticles.splice(i, 1);
            }
        }

        // Update and remove hover particles
        for (let i = this.hoverParticles.length - 1; i >= 0; i--) {
            this.hoverParticles[i].update();
            if (this.hoverParticles[i].isDead()) {
                this.hoverParticles.splice(i, 1);
            }
        }
    }

    display() {
        // Display explosion particles
        for (let i = 0; i < this.explosionParticles.length; i++) {
            this.explosionParticles[i].display();
        }

        // Display hover particles
        for (let i = 0; i < this.hoverParticles.length; i++) {
            this.hoverParticles[i].display();
        }
    }
}

class ExplosionParticle {
    constructor(x, y, baseColor) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(2, 10));
        this.acceleration = createVector(0, 0.1);
        this.lifespan = 400; // Aumentado de 255 a 400
        
        // Generate a random color based on the base color with some variation
        if (baseColor) {
            this.color = color(
                red(baseColor) + random(-50, 50),
                green(baseColor) + random(-50, 50),
                blue(baseColor) + random(-50, 50)
            );
        } else {
            // Default to random bright colors if no base color provided
            this.color = color(random(100, 255), random(100, 255), random(100, 255));
        }
        
        this.size = random(5, 15);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.lifespan -= 3; // Reducido de 5 a 3 para que duren más tiempo
        
        // Add some random movement
        this.velocity.x += random(-0.5, 0.5);
        this.velocity.y += random(-0.5, 0.5);
    }

    display() {
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
        ellipse(this.position.x, this.position.y, this.size, this.size);
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

class HoverParticle {
    constructor(x, y, baseColor) {
        this.position = createVector(
            x + random(-30, 30), 
            y + random(-30, 30)
        );
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.lifespan = 200; // Aumentado de 100 a 200
        
        // Use the base color with some transparency
        if (baseColor) {
            this.color = color(
                red(baseColor),
                green(baseColor),
                blue(baseColor),
                200
            );
        } else {
            // Default to white/yellow if no base color provided
            this.color = color(255, 255, 200, 200);
        }
        
        this.size = random(10, 15);
    }

    update() {
        this.position.add(this.velocity);
        this.lifespan -= 2; // Reducido de 5 a 2 para que duren más tiempo
        
        // Gentle movement
        this.velocity.x += random(-0.1, 0.1);
        this.velocity.y += random(-0.1, 0.1);
        
        // Limit velocity for smoother movement
        this.velocity.limit(2);
    }

    display() {
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
        ellipse(this.position.x, this.position.y, this.size, this.size);
    }

    isDead() {
        return this.lifespan <= 0;
    }
}
