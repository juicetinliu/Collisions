const MIN_VEL_TOLERANCE = 1e-4;
const SIMULATION_SPEED = 25;

const types_of_things = {
    POINT: "POINT",
    LINE: "LINE",
    CIRCLE: "CIRCLE",
    RECT: "RECT",
}

const collision_properties = {
    NONE: "NONE", //won't collide at all
    STATIC: "STATIC", //will react to collisions like a wall (won't react itself) - (STATIC doesn't collide with STATIC)
    DYNAMIC: "DYNAMIC", //will react to collisions like a ball (will react itself)
}

let ThingType = types_of_things;
let CollisionType = collision_properties;

class Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], mass = 0, thingType = null, collisionType = CollisionType.NONE){
        this.pos = to_2d_vector(pos);
        this.vel = to_2d_vector(vel);
        this.acc = to_2d_vector(acc);
        this.mass = mass;
        this.thingType = thingType;
        this.collisionType = collisionType;
        this.tmpCollisionType = collisionType;
        this.boundingBox = null;

        this.highlighted = false;
        this.locked = false;

        this.sceneIndex = 0;
    }

    set_scene_index(index){
        this.sceneIndex = index;
    }

    draw(){
        if(toggleDebug){
            fill(255);
            text(this.sceneIndex, this.pos.x, this.pos.y);
        }
    }

    draw_with_bounding_box(){
        this.draw();
        this.boundingBox.draw();
    }

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

    move(friction, hasGravity, gravity, simSteps){
        if(this.locked) return;

        this.vel.add(this.acc.copy().mult(deltaTime/(SIMULATION_SPEED * simSteps)));
        if(hasGravity) this.vel.add(gravity.copy().mult(deltaTime/(SIMULATION_SPEED * simSteps)));
        this.pos.add(this.vel.copy().mult(deltaTime/(SIMULATION_SPEED * simSteps)));

        this.boundingBox.update_pos(this.pos);

        if(this.collisionType !== CollisionType.STATIC){
            this.vel.mult(friction);
            this.acc.mult(friction);
        }
        if(this.vel.magSq() < MIN_VEL_TOLERANCE) this.vel.setMag(0);
        if(this.acc.magSq() < MIN_VEL_TOLERANCE) this.acc.setMag(0);
    }

    lock(){
        this.locked = true;
        this.collisionType = CollisionType.STATIC;
    }

    unlock(){
        this.locked = false;
        this.collisionType = this.tmpCollisionType;
    }

    set_pos(newpos){
        this.pos.set(...newpos);
    }

    set_vel(newvel){
        this.vel.set(...newvel);
    }

    intersects(){
        return false;
    }

    intersect_rect(pos, dims){
        switch(this.thingType) {
            case ThingType.POINT:
                return intersect_point_rect(this.pos, pos, dims);
            
            case ThingType.CIRCLE:
                return intersect_circle_rect(this.pos, this.rad, pos, dims);
            
            case ThingType.RECT:
                return intersect_rect_rect(pos, dims, this.pos, this.dims);

            case ThingType.LINE:
                return intersect_rect_line(pos, dims, this.posA, this.posB);
        
            default:
                return false;
        }
    }

    intersect_circle(pos, rad){
        switch(this.thingType) {
            case ThingType.POINT:
                return intersect_point_circle(this.pos, pos, rad);
            
            case ThingType.CIRCLE:
                return intersect_circle_circle(pos, rad, this.pos, this.rad);
            
            case ThingType.RECT:
                return intersect_circle_rect(pos, rad, this.pos, this.dims);

            case ThingType.LINE:
                return intersect_circle_line(pos, rad, this.posA, this.posB);
        
            default:
                return false;
        }
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

    equals(o){
        return this === o;
    };
}

class Point extends Thing{
    constructor(pos = [0, 0], vel = [0, 0], acc = [0, 0], mass = 0, collisionType = CollisionType.STATIC){
        super(pos, vel, acc, mass, ThingType.POINT, collisionType);
    }

    draw(f = 255, s = f, sw = 1){
        super.draw();
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
                return intersect_point_rect(this.pos, other.pos, other.dims);

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
        super([(posA[0] + posB[0]) / 2, (posA[1] + posB[1]) / 2], vel, acc, mass, ThingType.LINE, collisionType);
        this.posA = to_2d_vector(posA);
        this.posB = to_2d_vector(posB);
        let lineMag = abs_vec(this.posB.copy().sub(this.posA));
        this.boundingBox = new AABB(this.pos.x, this.pos.y, lineMag.x, lineMag.y);
    }

    move(){}

    draw(f = 255, s = f, sw = 1){
        super.draw();
        this.fill_stroke(-1, s, sw);
        draw_line_vec(this.posA, this.posB);
    }

    intersects(other){
        switch(other.thingType) {
            case ThingType.POINT:
                return intersect_point_line(other.pos, this.posA, this.posB);
            
            case ThingType.CIRCLE:
                return intersect_circle_line(other.pos, other.rad, this.posA, this.posB, true);
            
            case ThingType.RECT:
                return intersect_rect_line(other.pos, other.dims, this.posA, this.posB);

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
        super(pos, vel, acc, mass, ThingType.CIRCLE, collisionType);
        this.rad = rad;
        this.boundingBox = new AABB(this.pos.x, this.pos.y, rad*2, rad*2);
    }

    draw(f = -1, s = 255, sw = 1){
        super.draw();
        this.collisionType === CollisionType.STATIC ? this.fill_stroke(max(f, 100), s, sw) : this.fill_stroke(f, s, sw);
        draw_ellipse_vec(this.pos, this.rad);
        // if(this.vel.magSq() === 0){
        //     draw_ellipse_vec(this.pos, this.rad/4);

        // }else{
        //     draw_line_vec(this.pos, this.pos.copy().add(this.vel.copy().mult(10)));
        // }
    }

    get_bounding_box_area(){
        this.boundingBox.area();
    }

    intersects(other){
        switch(other.thingType){
            case ThingType.POINT:
                return intersect_point_circle(other.pos, this.pos, this.rad);
            
            case ThingType.CIRCLE:
                return intersect_circle_circle(this.pos, this.rad, other.pos, other.rad);
            
            case ThingType.RECT:
                return intersect_circle_rect(this.pos, this.rad, other.pos, other.dims);

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
    constructor(pos = [0, 0], dims = [10, 10], vel = [0, 0], acc = [0, 0], mass = 0, collisionType = CollisionType.STATIC){
        super(pos, vel, acc, mass, ThingType.RECT, collisionType);
        this.dims = to_2d_vector(dims);
        this.boundingBox = new AABB(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
    }

    draw(f = -1, s = 255, sw = 1){
        super.draw();
        this.fill_stroke(f, s, sw);
        let p = this.pos;
        draw_rect_center_vec(this.pos, this.dims);
    }

    intersects(other){
        switch(other.thingType) {
            case ThingType.POINT:
                return intersect_point_rect(other.pos, this.pos, this.dims);
            
            case ThingType.CIRCLE:
                return intersect_circle_rect(other.pos, other.rad, this.pos, this.dims);
            
            case ThingType.RECT:
                return intersect_rect_rect(this.pos, this.dims, other.pos, other.dims);

            case ThingType.LINE:
                return intersect_rect_line(this.pos, this.dims, other.posA, other.posB);
        
            default:
                return false;
        }
    }

    mouse_within(){
        return intersect_point_rect(createVector(mouseX, mouseY), this.pos, this.dims);
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

function abs_vec(vector){
    return createVector(abs(vector.x), abs(vector.y));
}

function draw_line_vec(pointA, pointB){
    line(pointA.x, pointA.y, pointB.x, pointB.y);
}

function draw_ellipse_vec(center, radius){
    ellipse(center.x, center.y, radius*2, radius*2);
}

function draw_rect_center_vec(center, dims){
    rectMode(CENTER);
    rect(center.x, center.y, dims.x, dims.y);
}

function draw_rect_corner_vec(cornerTl, dims){
    rectMode(CORNER);
    rect(cornerTl.x, cornerTl.y, dims.x, dims.y);
}

function draw_rect_corners_vec(cornerTl, cornerBr){
    rectMode(CORNERS);
    rect(cornerTl.x, cornerTl.y, cornerBr.x, cornerBr.y);
}