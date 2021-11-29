const MAX_TREE_AREA = 1e10;

class Scene{
    constructor(){
        this.pos = createVector(windowWidth/2, windowHeight/2);
        this.dims = createVector(windowWidth, windowHeight);
        this.things = [];
        this.collisionPairs = [];
        this.collisionGraph = new QuadTree(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
        this.collider = new ThingCollider();

        this.mouseClick = 0;

        this.selectedThing = null;
        this.selectionVelocity = createVector(0, 0);
    }

    render(){
        // this.collisionGraph.draw();
        this.run();
        // this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw_with_bounding_box());
        this.things.forEach(thing => thing.highlighted ? thing.draw(128) : thing.draw());

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
            thing.move();
            this.collisionGraph.insert(thing);
        });
        checked_collisions = 0;

        //identify colliding pairs
        this.things.forEach(thing => {
            let search_radius = thing.boundingBox.dims.x * (1 + thing.vel.mag());
            if(thing.vel.mag() === 0) search_radius = thing.boundingBox.dims.x/2 - 1;
            let nearby = this.collisionGraph.search_circle(thing.pos, search_radius);

            // let nearby = this.collisionGraph.search_rect(thing.pos, max(thing.boundingBox) + thing.vel.mag()*2, max(thing.boundingBox) + thing.vel.mag()*2);
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
        }else if(this.mouseClick === 1){ //rising edge -> add object
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
        this.pos = createVector(x, y);
        this.dims = createVector(w, h);
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
        let hw = this.dims.x / 2;
        let hh = this.dims.y / 2;
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
        if(!intersect_point_rect(thing.pos, this.pos, this.dims)){
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

    search_rect(pos, dims){ //search for things in a rectangle around a point pos
        let found_things = [];

        if(!intersect_rect_rect(this.pos, this.dims, pos, dims)) return found_things;

        this.things.forEach(thing => {
            if(thing.intersect_rect(thing.pos, pos, dims)){
                found_things.push(thing);
            }
        });

        if(this.TL === null) return found_things;

        found_things = found_things.concat(this.TL.search_rect(pos, dims))
        found_things = found_things.concat(this.TR.search_rect(pos, dims))
        found_things = found_things.concat(this.BL.search_rect(pos, dims))
        found_things = found_things.concat(this.BR.search_rect(pos, dims))
        
        return found_things;
    }

    search_circle(pos, rad){ //search for things in a circle around a point pos
        let found_things = [];

        if(!intersect_circle_rect(pos, rad, this.pos, this.dims)) return found_things;

        this.things.forEach(thing => {
            if(thing.intersect_circle(pos, rad)){
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
        draw_rect_center_vec(this.pos, this.dims);

        if(this.TL !== null){
            this.TL.draw();
            this.TR.draw();
            this.BL.draw();
            this.BR.draw();
        }
    }
}

class TreeNode{
    constructor(parent, thing = null, lr = 0){
        this.parent = parent;
        this.isLeaf = true; //leaf if node has no left and right and has thing

        this.depth = 0;
        this.id = ".";
        

        this.left = null;
        this.right = null;

        this.lrchild = lr; //0 if left of parent, 1 if right of parent

        if(parent){
            this.depth = parent.depth + 1;
            this.id = parent.id + (this.lrchild === 0 ? ".l" : ".r");
        }

        this.thing = thing;
        if(thing){
            this.boundingBox = thing.boundingBox;
        }
    }

    recalculate_bounding_box(){
        if(!this.isLeaf){
            this.right.recalculate_bounding_box();
            this.left.recalculate_bounding_box();
            this.boundingBox = this.left.boundingBox.union_AABB(this.right.boundingBox);
        }
    }

    set_parent(parent){
        this.parent = parent;
    }

    split_node(leftThing, rightThing){
        this.left = new TreeNode(this, leftThing, 0);
        this.right = new TreeNode(this, rightThing, 1);
        this.boundingBox = this.left.boundingBox.union_AABB(this.right.boundingBox);
        this.thing = null;
        this.isLeaf = false;
    }

    get_area_heuristic(){
        if(this.isLeaf){
            return 0;
        }else{
            return this.boundingBox.area() + this.right.get_area_heuristic() + this.left.get_area_heuristic();
        }
    }

    get_all_children(arr){
        arr.push(this);

        if(!this.isLeaf){
            this.right.get_all_children(arr);
            this.left.get_all_children(arr);
        }
        return arr;
    }

    intersect_circle(pos, rad, found){ //return all things that intersect a circle around a point pos
        FUNCTION_CALLS += 1;
        if(!this.boundingBox.intersects_circle(pos, rad)) return;

        if(this.isLeaf){
            if(this.thing.intersect_circle(pos, rad)){
                found.push(this.thing);
            }
        }else{
            this.left.intersect_circle(pos, rad, found);
            this.right.intersect_circle(pos, rad, found);
        }
        return found;
    }

    draw(){
        if(!this.isLeaf){
            this.boundingBox.draw();
            let tpos = this.boundingBox.pos;
            text(this.id, tpos.x, tpos.y);

            this.left.draw();
            this.right.draw();
        }
    }
}

class Tree{
    constructor(){ //(x, y) center; (w, h) dimensions
        this.things = [];
        
        this.root = null;

        this.allNodes = [];
        this.leafNodes = [];
    }

    process_nodes(){
        this.allNodes = this.root.get_all_children([]);
        this.leafNodes = this.allNodes.filter(node => node.isLeaf);
        this.root.recalculate_bounding_box();
    }

    get_tree_area_heuristic(){
        return this.root.get_area_heuristic();
    }

    insert(thing){
        this.things.push(thing);

        if(this.things.length === 1){
            this.root = new TreeNode(null, thing);
            this.process_nodes();
            return true;
        }

        //find best partner node
        let bestPartnerNode = null;

        if(this.things.length === 2){
            bestPartnerNode = this.root;
        }else{
            let minArea = MAX_TREE_AREA;
            
            this.leafNodes.forEach(node => {
                let parentNode = node.parent;
                let replacementNode = new TreeNode(parentNode);
                replacementNode.split_node(node.thing, thing);
                if (node.lrchild === 1) {
                    parentNode.left = replacementNode;
                }else{
                    parentNode.right = replacementNode;
                }
                let thisArea = this.get_tree_area_heuristic();
                if(thisArea < minArea){
                    minArea = thisArea;
                    bestPartnerNode = node;
                }
                if (node.lrchild === 1) {
                    parentNode.left = node;
                }else{
                    parentNode.right = node;
                }
            });
            // bestPartnerNode = this.leafNodes[0];
        }
        //insert beneath best parent with previous partner node
        bestPartnerNode.split_node(bestPartnerNode.thing, thing);
        //rebalance tree
        this.process_nodes();
    }

    search_circle(pos, rad){ //search for things in a circle around a point pos
        FUNCTION_CALLS = 0;
        return this.root ? this.root.intersect_circle(pos, rad, []) : [];
    }

    draw(){
        this.things.forEach(t => t.draw());

        if(this.root) this.root.draw();
    }
}