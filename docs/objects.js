class Thing{
    constructor(pos, vel, acc, mass){
        if(pos === 0){
            this.pos = createVector(0, 0);
        }else{
            this.pos = createVector(...pos);
        }
        if(vel === 0){
            this.vel = createVector(0, 0);
        }else{
            this.vel = createVector(...vel);
        }
        if(acc === 0){
            this.acc = createVector(0, 0);
        }else{
            this.acc = createVector(...acc);
        }
        this.mass = mass;
    }

    draw(){}

    move(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    }

    setPos(newpos){
        this.pos.set(...newpos);
    }
}

class Point extends Thing{
    constructor(pos, vel, acc){
        super(pos, vel, acc, 0);
    }

    draw(){
        stroke(255);
        let p = this.pos;
        point(p.x, p.y);
    }
}

class Circle extends Thing{
    constructor(pos, vel, acc, rad){
        super(pos, vel, acc, 0);
        this.rad = rad;
    }

    draw(){
        noStroke();
        fill(255);
        let p = this.pos;
        ellipse(p.x, p.y, this.rad*2, this.rad*2);
    }
}

class Rect extends Thing{
    constructor(pos, vel, acc, dims){
        super(pos, vel, acc, 0);
        this.w = dims[0];
        this.h = dims[1];
    }

    draw(){
        noStroke();
        fill(255);
        let p = this.pos;
        rectMode(CENTER);
        rect(p.x, p.y, this.w, this.h);
    }
}