class AABB{
    constructor(x = 0, y = 0, w = 100, h = 100){
        this.pos = to_2d_vector([x, y]);
        this.dims = to_2d_vector([w, h]);
        this.cornerMin = this.pos.copy().sub(this.dims.copy().div(2)); //TL
        this.cornerMax = this.cornerMin.copy().add(this.dims); //BR
    }

    update_pos(new_pos){
        this.pos.set(new_pos);
        this.cornerMin.set(new_pos.copy().sub(this.dims.copy().div(2))); //TL
        this.cornerMax.set(this.cornerMin.copy().add(this.dims)); //BR
    }

    update_dims(new_dims){
        this.dims.set(new_dims);
    }

    intersects_AABB(other){
        return intersect_rect_rect(this.pos, this.dims, other.pos, other.dims);
    }

    intersects_circle(pos, rad){
        return intersect_circle_rect(pos, rad, this.pos, this.dims);
    }

    union_AABB(other){   
        let new_cornerMin = min_vec(this.cornerMin, other.cornerMin);
        let new_cornerMax = max_vec(this.cornerMax, other.cornerMax);
        let new_dims = new_cornerMax.copy().sub(new_cornerMin);
        let new_pos = new_cornerMax.copy().sub(new_dims.copy().div(2));

        return new AABB(new_pos.x, new_pos.y, new_dims.x, new_dims.y);
    }

    area(){
        return this.dims.x * this.dims.y;
    }

    max_dims(){
        return max(this.dims.x, this.dims.y);
    }

    draw(){
        stroke(255, 0, 0);
        noFill();
        draw_rect_center_vec(this.pos, this.dims);
    }
}

function min_vec(a, b){
    return createVector(min(a.x, b.x), min(a.y, b.y));
}

function max_vec(a, b){
    return createVector(max(a.x, b.x), max(a.y, b.y));
}