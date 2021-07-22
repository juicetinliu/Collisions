class AABB{
    constructor(x = 0, y = 0, w = 100, h = 100){
        this.pos = to_2d_vector([x, y]);
        this.dims = to_2d_vector([w, h]);
        this.corner_a = this.pos.copy().sub(this.dims.copy().div(2)); //TL
        this.corner_b = this.corner_a.copy().add(this.dims); //BR
    }

    update_pos(new_pos){
        this.pos.set(new_pos);
        this.corner_a.set(new_pos.copy().sub(this.dims.copy().div(2))); //TL
        this.corner_b.set(this.corner_a.copy().add(this.dims)); //BR
    }

    update_dims(new_dims){
        this.dims.set(new_dims);
    }

    intersects_AABB(other){
        return intersect_rect_rect(this.pos, this.dims, other.pos, other.dims);
    }

    union_AABB(other){   
        // return new AABB
    }

    draw(){
        stroke(255, 0, 0);
        noFill();
        rect_center_vec(this.pos, this.dims);
    }
}
