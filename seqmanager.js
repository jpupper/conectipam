class SeqManager {
    constructor() {
        this.seqs = [];
        this.addSeq();
        this.lt = millis();
        this.dur = 15000;
    }

    display() {
        for (let i = this.seqs.length - 1; i >= 0; i--) {
            this.seqs[i].display();
        }
    }

    update() {
        for (let i = this.seqs.length - 1; i >= 0; i--) {
            this.seqs[i].update();
            if (this.seqs[i].todosTouch()) {
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
        for (let i = this.pnts.length - 1; i >= 0; i--) {
            stroke(255, 150);
            strokeWeight(5);
            if (this.pnts.length > 1 && i < this.pnts.length - 1) {
                line(
                    this.pnts[i].pos.x,
                    this.pnts[i].pos.y,
                    this.pnts[i + 1].pos.x,
                    this.pnts[i + 1].pos.y
                );
            }
        }

        for (let i = this.pnts.length - 1; i >= 0; i--) {
            this.pnts[i].display();
        }


        const allPlayerPoints = Pserver.getAllPoints();
        for(let k = 0; k < allPlayerPoints.length; k++) {
            const pp = allPlayerPoints[k];
            fill(255,0,0);
            ellipse(pp.x,pp.y,40,40)
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
    }
    
    display() {
        if (this.active) {
            fill(255);
            ellipse(this.pos.x, this.pos.y, this.r * 1.3, this.r * 1.3);
        }
        fill(this.c);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
        fill(255);
        textAlign(CENTER);
        textSize(40);
        text(this.idx.toString(), this.pos.x, this.pos.y);
    }
    
    update() {
        
    }
}
