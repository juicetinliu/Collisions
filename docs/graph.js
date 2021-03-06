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
        stroke(255,0,0);
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

//https://box2d.org/files/ErinCatto_DynamicBVH_GDC2019.pdf
class TreeNode{
    constructor(parent, thing = null, lr = 0){
        this.parent = parent;
        this.isLeaf = true; //leaf if node has no left and right and has thing

        this.depth = 0;
        
        this.left = null;
        this.right = null;

        this.lrchild = lr; //0 if left of parent, 1 if right of parent

        if(parent){
            this.depth = parent.depth + 1;
        }

        this.thing = thing;
        if(thing){
            this.boundingBox = thing.boundingBox;
            this.scoringBoundingBox = this.boundingBox;
        }
    }

    set_parent(parent){
        this.parent = parent;
    }

    set_thing(thing){
        this.thing = thing;
    }

    set_lrchild(lrchild){
        this.lrchild = lrchild;
    }

    set_child_from_lr(lrchild, node){
        if(lrchild === 0){
            this.left = node;
        }else{
            this.right = node;
        }
    }

    set_left_right(left, right, changeLR = false){
        if(left instanceof TreeNode){
            this.left = left;
            if(changeLR){
                this.left.set_parent(this);
                this.left.set_lrchild(0);
            }
        }else{
            this.left = new TreeNode(this, left, 0);
        }

        if(right instanceof TreeNode){
            this.right = right;
            if(changeLR){
                this.right.set_parent(this);
                this.right.set_lrchild(1);
            }
        }else{
            this.right = new TreeNode(this, right, 1);
        }

        this.boundingBox = this.left.boundingBox.union_AABB(this.right.boundingBox);
        this.thing = null;
        this.isLeaf = false;
    }

    update_bounding_box(){
        this.boundingBox = this.left.boundingBox.union_AABB(this.right.boundingBox);
    }

    update_depth(){
        if(this.parent) this.depth = this.parent.depth + 1;
    }

    get_area_heuristic(bottomNode){ //traverse tree upwards from this node to calculate SAH
        if(bottomNode){ //first node we calculate its new area
            return this.boundingBox.area() + ((this.parent) ? this.parent.get_area_heuristic(false) : 0);
        }else{
            if(!this.parent){ //if this is root node
                return 0;
            }
            this.scoringBoundingBox = this.left.boundingBox.union_AABB(this.right.boundingBox);
            return this.scoringBoundingBox.area() - this.boundingBox.area() + this.parent.get_area_heuristic(false);
        }
    }

    get_all_nodes(arr){
        arr.push(this);

        if(!this.isLeaf){
            this.right.get_all_nodes(arr);
            this.left.get_all_nodes(arr);
        }
        return arr;
    }

    intersect_circle(pos, rad, found){ //return all things that intersect a circle around a point pos
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
            this.left.draw();
            this.right.draw();
        }
    }
}

class Tree{
    constructor(){
        this.things = [];
        this.root = null;

        this.allNodes = [];
    }

    reset(){
        this.things = [];
        this.root = null;
        this.allNodes = [];
    }

    update_allNodes(){
        this.allNodes = this.root.get_all_nodes([]);
    }

    get_best_partner_node_branchnbound_bfs(newNode){
        if(this.root.isLeaf){
            return this.root;
        }
        
        let queue = [this.root];
        let bestPartnerNode = null;
        let bestScore = MAX_AREA_SCORE;
            
        while(queue.length > 0){
            let thisNode = queue.shift();
            
            let parentNode = thisNode.parent;
            let thisNodeLrchild = thisNode.lrchild;
            let tempNode = new TreeNode(parentNode); //create temporary node
            tempNode.set_left_right(thisNode, newNode); //set left and right branches
            
            if(parentNode !== null){ //temporarily set parent node's left/right child
                if(thisNodeLrchild === 0){
                    parentNode.left = tempNode;
                }else{
                    parentNode.right = tempNode;
                }
            }
            
            let thisScore = tempNode.get_area_heuristic(true); //calculate heuristic starting from temp node towards root (don't calculate root)
            let inheritedScore = thisScore - tempNode.boundingBox.area() + newNode.boundingBox.area();

            if(thisScore < bestScore){
                bestScore = thisScore;
                bestPartnerNode = thisNode;
            }
            if(parentNode !== null){
                if(thisNodeLrchild === 0){
                    parentNode.left = thisNode;
                }else{
                    parentNode.right = thisNode;
                }
            }

            if(inheritedScore < bestScore){
                if(thisNode.left){
                    queue.push(thisNode.left);
                }
                if(thisNode.right){
                    queue.push(thisNode.right);
                }
            }
        }

        return bestPartnerNode;
    }

    recalculate_tree(currNode){
        if(currNode){
            currNode.update_bounding_box();
            currNode.update_depth();
            this.recalculate_tree(currNode.parent);
        }else{
            return;
        }
    }

    rebalance_tree(currNode){
        let currNodeLeft = currNode.left;
        let currNodeRight = currNode.right;
        if(currNodeLeft && currNodeRight){
            if(!currNodeLeft.isLeaf && !currNodeRight.isLeaf){
                let b = currNodeLeft.boundingBox;
                let c = currNodeRight.boundingBox;
                let d = currNodeLeft.left.boundingBox;
                let e = currNodeLeft.right.boundingBox;
                let f = currNodeRight.left.boundingBox;
                let g = currNodeRight.right.boundingBox;

                let fug = f.union_AABB(g).area(); 
                let due = d.union_AABB(e).area(); 

                let bug = b.union_AABB(g).area(); 
                let duc = d.union_AABB(c).area(); 
                let fub = f.union_AABB(b).area(); 
                let cue = c.union_AABB(e).area(); 

                if(bug > fug && fub > fug && duc > due && cue > due){
                    console.log("all sucks");
                    return;
                }
                let swapType = -1;              
                //bf swap - check bug and fug - 0
                if(bug < fug) swapType = 0;
                //ce swap - check due and duc - 1
                if(duc < due) swapType = 1;
                //bg swap - check fub and fug - 2
                if(fub < fug) swapType = 2;
                //cd swap - check due and cue - 3
                if(cue < due) swapType = 3;
                
                let nb = currNodeLeft;
                let nc = currNodeRight;
                let nd = currNodeLeft.left;
                let ne = currNodeLeft.right;
                let nf = currNodeRight.left;
                let ng = currNodeRight.right;

                console.log(swapType)
                switch(swapType){
                    case 0:
                        currNode.set_child_from_lr(0, nf)
                        nb.set_parent(nc);
                        nb.set_lrchild(0);
                        nc.set_child_from_lr(0, nb)
                        nf.set_parent(currNode);
                        nf.set_lrchild(0);
                        break;
                    case 1:
                        currNode.set_child_from_lr(1, ne)
                        nc.set_parent(nb);
                        nc.set_lrchild(1);
                        nb.set_child_from_lr(1, nc)
                        ne.set_parent(currNode);
                        ne.set_lrchild(1);
                        break;
                    case 2:
                        currNode.set_child_from_lr(0, ng)
                        nb.set_parent(nc);
                        nb.set_lrchild(1);
                        nc.set_child_from_lr(1, nb)
                        ng.set_parent(currNode);
                        ng.set_lrchild(0);
                        break;
                    case 3:
                        currNode.set_child_from_lr(1, nd)
                        nc.set_parent(nb);
                        nc.set_lrchild(0);
                        nb.set_child_from_lr(0, nc)
                        nd.set_parent(currNode);
                        nd.set_lrchild(1);
                        break;
                    
                    default:
                        return;
                }
            }
        }
    }
    

    insert(thing){
        this.things.push(thing);
        let newNode = new TreeNode(null, thing);

        if(!this.root){ //empty tree, create node
            this.root = newNode;
            // this.update_allNodes();
            return true;
        }
        
        //find best partner node
        let bestPartnerNode = this.get_best_partner_node_branchnbound_bfs(newNode);
        //insert beneath best parent with previous partner node
        let bestPartnerParentNode = bestPartnerNode.parent;
        let bestPartnerLR = bestPartnerNode.lrchild;
        let replacementNode = new TreeNode(bestPartnerParentNode);

        if(!bestPartnerParentNode){ //if parent is null, we must be making a new root node
            this.root = replacementNode;
        }else{ //otherwise we set parent's left/right child to this new node
            bestPartnerParentNode.set_child_from_lr(bestPartnerLR, replacementNode);
        }

        replacementNode.set_lrchild(bestPartnerLR); //also set the lrchild param
        replacementNode.set_left_right(bestPartnerNode, newNode, true); //and create the new branches

        //rebalance tree and ancestors
        this.recalculate_tree(replacementNode);
        // this.rebalance_tree(this.root);
        // this.update_allNodes();
    }

    remove(thing){

    }

    search_circle(pos, rad){ //search for things in a circle around a point pos
        return this.root ? this.root.intersect_circle(pos, rad, []) : [];
    }

    draw(){
        // this.things.forEach(t => t.draw());

        if(this.root) this.root.draw();
    }
}

class SimpleArray{
    constructor(){
        this.things = [];
    }

    reset(){
        this.things = [];
    }

    insert(thing){
        this.things.push(thing);
    }

    search_circle(pos, rad){
        let found = [];
        this.things.forEach(thing => {
            if(thing.intersect_circle(pos, rad)){
                found.push(thing);
            }
        });
        return found;
    }

    draw(){}
}