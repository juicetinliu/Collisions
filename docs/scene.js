class Scene{
    constructor(){
        this.x = windowWidth / 2;
        this.y = windowHeight / 2;
        this.w = windowWidth;
        this.h = windowHeight;
        this.things = [];
        this.collisionPairs = [];
        this.collisionGraph = new QuadTree(this.x, this.y, this.w, this.h);
        this.collider = new ThingCollider();

        this.mouseClick = 0;

        this.selectedThing = null;
        this.selectionVelocity = createVector(0, 0);
    }

    render(){
        // this.collisionGraph.draw();
        this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw());
        this.run();
    }

    add_thing(thing){
        this.things.push(thing);
        return thing;
    }

    run(){
        this.mouse_interaction();

        this.collisionGraph.reset();
        this.collisionPairs = [];
        this.things.forEach(thing => {
            this.collisionGraph.insert(thing);
        });
        checked_collisions = 0;

        //identify colliding pairs
        this.things.forEach(thing => {
            let search_radius = thing.bbox[0] - 1e-4 + thing.vel.mag()*2
            let nearby = this.collisionGraph.search_circle(thing.pos, search_radius);
            // let nearby = this.collisionGraph.search_rect(thing.pos, max(thing.bbox) + thing.vel.mag()*2, max(thing.bbox) + thing.vel.mag()*2);
            nearby.forEach(othing => {
                if(thing !== othing){
                    let collides = this.collider.check_collision(othing, thing);
                    checked_collisions ++;
                    
                    if(collides){
                        let newPair = new CollidedThingPair(othing, thing, collides);
                        if(!object_list_contains(this.collisionPairs, newPair)){
                            this.collisionPairs.push(newPair);
                        }
                    }
                }
            });
        });
        colliding_pairs = this.collisionPairs.length;

        //resolve colliding pairs
        this.collisionPairs.forEach(pair => {
            this.collider.collide(pair.a, pair.b, pair.intersection); 
        })
        
        this.things.forEach(thing => {
            thing.move();
        });

        for(let t = this.things.length - 1; t >= 0; t--){
            let thing = this.things[t];
            if(!intersect_circle_rect(thing.pos, thing.rad, createVector(this.x, this.y), this.w, this.h)){
                this.things.splice(t, 1);
            }
        }
    }

    mouse_interaction(){
        if(this.mouseClick === 0){ //not clicked
            this.selectedThing = null;
            this.things.forEach(thing => {
                thing.unhighlight();
                if(thing.mouse_within()){
                    this.selectedThing = thing;
                }
            });
            if(this.selectedThing){
                this.selectedThing.highlight();
            }

            if(mouseIsPressed){
                this.mouseClick = 1;
            }
        }else if(this.mouseClick === 1){ //rising edge
            if(!this.selectedThing){
                this.selectedThing = scene.add_thing(new Circle([mouseX,mouseY], [0, 0], 0, 15, CollisionType.DYNAMIC));
                this.selectedThing.highlight();
            }
            this.selectedThing.lock();
            this.selectedThing.setVel([0,0]);

            this.mouseClick = 2;
        }else if(this.mouseClick === 2){ //clicked
            stroke(0, 255, 255);
            line(this.selectedThing.pos.x, this.selectedThing.pos.y, mouseX, mouseY);
            this.selectionVelocity.set(this.selectedThing.pos.copy().sub(mouseX, mouseY)).mult(0.1);

            if(this.selectionVelocity.mag() <= 0.5){
                this.selectionVelocity.set(0, 0);
            }

            if(!mouseIsPressed){
                this.mouseClick = 3;
            }
        }else{ //falling edge
            this.selectedThing.unhighlight();
            this.selectedThing.unlock();
            this.selectedThing.setVel([this.selectionVelocity.x, this.selectionVelocity.y]);

            this.selectedThing = null;
            this.selectionVelocity.set(0,0);

            this.mouseClick = 0;
        }
    }
}

class CollidedThingPair{
    constructor(a, b, i){
        this.a = a;
        this.b = b;
        this.intersection = i;
    }

    equals(opair){
        return (this.a === opair.a && this.b === opair.b) || (this.a === opair.b && this.b === opair.a);
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

    search_rect(pos, w, h){ //search for things in a rectangle around a point pos
        let found_things = [];

        if(!intersect_rect_rect(this.pos, this.w, this.h, pos, w, h)) return found_things;

        this.things.forEach(thing => {
            if(intersect_point_rect(thing.pos, pos, w, h)){
                found_things.push(thing);
            }
        });

        if(this.TL === null) return found_things;

        found_things = found_things.concat(this.TL.search_rect(pos, w, h))
        found_things = found_things.concat(this.TR.search_rect(pos, w, h))
        found_things = found_things.concat(this.BL.search_rect(pos, w, h))
        found_things = found_things.concat(this.BR.search_rect(pos, w, h))
        
        return found_things;
    }

    search_circle(pos, rad){ //search for things in a circle around a point pos
        let found_things = [];

        if(!intersect_circle_rect(pos, rad, this.pos, this.w, this.h)) return found_things;

        this.things.forEach(thing => {
            if(intersect_point_circle(thing.pos, pos, rad, false)){
                found_things.push(thing);
            }
        });

        if(this.TL === null) return found_things;

        found_things = found_things.concat(this.TL.search_circle(pos, rad))
        found_things = found_things.concat(this.TR.search_circle(pos, rad))
        found_things = found_things.concat(this.BL.search_circle(pos, rad))
        found_things = found_things.concat(this.BR.search_circle(pos, rad))
        
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