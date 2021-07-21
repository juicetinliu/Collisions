const types_of_things = {
    POINT: "POINT",
    LINE: "LINE",
    CIRCLE: "CIRCLE",
    RECT: "RECT",
}

const collision_properties = {
    NONE: "NONE", //won't collide at all
    STATIC: "STATIC", //won't react to collisions like a wall
    DYNAMIC: "DYNAMIC", //will react to collisions like a ball
}

let ThingType = types_of_things;
let CollisionType = collision_properties;

class Thing{
    constructor(mass = 0, thingType = null, collisionType = CollisionType.NONE){
        this.mass = mass;
        this.thingType = thingType;
        this.collisionType = collisionType;
        this.bbox = [0, 0];
        this.highlighted = false;
        this.locked = false;
    }

    draw(){}

    fill_stroke(f = -1, s = 255, sw = 1){
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

    move(friction = 0.999){
        if(this.locked) return;

        this.vel.add(this.acc);
        this.pos.add(this.vel);

        if(this.collisionType !== CollisionType.STATIC){
            this.vel.mult(friction);
            this.acc.mult(friction);
        }
        if(this.vel.magSq() < 1e-4) this.vel.setMag(0);
        if(this.acc.magSq() < 1e-4) this.acc.setMag(0);
    }

    lock(){
        this.locked = true;
    }

    unlock(){
        this.locked = false;
    }

    setPos(newpos){
        this.pos.set(...newpos);
    }

    setVel(newvel){
        this.vel.set(...newvel);
    }

    intersects(){
        return false;
    }

    mouse_within(){
        return false;
    }

    highlight(){
        this.highlighted = true;
    }

    unhighlight(){
        this.highlighted = false;
    }
}

class Point extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], mass = 0, collisionType = CollisionType.STATIC){
        super(mass, ThingType.POINT, collisionType);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
    }

    draw(s = 255, sw = 1){
        this.fill_stroke(-1, s, sw);
        let p = this.pos;
        point(p.x, p.y);
    }

    intersects(other){
        switch (other.thingType) {
            case ThingType.POINT:
                return intersect_point_point(this.pos, other.pos);
            
            case ThingType.CIRCLE:
                return intersect_point_circle(this.pos, other.pos, other.rad);
            
            case ThingType.RECT:
                return intersect_point_rect(this.pos, other.pos, other.w, other.h);

            case ThingType.LINE:
                return intersect_point_line(this.pos, other.posA, other.posB);
        
            default:
                return false;
        }
    }

    mouse_within(){
        return intersect_point_point(this.pos, createVector(mouseX, mouseY));
    }
}

class Line extends Thing{
    constructor(posA = [0, 0], posB = [10, 10], vel = 0, acc = 0, mass = 0, collisionType = CollisionType.STATIC){
        super(mass, ThingType.LINE, collisionType);
        this.posA = to_2d_vector(posA);
        this.posB = to_2d_vector(posB);
    }

    move(){}

    draw(s = 255, sw = 1){
        this.fill_stroke(-1, s, sw);
        let p_a = this.posA;
        let p_b = this.posB;
        line(p_a.x, p_a.y, p_b.x, p_b.y);
    }

    setPos(newpos){
        this.posB.set(...newpos);
    }

    intersects(other){
        switch(other.thingType) {
            case ThingType.POINT:
                return intersect_point_line(other.pos, this.posA, this.posB);
            
            case ThingType.CIRCLE:
                return intersect_circle_line(other.pos, other.rad, this.posA, this.posB);
            
            case ThingType.RECT:
                return intersect_rect_line(other.pos, other.w, other.h, this.posA, this.posB);

            case ThingType.LINE:
                return intersect_line_line(this.posA, this.posB, other.posA, other.posB);
        
            default:
                return false;
        }
    }

    mouse_within(){
        return intersect_point_line(createVector(mouseX, mouseY), this.posA, this.posB);
    }
}

class Circle extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], rad = 10, collisionType = CollisionType.STATIC, mass = rad){
        super(mass, ThingType.CIRCLE, collisionType);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
        this.rad = rad;
        this.bbox = [rad*2, rad*2]
    }

    draw(f = -1, s = 255, sw = 1){
        this.collisionType === CollisionType.STATIC ? this.fill_stroke(max(f, 100), s, sw) : this.fill_stroke(f, s, sw);
        let p = this.pos;
        ellipse(p.x, p.y, this.rad*2, this.rad*2);
        // let l = p.copy().add(this.vel.copy().setMag(this.rad));
        // line(p.x, p.y, l.x, l.y);
        // point(p.x, p.y);
    }

    intersects(other){
        switch(other.thingType){
            case ThingType.POINT:
                return intersect_point_circle(other.pos, this.pos, this.rad);
            
            case ThingType.CIRCLE:
                return intersect_circle_circle(this.pos, this.rad, other.pos, other.rad);
            
            case ThingType.RECT:
                return intersect_circle_rect(this.pos, this.rad, other.pos, other.w, other.h);

            case ThingType.LINE:
                return intersect_circle_line(this.pos, this.rad, other.posA, other.posB, true);
        
            default:
                return false;
        }
    }

    mouse_within(){
        return intersect_point_circle(createVector(mouseX, mouseY), this.pos, this.rad);
    }
}

class Rect extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], dims = [10, 10], mass = 0, collisionType = CollisionType.STATIC){
        super(mass, ThingType.RECT, collisionType);
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
        this.w = dims[0];
        this.h = dims[1];
        this.bbox = [this.w, this.h];
    }

    draw(f = -1, s = 255, sw = 1){
        this.fill_stroke(f, s, sw);
        let p = this.pos;
        rectMode(CENTER);
        rect(p.x, p.y, this.w, this.h);
    }

    intersects(other){
        switch(other.thingType) {
            case ThingType.POINT:
                return intersect_point_rect(other.pos, this.pos, this.w, this.h);
            
            case ThingType.CIRCLE:
                return intersect_circle_rect(other.pos, other.rad, this.pos, this.w, this.h);
            
            case ThingType.RECT:
                return intersect_rect_rect(this.pos, this.w, this.h, other.pos, other.w, other.h);

            case ThingType.LINE:
                return intersect_rect_line(this.pos, this.w, this.h, other.posA, other.posB);
        
            default:
                return false;
        }
    }

    mouse_within(){
        return intersect_point_rect(createVector(mouseX, mouseY), this.pos, this.w, this.h);
    }
}

function to_2d_vector(inp){
    if(!Array.isArray(inp)){
        if(typeof inp === 'number'){
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