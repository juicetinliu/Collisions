const MAX_AREA_SCORE = 1e10;

class Scene{
    constructor(){
        this.pos = createVector(windowWidth/2, windowHeight/2);
        this.dims = createVector(windowWidth, windowHeight);

        this.hasGravity = false;
        this.gravity = createVector(0, 0.9);
        this.friction = 0.999;
        this.simulationSteps = 10;

        this.things = [];
        this.collidedThingPairs = [];
        this.collidedThingGroups = [];

        this.collisionGroups = [];

        this.collisionGraph = new Tree();
        // this.collisionGraph = new QuadTree(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
        this.collider = new ThingCollider();

        this.mouseClick = 0;

        this.selectedThing = null;
        this.selectionVelocity = createVector(0, 0);
    }

    toggle_collision_graph(toggle){
        switch(toggle){
            case 0:
                this.collisionGraph = new Tree();
                break;
            case 1:
                this.collisionGraph = new QuadTree(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
                break;
            case 2:
                this.collisionGraph = new SimpleArray();
                break;
            default:
                this.collisionGraph = new Tree();
        }
    }

    toggle_gravity(toggle){
        this.hasGravity = toggle;
    }

    render(){
        if(toggleDebug){    
            this.collisionGraph.draw();
        }
        this.mouse_interaction();
        
        for(let i = 0; i < this.simulationSteps; i++){
            this.run();
        }
        // this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw_with_bounding_box());
        this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw());

    }

    add_thing(thing){
        this.things.push(thing);
        return thing;
    }

    run(){
        this.collisionGraph.reset();
        this.collidedThingPairs = [];
        this.collidedThingGroups = [];
        this.collisionGroups = [];

        //move and set indices
        let thingIndex = 0;
        this.things.forEach(thing => {    
            thing.set_scene_index(thingIndex);
            thingIndex++;
            thing.move(this.friction, this.hasGravity, this.gravity, this.simulationSteps);
            this.collisionGraph.insert(thing);
        });
        statCheckedCollisions = 0;

        let pairID = 0;
        //identify colliding pairs
        this.things.forEach(thing => {
            let search_radius = thing.boundingBox.max_dims() + 1;  //TODO: Make lines search radius match line length
            if(thing.vel.mag() === 0) search_radius = thing.boundingBox.max_dims();
            let nearby = this.collisionGraph.search_circle(thing.pos, search_radius); //TODO: Make search shape custom to each thing
            
            if(toggleDebug){    
                stroke(0,255,255);
                draw_ellipse_vec(thing.pos, search_radius);
            }
            // let nearby = this.collisionGraph.search_rect(thing.pos, max(thing.boundingBox) + thing.vel.mag()*2, max(thing.boundingBox) + thing.vel.mag()*2);

            nearby.forEach(othing => {
                if(thing !== othing){
                    let collides = this.collider.check_collision(othing, thing);
                    statCheckedCollisions ++;
                    
                    if(collides){  //if pair of things actually collide then create collision pair (collides contains intersection point)
                        let newPair = new CollidedThingPair(othing, thing, collides);
                        if(!object_list_contains(this.collidedThingPairs, newPair)){
                            this.collidedThingPairs.push(newPair);

                            //create CollisionGroups
                            let matchingGroup = this.collisionGroups.filter(group => group.contains(thing) || group.contains(othing))[0];
                            if(matchingGroup){ //if collision group already contains this thing then add this to that group
                                if(!matchingGroup.contains(thing)) matchingGroup.add_thing(thing);
                                if(!matchingGroup.contains(othing)) matchingGroup.add_thing(othing);
                            }else{
                                this.collisionGroups.push(newPair.to_collision_group());
                            }

                            //create CollidingThingGroups
                            let matchingThingGroup = this.collidedThingGroups.filter(group => group.contains(thing))[0];
                            let matchingOThingGroup = this.collidedThingGroups.filter(group => group.contains(othing))[0];
                            if(matchingThingGroup || matchingOThingGroup){ //if collision group already contains this thing then add this to that group
                                if(matchingThingGroup){
                                    matchingThingGroup.add_pair(othing, pairID, collides);
                                    if(!matchingOThingGroup){
                                        this.collidedThingGroups.push(new CollidedThingGroup(othing, thing, pairID, collides))
                                    }
                                }
                                if(matchingOThingGroup){
                                    matchingOThingGroup.add_pair(thing, pairID, collides);
                                    if(!matchingThingGroup){
                                        this.collidedThingGroups.push(new CollidedThingGroup(thing, othing, pairID, collides))
                                    }
                                }
                            }else{
                                this.collidedThingGroups.push(...newPair.to_groups(pairID));
                            }
                            pairID++;
                        }
                    }
                }
            });
        });
        statCollidingPairs = this.collidedThingPairs.length;

        if(toggleHighlightCollidingGroups){
            colorMode(HSB);
            let col = 0;
            let colAddAmount = 360/this.collisionGroups.length;
            this.collisionGroups.forEach(group => {
                let thisColor = color(col, 100, 100);
                group.things.forEach(thing => {
                    thing.draw(-1, thisColor, 10);
                });
                col += colAddAmount
            });
            strokeWeight();
            colorMode(RGB);
        }

        //===========================================================================
        //FIXES: BUG_1: MULTIPLE REFLECTIONS CAN OCCUR BETWEEN A CIRCLE AND TWO LINES
        //=========================================================================== 
        let possibleProblematicGroups = [];
        
        this.collidedThingGroups.forEach(group => {
            if(group.thing.thingType === ThingType.CIRCLE){ //if one of the things is a circle and is colliding with more than one other thing
                if(group.otherThings.filter(other => other.thingType === ThingType.LINE).length > 1){
                    for(let o = group.otherThings.length - 1; o >= 0; o--){ //remove non-line things from problematic group
                        if(group.otherThings[o].thingType !== ThingType.LINE){
                            group.otherThings.splice(o, 1);
                            group.pairIDs.splice(o, 1);
                            group.intersections.splice(o, 1);
                        }
                    }
                    possibleProblematicGroups.push(group);
                }
                //TODO: If one the other things is a circle and one is a line, then ignore the other circle and only collide with the line
            }
        });

        let resolvedPairs = [] //needed to avoid removing ids in wrong order

        // if(possibleProblematicGroups.length) console.log("problem!");
        possibleProblematicGroups.forEach(group => {
            let problemResolved = this.collider.collide_group(group);
            //remove pairs that were resolved in problematic groups
            if(problemResolved){
                group.pairIDs.forEach(pid => {
                    // if(!resolvedPairs.includes(pid))
                    resolvedPairs.push(pid);
                });
            }
        });

        resolvedPairs = resolvedPairs.sort((a, b) => b - a); //sorts from largest to smallest ids

        resolvedPairs.forEach(pairID => {
            this.collidedThingPairs.splice(pairID, 1);
        });
        //===========================================================================

        //resolve remaining colliding pairs
        this.collidedThingPairs.forEach(pair => {
            this.collider.collide(pair.a, pair.b, pair.intersection); 
            if(toggleDebug){    
                stroke(0,255,255);
                draw_line_vec(pair.a.pos, pair.b.pos);
            }
        });

        //remove things that move out of scene
        for(let t = this.things.length - 1; t >= 0; t--){
            let thing = this.things[t];
            if(!thing.intersect_rect(this.pos, this.dims)){
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
        }else if(this.mouseClick === 1){ //rising edge -> add thing
            if(!this.selectedThing){
                this.selectedThing = scene.add_thing(new Circle([mouseX,mouseY], [0, 0], 0, 20, CollisionType.DYNAMIC));
                this.selectedThing.highlight();
            }
            this.selectedThing.lock();
            this.selectedThing.set_vel([0,0]);

            this.mouseClick = 2;
        }else if(this.mouseClick === 2){ //clicked -> create selection velocity line
            stroke(0, 255, 255);
            draw_line_vec(this.selectedThing.pos, createVector(mouseX, mouseY));

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
            this.selectedThing.set_vel([this.selectionVelocity.x, this.selectionVelocity.y]);

            this.selectedThing = null;
            this.selectionVelocity.set(0,0);

            this.mouseClick = 0;
        }
    }
}

class CollidedThingPair{ //Contains a pair of colliding things
    constructor(a, b, i){
        this.a = a;
        this.b = b;
        this.intersection = i;
    }

    equals(opair){
        return (this.a === opair.a && this.b === opair.b) || (this.a === opair.b && this.b === opair.a);
    }

    contains(thing){
        return this.a === thing || this.b === thing;
    }

    to_groups(pairID){
        return [new CollidedThingGroup(this.a, this.b, pairID, this.intersection), new CollidedThingGroup(this.b, this.a, pairID, this.intersection)];
    }

    to_collision_group(){
        return new CollisionGroup([this.a, this.b]);
    }
}

class CollidedThingGroup{ //Contains a thing and all its colliding things
    constructor(t, o, pairID, i){
        this.thing = t;
        this.otherThings = [o];
        this.pairIDs = [pairID];
        this.intersections = [i]
    }

    add_pair(thing, pairID, intersection){
        this.otherThings.push(thing);
        this.pairIDs.push(pairID);
        this.intersections.push(intersection);
    }

    add_other_thing(thing){
        this.otherThings.push(thing);
    }

    add_pair_ID(pairID){
        this.pairIDs.push(pairID);
    }

    contains(thing){
        return this.thing === thing;
    }
}

class CollisionGroup{ //Contains all things that are connected through collisions
    constructor(things){
        this.things = things;
    }

    add_thing(thing){
        this.things.push(thing);
    }

    contains(thing){
        return object_list_contains(this.things, thing);
    }
}