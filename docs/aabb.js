class AABB{
    constructor(x = 0, y = 0, w = 100, h = 100){
        this.pos = to_2d_vector([x, y]);
        this.dims = to_2d_vector([w, h]);
        this.corner_min = this.pos.copy().sub(this.dims.copy().div(2)); //TL
        this.corner_max = this.corner_min.copy().add(this.dims); //BR
    }

    update_pos(new_pos){
        this.pos.set(new_pos);
        this.corner_min.set(new_pos.copy().sub(this.dims.copy().div(2))); //TL
        this.corner_max.set(this.corner_min.copy().add(this.dims)); //BR
    }

    update_dims(new_dims){
        this.dims.set(new_dims);
    }

    intersects_AABB(other){
        return intersect_rect_rect(this.pos, this.dims, other.pos, other.dims);
    }

    union_AABB(other){   
        let new_corner_min = min_vec(this.corner_min, other.corner_min);
        let new_corner_max = max_vec(this.corner_max, other.corner_max);
        let new_dims = new_corner_max.copy().sub(new_corner_min);
        let new_pos = new_corner_max.copy().sub(new_dims.copy().div(2));

        return new AABB(new_pos.x, new_pos.y, new_dims.x, new_dims.y);
    }

    area(){
        return this.dims.x * this.dims.y;
    }

    draw(){
        stroke(255, 0, 0);
        noFill();
        rect_center_vec(this.pos, this.dims);
    }
}

function min_vec(a, b){
    return createVector(min(a.x, b.x), min(a.y, b.y));
}

function max_vec(a, b){
    return createVector(max(a.x, b.x), max(a.y, b.y));
}