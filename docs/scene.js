const MAX_AREA_SCORE = 1e10;

class Scene{
    constructor(){
        this.pos = createVector(windowWidth/2, windowHeight/2);
        this.dims = createVector(windowWidth, windowHeight);

        this.hasGravity = false;
        this.gravity = createVector(0, 0.9);
        this.friction = 0.999;
        this.simulationSteps = 4;

        this.things = [];
        this.collidedThingPairs = [];
        this.collidedThingGroups = [];

        this.collidedThingGroupsThingIds = [];
        this.collisionGroups = [];

        this.collisionGraph = new QuadTree(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
        this.collider = new Collider(this.friction);

        this.mouseState = 0;

        this.selectedThing = null;
        this.selectionVelocity = createVector(0, 0);
        
        this.stats = {
            checkedCollisions: 0,
            collidingPairs: 0
        }
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

    //MAIN SCENE LOOP
    render(){
        if(toggleDebug){    
            this.collisionGraph.draw();
        }
        //Interaction
        this.mouse_interaction();

        //Simulation
        for(let i = 0; i < this.simulationSteps; i++){
            this.run();
        }
        
        //Rendering
        // this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw_with_bounding_box());
        this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw());

    }

    add_thing(thing){
        this.things.push(thing);
        return thing;
    }

    initialize_scene(){
        this.collisionGraph.reset();
        this.collidedThingPairs = [];
        this.collidedThingGroups = [];
        this.collidedThingGroupsThingIds = [];
        this.collisionGroups = [];
        this.stats.checkedCollisions = 0;
    }

    initialize_things(){
        //move and set indices
        let sceneIndexCounter = 0;
        this.things.forEach(thing => {    
            thing.set_scene_index(sceneIndexCounter);
            sceneIndexCounter++;
            thing.move(this.hasGravity, this.gravity, this.simulationSteps);
            this.collisionGraph.insert(thing);
        });
    }

    //Search through objects to find possibile colliding pairs
    identify_collisions(){
        let pairID = 0;
        //identify colliding pairs
        this.things.forEach(thing => {
            let search_radius = thing.boundingBox.min_bounding_circle_rad() + 1;
            // if(thing.vel.mag() === 0) search_radius = thing.boundingBox.min_bounding_circle_rad();
            let nearby = this.collisionGraph.search_circle(thing.pos, search_radius); //TODO: Make search shape custom to each thing?
            
            if(toggleDebug){    
                noFill();
                stroke(0,255,255);
                draw_ellipse_vec(thing.pos, search_radius);
            }
            // let nearby = this.collisionGraph.search_rect(thing.pos, max(thing.boundingBox) + thing.vel.mag()*2, max(thing.boundingBox) + thing.vel.mag()*2);

            nearby.forEach(othing => {
                if(thing !== othing){
                    let collides = this.collider.check_collision(othing, thing);
                    this.stats.checkedCollisions ++;
                    
                    if(collides){  //if pair of things actually collide then create collision pair (collides contains intersection point)
                        let newPair = new CollidedThingPair(pairID, othing, thing, collides);
                        if(!object_list_contains(this.collidedThingPairs, newPair)){
                            this.collidedThingPairs.push(newPair);

                            //create CollidingThingGroups from pairs
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
                                this.collidedThingGroups.push(...newPair.to_groups());
                            }
                            pairID++;
                        }
                    }
                }
            });
        });
        this.stats.collidingPairs = this.collidedThingPairs.length;
    }

    generate_colliding_groups(renderGroups = false){
        //Find groups of colliding objects from collidedThingGroups
        this.collidedThingGroups.forEach(group => {
            group.thing.set_collided_things_from_collided_thing_group(group);
            this.collidedThingGroupsThingIds.push(group.thing.sceneIndex);
        });

        let visitedIds = Array(this.things.length).fill(false);            
        this.collidedThingGroupsThingIds.forEach(thingId => {
            if(!visitedIds[thingId]){
                visitedIds[thingId] = true;
                let queue = [thingId];
                let thisGroup = [];
                while(queue.length){
                    let checkThingId = queue.shift();
                    thisGroup.push(checkThingId);

                    this.things[checkThingId].collidedThings.forEach(cThing => {
                        let cThingId = cThing.sceneIndex;
                        if(!visitedIds[cThingId]) {
                            queue.push(cThingId);
                            visitedIds[cThingId] = true;
                        }
                    })
                }
                if(thisGroup.length) this.collisionGroups.push(thisGroup);
            }
        });

        if(renderGroups){
            colorMode(HSB);
            let col = 0;
            let colAddAmount = 360/this.collisionGroups.length;
            this.collisionGroups.forEach(group => {
                let thisColor = color(col, 100, 100);
                group.forEach(thingId => {
                    this.things[thingId].draw(-1, thisColor, 10);
                });
                col += colAddAmount
            });
            strokeWeight();
            colorMode(RGB);
        }
    }

    run(){
        this.initialize_scene();

        this.initialize_things();

        this.identify_collisions();

        if(toggleHighlightCollidingGroups){
            this.generate_colliding_groups(true);
        }

        //===========================================================================
        //FIXES: MULTIPLE REFLECTIONS CAN OCCUR BETWEEN A CIRCLE AND TWO WALLS
        //Why this is a problem and more: https://www.myphysicslab.com/engine2D/collision-methods-en.html
        //=========================================================================== 
        let possibleProblematicGroups = [];
        
        this.collidedThingGroups.forEach(group => {
            if(group.thing.thingType === ThingType.CIRCLE){ //if the group's maing thing is a circle and is colliding with more than one other thing
                if(group.otherThings.filter(other => other.thingType === ThingType.LINE).length > 1){ //and there's more than one line in that group
                    for(let o = group.otherThings.length - 1; o >= 0; o--){ //remove non-line things (remember that pairs still exist so they'll be processed later)
                        if(group.otherThings[o].thingType !== ThingType.LINE){
                            group.otherThings.splice(o, 1);
                            group.pairIDs.splice(o, 1);
                            group.intersections.splice(o, 1);
                        }
                    }
                    possibleProblematicGroups.push(group);
                }
                //BUG: one to multiple circle collision problem
            }
        });

        let resolvedPairs = [] //needed to avoid removing ids in wrong order
        possibleProblematicGroups.forEach(group => {
            let problemResolved = this.collider.collide_group(group);
            //only remove pairs that were resolved in problematic groups
            if(problemResolved){
                group.pairIDs.forEach(pid => {
                    resolvedPairs.push(pid);
                });
            }
        });

        resolvedPairs = resolvedPairs.sort((a, b) => b - a); //sorts from largest to smallest ids

        resolvedPairs.forEach(pairID => { //removes  from back to front (since pairIDs already sorted large to small)
            this.collidedThingPairs.splice(pairID, 1);
        });
        //===========================================================================

        //TODO: Fix jittering?

        //sort pairs by pair importance (E.g.: solve static-anything collisions first)
        let collidedThingPairsPrioritySorted = this.collidedThingPairs.sort((a, b) => a.priorityQueueID - b.priorityQueueID);
        
        //resolve remaining colliding pairs
        collidedThingPairsPrioritySorted.forEach(pair => {
            this.collider.collide(pair.a, pair.b, pair.intersection); 
            if(toggleDebug){    
                stroke(0,255,255);
                draw_line_vec(pair.a.pos, pair.b.pos);
            }
        });

        //apply friction to all velocities
        this.things.forEach(thing => {
            thing.apply_friction(this.friction);
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
        if(this.mouseState === 0){ //not clicked
            this.selectedThing = null;
            this.things.forEach(thing => {
                thing.unhighlight();
                if(thing.mouse_within()){
                    this.selectedThing = thing;
                }
            });
            if(this.selectedThing && !document.isMobileOrTabletView){ //don't hightlight on mobile view (taps hold their position)
                this.selectedThing.highlight();
            }

            if(mouseIsPressed){
                this.mouseState = 1;
            }
        }else if(this.mouseState === 1){ //rising edge -> add thing
            if(!this.selectedThing){
                this.selectedThing = scene.add_thing(new Circle([mouseX,mouseY], [0, 0], 0, 20, CollisionType.DYNAMIC));
            }
            this.selectedThing.highlight();
            this.selectedThing.lock();
            this.selectedThing.set_vel([0, 0]);

            this.mouseState = 2;
        }else if(this.mouseState === 2){ //clicked -> create selection velocity line
            stroke(0, 255, 255);
            draw_line_vec(this.selectedThing.pos, createVector(mouseX, mouseY));

            this.selectionVelocity.set(this.selectedThing.pos.copy().sub(mouseX, mouseY)).mult(0.1);

            if(this.selectionVelocity.mag() <= 0.5){
                this.selectionVelocity.set(0, 0);
            }

            if(!mouseIsPressed){
                this.mouseState = 3;
            }
        }else{ //falling edge
            this.selectedThing.unhighlight();
            this.selectedThing.unlock();
            this.selectedThing.set_vel(this.selectionVelocity);

            this.selectedThing = null;
            this.selectionVelocity.set(0,0);

            this.mouseState = 0;
        }
    }
}

class CollidedThingPair{ //Contains a pair of colliding things
    constructor(id, a, b, i){
        this.id = id;
        this.a = a;
        this.b = b;
        this.intersection = i;
        this.priorityQueueID = this.generatePriorityQueueID(this.a, this.b); //lower number = first dealt with
    }

    equals(opair){
        return (this.a === opair.a && this.b === opair.b) || (this.a === opair.b && this.b === opair.a);
    }

    contains(thing){
        return this.a === thing || this.b === thing;
    }

    to_groups(){
        return [new CollidedThingGroup(this.a, this.b, this.id, this.intersection), new CollidedThingGroup(this.b, this.a, this.id, this.intersection)];
    }

    generatePriorityQueueID(a, b){
        if(a.collisionType === CollisionType.STATIC || b.collisionType === CollisionType.STATIC){
            return 0; //first resolve static-anything collisions (FIXES: If two circles hit each other with a wall in the middle, multiple collisions occur)
        }else{
            return 1;
        }
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