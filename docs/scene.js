class Scene{
    constructor(){
        this.x = windowWidth / 2;
        this.y = windowHeight / 2;
        this.w = windowWidth;
        this.h = windowHeight;
        this.things = [];
        this.collisionGraph = new QuadTree(this.x, this.y, this.w, this.h);
        this.collider = new ThingCollider();
    }

    render(){
        this.things.forEach(thing => thing.draw());
        // this.collisionGraph.draw();
        this.run();
    }

    add_object(thing){
        this.things.push(thing);
    }

    remove_object(){
    }

    run(){
        this.collisionGraph.reset();
        this.things.forEach(thing => {
            thing.move();
            this.collisionGraph.insert(thing);
        });
        this.things.forEach(thing => {
            let nearby = this.collisionGraph.find_circle(thing.pos, thing.bbox[0] + thing.vel.mag()*2);
            // let nearby = this.collisionGraph.find_rect(thing.pos, max(thing.bbox) + thing.vel.mag()*2, max(thing.bbox) + thing.vel.mag()*2);
            nearby.forEach(othing => {if(thing !== othing) this.collider.collide(othing, thing)});
        });
    }
}

class QuadTree{
    constructor(x, y, w, h){ //(x, y) center; (w, h) dimensions
        this.things = [];
        this.pos = createVector(x, y)
        this.w = w;
        this.h = h;
        this.capacity = 4;
        this.TL = null;
        this.TR = null;
        this.BL = null;
        this.BR = null;
    }

    reset(){
        this.things = [];
        this.TL = null;
        this.TR = null;
        this.BL = null;
        this.BR = null;
    }

    divide(){
        let hw = this.w / 2;
        let hh = this.h / 2;
        let qw = hw / 2;
        let qh = hh / 2;
        let x = this.pos.x;
        let y = this.pos.y
        this.TL = new QuadTree(x - qw, y - qh, hw, hh);
        this.TR = new QuadTree(x + qw, y - qh, hw, hh);
        this.BL = new QuadTree(x - qw, y + qh, hw, hh);
        this.BR = new QuadTree(x + qw, y + qh, hw, hh);
    }

    insert(thing){
        if(!intersect_point_rect(thing.pos, this.pos, this.w, this.h)){
            return false;
        }

        if(this.things.length < this.capacity && this.TL == null){
            this.things.push(thing);
            return true;
        }else{
            if(this.TL === null) this.divide();

            if(this.TL.insert(thing)) return true;
            if(this.TR.insert(thing)) return true;
            if(this.BL.insert(thing)) return true;
            if(this.BR.insert(thing)) return true;

            return false;
        }
    }

    find_rect(pos, w, h){ //search for things in a rectangle around a point pos
        let found_things = [];

        if(!intersect_rect_rect(this.pos, this.w, this.h, pos, w, h)) return found_things;

        this.things.forEach(thing => {
            if(intersect_point_rect(thing.pos, pos, w, h)){
                found_things.push(thing);
            }
        });

        if(this.TL === null) return found_things;

        found_things = found_things.concat(this.TL.find_rect(pos, w, h))
        found_things = found_things.concat(this.TR.find_rect(pos, w, h))
        found_things = found_things.concat(this.BL.find_rect(pos, w, h))
        found_things = found_things.concat(this.BR.find_rect(pos, w, h))
        
        return found_things;
    }

    find_circle(pos, rad){ //search for things in a circle around a point pos
        let found_things = [];

        if(!intersect_circle_rect(pos, rad, this.pos, this.w, this.h)) return found_things;

        this.things.forEach(thing => {
            if(intersect_point_circle(thing.pos, pos, rad)){
                found_things.push(thing);
            }
        });

        if(this.TL === null) return found_things;

        found_things = found_things.concat(this.TL.find_circle(pos, rad))
        found_things = found_things.concat(this.TR.find_circle(pos, rad))
        found_things = found_things.concat(this.BL.find_circle(pos, rad))
        found_things = found_things.concat(this.BR.find_circle(pos, rad))
        
        return found_things;
    }

    draw(){
        stroke(255);
        noFill();
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.w, this.h);

        if(this.TL !== null){
            this.TL.draw();
            this.TR.draw();
            this.BL.draw();
            this.BR.draw();
        }
    }
}