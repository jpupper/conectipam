class SeqManager {
    constructor() {
        this.seqs = [];
        this.addSeq();
        this.lt = millis();
        this.dur = 15000;
        this.score = 0; // Puntuación del jugador
    }

    display() {
        // Mostrar puntuación
        fill(255);
        textSize(40);
        text(`Score: ${this.score}`, width - 200, 50);

        for (let i = this.seqs.length - 1; i >= 0; i--) {
            this.seqs[i].display();
        }
    }

    update() {
        for (let i = this.seqs.length - 1; i >= 0; i--) {
            this.seqs[i].update();
            if (this.seqs[i].todosTouch()) {
                this.score++; // Sumar punto al completar secuencia
                this.seqs.splice(i, 1);
            }
        }
        if (millis() - this.lt > this.dur) {
            this.lt = millis();
            this.addSeq();
        }
    }

    addSeq() {
        this.seqs.push(new Seq());
    }
}

class Seq {
    constructor() {
        this.pnts = [];
        this.idxactive = 0; //hasta que punto esta activo
        const cnt = 5;
        const cf = color(random(100, 255), random(100, 255), random(100, 255));
        this.pointeridx = -1; //OSEA CUAL ES EL POINTER AL QUE ESTA RELACIONADO.
        this.animOffset = 0; // Para las animaciones
        this.animOffset = 0; // Para las animaciones
        for (let i = 0; i < cnt; i++) {
            this.pnts.push(new Pnt(
                random(width * 1/8, width * 7/8),
                random(height * 1/8, height * 7/8),
                i,
                cf
            ));
        }
    }

    display() {
        this.animOffset = (this.animOffset + 0.2) % 60; // Velocidad de animación más lenta
        
        // Dibujar líneas entre puntos con diferentes estilos
        for (let i = this.pnts.length - 1; i >= 0; i--) {
            if (i < this.pnts.length - 1) {
                const x1 = this.pnts[i].pos.x;
                const y1 = this.pnts[i].pos.y;
                const x2 = this.pnts[i + 1].pos.x;
                const y2 = this.pnts[i + 1].pos.y;
                
                if (i < this.idxactive - 1) {
                    // Línea completada - animación pulsante
                    const pulseIntensity = map(sin(frameCount * 0.1), -1, 1, 100, 255);
                    stroke(0, pulseIntensity, 0, 200);
                    strokeWeight(8);
                    line(x1, y1, x2, y2);
                } else if (i === this.idxactive - 1) {
                    // Línea actual - animación direccional
                    stroke(255, 255, 0);
                    strokeWeight(8);
                    this.drawAnimatedLine(x1, y1, x2, y2);
                } else {
                    // Línea futura - interlineada
                    this.drawDashedLine(x1, y1, x2, y2);
                }
            }
        }

        // Actualizar estados y dibujar puntos
        for (let i = 0; i < this.pnts.length; i++) {
            const p = this.pnts[i];
            if (i < this.idxactive) {
                p.setState('active');
            } else if (i === this.idxactive) {
                p.setState('selectable');
            } else {
                p.setState('inactive');
            }
            p.display();
        }

        // Dibujar puntos del servidor
        const allPlayerPoints = Pserver.getAllPoints();
        for(let k = 0; k < allPlayerPoints.length; k++) {
            const pp = allPlayerPoints[k];
            fill(255, 0, 0, 150);
            ellipse(pp.x, pp.y, 40, 40);
        }
    }

    drawAnimatedLine(x1, y1, x2, y2) {
        // Dibujar línea base más tenue
        stroke(255, 255, 0, 30);
        strokeWeight(6);
        line(x1, y1, x2, y2);
        
        // Dibujar puntos animados que se mueven
        const steps = 20 // Menos puntos para que se vea más claro
        stroke(255, 255, 0);
        for (let i = 0; i < steps; i++) {
            const pos = (this.animOffset + i * (60/steps)) % 60;
            const t = pos / 60;
            const px = lerp(x1, x2, t);
            const py = lerp(y1, y2, t);
            strokeWeight(15);
            point(px, py);
        }
    }
    
    drawDashedLine(x1, y1, x2, y2) {
        const segments = 12;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        
        stroke(100, 100, 100, 80);
        strokeWeight(3);
        
        for (let i = 0; i < segments; i += 2) {
            const startX = x1 + dx * i;
            const startY = y1 + dy * i;
            const endX = x1 + dx * (i + 1);
            const endY = y1 + dy * (i + 1);
            line(startX, startY, endX, endY);
        }
    }

    update() {
        for (let i = this.pnts.length - 1; i >= 0; i--) {
            this.pnts[i].update();
        }
        
        //CHECKEO SI EL PÜNTERO TIENE UN ID QUE ESTE ASIGNADO A LA SEQUENCIA Y SI EL ID DEJO DE EXISTIR REINICIE LA SECUENCIA : 
        console.log("pointeridx: ",this.pointeridx);
        if(this.pointeridx != -1){
            let found = false;
            for(let i = 0; i < Pserver.getAllPoints().length; i++) {
                const pp = Pserver.getAllPoints()[i];
                if(pp.id == this.pointeridx){
                    found = true;
                    break;
                }
            }
            if(!found){
                this.reiniciarActivos();
            }
        }

        /*if(Pserver.getAllPoints().length == 0){
            this.reiniciarActivos();
        }*/
        //Comparo las posiciones. 
        for(let i = 0; i < this.pnts.length; i++) {
            const p = this.pnts[i];
            const Pserverpoints = Pserver.getAllPoints();
            
            for(let k = 0; k < Pserverpoints.length; k++) {
                const pp = Pserverpoints[k];
                if (dist(p.pos.x, p.pos.y, pp.x, pp.y) < 40 
                     && this.idxactive == i
                     && (this.pointeridx == pp.id || this.pointeridx == -1)
                    ) {

                    if(this.pointeridx == -1){
                        this.pointeridx = pp.id;
                    }
                    p.active = true;
                    this.idxactive++;
                    break;
                }
            }
        }
    }
    reiniciarActivos(){
        this.idxactive = 0;
        this.pointeridx = -1;
        for(let i = 0; i < this.pnts.length; i++) {
            this.pnts[i].active = false;
        }
        this.score--; // Restar punto cuando se reinicia una secuencia
    }
    todosTouch() {
        return this.pnts.every(p => p.active);
    }
}

class Pnt {
    constructor(_x, _y, _idx, _c) {
        this.pos = createVector(_x, _y);
        this.r = 80;
        this.idx = _idx;
        this.c = _c;
        this.active = false;
        this.state = 'inactive'; // 'active', 'selectable', 'inactive'
    }
    
    display() {
        this.drawPoint();
        this.drawNumber();
    }

    drawPoint() {
        switch(this.state) {
            case 'active':
                // Punto seleccionado - Verde brillante con borde pulsante
                noStroke();
                fill(0, 255, 0, 50);
                ellipse(this.pos.x, this.pos.y, this.r * 1.4, this.r * 1.4);
                
                stroke(0, 255, 0);
                strokeWeight(3);
                fill(0, 200, 0);
                ellipse(this.pos.x, this.pos.y, this.r * 1.2, this.r * 1.2);
                
                noStroke();
                fill(0, 255, 0);
                ellipse(this.pos.x, this.pos.y, this.r * 0.8, this.r * 0.8);
                break;

            case 'selectable':
                // Punto seleccionable - Amarillo con borde pulsante
                noStroke();
                fill(255, 255, 0, 50);
                ellipse(this.pos.x, this.pos.y, this.r * 1.4, this.r * 1.4);
                
                stroke(255, 255, 0);
                strokeWeight(3);
                fill(200, 200, 0);
                ellipse(this.pos.x, this.pos.y, this.r, this.r);
                
                noStroke();
                fill(255, 255, 0);
                ellipse(this.pos.x, this.pos.y, this.r * 0.6, this.r * 0.6);
                break;

            default:
                // Punto inactivo - Gris con borde sutil
                stroke(150, 150, 150);
                strokeWeight(1);
                fill(100, 100, 100);
                ellipse(this.pos.x, this.pos.y, this.r, this.r);
        }
    }

    drawNumber() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(40);
        text(this.idx.toString(), this.pos.x, this.pos.y + 5);
    }

    setState(state) {
        this.state = state;
        this.active = state === 'active';
    }
    
    update() {
        
    }
}
