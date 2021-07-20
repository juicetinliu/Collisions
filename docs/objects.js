const types_of_things = {
    POINT: "point",
    LINE: "line",
    CIRCLE: "circle",
    RECT: "rect",
}

let Thingtype = types_of_things;

class Thing{
    constructor(mass = 0, type = null){
        this.mass = mass;
        this.type = type;
    }

    draw(){}

    fillstroke(f = 255, s = -1, sw = 1){
        if(s === -1){
            noStroke();
        }else{
            stroke(s);
        }
        strokeWeight(sw);
        if(f === -1){
            noFill();
        }else{
            fill(f);
        }
    }

    move(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    }

    collide(){}

    setPos(newpos){
        this.pos.set(...newpos);
    }

    setVel(newvel){
        this.vel.set(...newvel);
    }

    intersects(){
        return false;
    }
}

class Point extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], mass = 0){
        super(mass, Thingtype.POINT);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
    }

    draw(s = 255, sw = 1){
        this.fillstroke(-1, s, sw);
        let p = this.pos;
        point(p.x, p.y);
    }

    intersects(other){
        switch (other.type) {
            case Thingtype.POINT:
                return intersect_point_point(this.pos, other.pos);
            
            case Thingtype.CIRCLE:
                return intersect_point_circle(this.pos, other.pos, other.rad);
            
            case Thingtype.RECT:
                return intersect_point_rect(this.pos, other.pos, other.w, other.h);

            case Thingtype.LINE:
                return intersect_point_line(this.pos, other.pos_a, other.pos_b);
        
            default:
                return false;
        }
    }
}

class Line extends Thing{
    constructor(pos_a = [0, 0], pos_b = [10, 0], vel, acc, mass = 0){
        super(mass, Thingtype.LINE);
        this.pos_a = to_2d_vector(pos_a);
        this.pos_b = to_2d_vector(pos_b);
    }

    move(){}

    draw(s = 255, sw = 1){
        this.fillstroke(-1, s, sw);
        let p_a = this.pos_a;
        let p_b = this.pos_b;
        line(p_a.x, p_a.y, p_b.x, p_b.y);
    }

    setPos(newpos){
        this.pos_b.set(...newpos);
    }

    intersects(other){
        switch(other.type) {
            case Thingtype.POINT:
                return intersect_point_line(other.pos, this.pos_a, this.pos_b);
            
            case Thingtype.CIRCLE:
                return intersect_circle_line(other.pos, other.rad, this.pos_a, this.pos_b);
            
            case Thingtype.RECT:
                return intersect_rect_line(other.pos, other.w, other.h, this.pos_a, this.pos_b);

            case Thingtype.LINE:
                return intersect_line_line(this.pos_a, this.pos_b, other.pos_a, other.pos_b);
        
            default:
                return false;
        }
    }
}

class Circle extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], rad, mass = 0){
        super(mass, Thingtype.CIRCLE);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
        this.rad = rad;
    }

    draw(f = 255, s = -1, sw = 1){
        this.fillstroke(f, s, sw);
        let p = this.pos;
        ellipse(p.x, p.y, this.rad*2, this.rad*2);
    }

    intersects(other){
        switch(other.type) {
            case Thingtype.POINT:
                return intersect_point_circle(other.pos, this.pos, this.rad);
            
            case Thingtype.CIRCLE:
                return intersect_circle_circle(this.pos, this.rad, other.pos, other.rad);
            
            case Thingtype.RECT:
                return intersect_circle_rect(this.pos, this.rad, other.pos, other.w, other.h);

            case Thingtype.LINE:
                return intersect_circle_line(this.pos, this.rad, other.pos_a, other.pos_b);
        
            default:
                return false;
        }
    }

    collide(other){
        if(this.intersects(other)){
            let line_dir = other.pos_b.copy().sub(other.pos_a);
            let normal = createVector(-line_dir.y, line_dir.x).normalize();
            let new_vel = this.vel.copy().sub(normal.mult(2 * this.vel.copy().dot(normal)));

            this.setVel([new_vel.x, new_vel.y]);
        }
    }
}

class Rect extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], dims, mass = 0){
        super(mass, Thingtype.RECT);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
        this.w = dims[0];
        this.h = dims[1];
    }

    draw(f = 255, s = -1, sw = 1){
        this.fillstroke(f, s, sw);
        let p = this.pos;
        rectMode(CENTER);
        rect(p.x, p.y, this.w, this.h);
    }

    intersects(other){
        switch(other.type) {
            case Thingtype.POINT:
                return intersect_point_rect(other.pos, this.pos, this.w, this.h);
            
            case Thingtype.CIRCLE:
                return intersect_circle_rect(other.pos, other.rad, this.pos, this.w, this.h);
            
            case Thingtype.RECT:
                return intersect_rect_rect(this.pos, this.w, this.h, other.pos, other.w, other.h);

            case Thingtype.LINE:
                return intersect_rect_line(this.pos, this.w, this.h, other.pos_a, other.pos_b);
        
            default:
                return false;
        }
    }
}

function to_2d_vector(inp){
    if(!Array.isArray(inp)){
        if(typeof inp == 'number'){
            return createVector(inp, inp);
        }
    }else{
        if(inp.length === 2){
            return createVector(...inp);
        }
    }
    console.error("input should be a number or an array of length 2; defaulting to [0, 0] vector");
    return createVector(0, 0);
}