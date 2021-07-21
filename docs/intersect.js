let EPSILON = 1e-6;

function intersect_point_point(p1_pos, p2_pos){
    return p1_pos.equals(p2_pos);
}

function intersect_point_circle(p_pos, c_pos, c_rad, inclusive = true){
    if(inclusive){
        return p_pos.copy().sub(c_pos).magSq() <= c_rad * c_rad;
    }else{
        return p_pos.copy().sub(c_pos).magSq() < c_rad * c_rad;
    }
}

function intersect_point_rect(p_pos, r_pos, r_w, r_h, inclusive = true){
    if(inclusive){
        return p_pos.x <= r_pos.x + r_w/2 && p_pos.x >= r_pos.x - r_w/2 && p_pos.y <= r_pos.y + r_h/2 && p_pos.y >= r_pos.y - r_h/2;
    }else{
        return p_pos.x < r_pos.x + r_w/2 && p_pos.x > r_pos.x - r_w/2 && p_pos.y < r_pos.y + r_h/2 && p_pos.y > r_pos.y - r_h/2;
    }
}

function intersect_circle_circle(c1_pos, c1_rad, c2_pos, c2_rad){
    let rad_sum =  c1_rad + c2_rad;
    return c1_pos.copy().sub(c2_pos).magSq() <= rad_sum * rad_sum;
}

function intersect_circle_rect(c_pos, c_rad, r_pos, r_w, r_h){
    let c_x = c_pos.x;
    let c_y = c_pos.y;
    let r_x = r_pos.x;
    let r_y = r_pos.y;
    let temp_X = c_x;
    let temp_Y = c_y;

    if(c_x < r_x - r_w/2){
        temp_X = r_x - r_w/2;
    }else if(c_x > r_x + r_w/2){
        temp_X = r_x + r_w/2;
    }
    if(c_y < r_y - r_h/2){
        temp_Y = r_y - r_h/2;
    }else if(c_y > r_y + r_h/2){
        temp_Y = r_y + r_h/2;
    }

    let temp = createVector(temp_X, temp_Y);
    return intersect_point_circle(temp, c_pos, c_rad);
}

function intersect_rect_rect(r1_pos, r1_w, r1_h, r2_pos, r2_w, r2_h){
    let r1_x = r1_pos.x - r1_w/2;
    let r1_y = r1_pos.y - r1_h/2;
    let r2_x = r2_pos.x - r2_w/2;
    let r2_y = r2_pos.y - r2_h/2;

    return r1_x + r1_w >= r2_x && r1_x <= r2_x + r2_w && r1_y + r1_h >= r2_y && r1_y <= r2_y + r2_h;
}

function intersect_point_line(p_pos, l_posa, l_posb, return_point = false){
    let p_la = p_pos.copy().sub(l_posa);
    let b_a = l_posb.copy().sub(l_posa);

    let within = l_posa.x != l_posb.x ? is_between(l_posa.x, p_pos.x, l_posb.x) : is_between(l_posa.y, p_pos.y, l_posb.y);

    if(p_la.cross(b_a).magSq() < EPSILON && within){
        if(return_point){
            return p_pos;
        }
        return true;
    }
    return false;
}

function is_between(a, x, b){ 
    return (a <= x && x <= b) || (b <= x && x <= a);
}

function intersect_circle_line(c_pos, c_rad, l_posa, l_posb, return_point = false){
    if(intersect_point_circle(l_posa, c_pos, c_rad, false) && intersect_point_circle(l_posb, c_pos, c_rad, false)){
        if(return_point){
            if(c_pos.copy().sub(l_posa).magSq() > c_pos.copy().sub(l_posb).magSq()){
                return l_posb;
            }else{
                return l_posa;
            }
        }
        return true;
    }

    let c_la = c_pos.copy().sub(l_posa);
    let b_a = l_posb.copy().sub(l_posa);

    let closest = l_posa.copy().add(l_posb.copy().sub(l_posa).mult(c_la.dot(b_a)/b_a.copy().magSq(l_posb)));
    
    let within = l_posa.x != l_posb.x ? is_between(l_posa.x, closest.x, l_posb.x) : is_between(l_posa.y, closest.y, l_posb.y);

    if(within){
        if(intersect_point_circle(closest, c_pos, c_rad)){
            if(return_point){
                return closest;
            }
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

function intersect_line_line(l1_posa, l1_posb, l2_posa, l2_posb, return_points = false){
    let intersections = [intersect_point_line(l1_posa, l2_posa, l2_posb, return_points), intersect_point_line(l1_posb, l2_posa, l2_posb, return_points), intersect_point_line(l2_posa, l1_posa, l1_posb, return_points), intersect_point_line(l2_posb, l1_posa, l1_posb, return_points)];
    if(intersections.reduce((a, b) => a || b, false)){
        if(return_points){
            return intersections.filter(i => i !== false);
        }
        return true;
    }
    let l1_ax = l1_posa.x;
    let l1_bx = l1_posb.x;
    let l2_ax = l2_posa.x;
    let l2_bx = l2_posb.x;
    let l1_ay = l1_posa.y;
    let l1_by = l1_posb.y;
    let l2_ay = l2_posa.y;
    let l2_by = l2_posb.y;

    let ua = ((l2_bx - l2_ax) * (l1_ay - l2_ay) - (l2_by - l2_ay) * (l1_ax - l2_ax)) / ((l2_by - l2_ay) * (l1_bx - l1_ax) - (l2_bx - l2_ax) * (l1_by - l1_ay));
    let ub = ((l1_bx - l1_ax) * (l1_ay - l2_ay) - (l1_by - l1_ay) * (l1_ax - l2_ax)) / ((l2_by - l2_ay) * (l1_bx - l1_ax) - (l2_bx - l2_ax) * (l1_by - l1_ay));

    if(ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        if(return_points){
            let intersection_x = l1_ax + (ua * (l1_bx - l1_ax));
            let intersection_y = l1_ay + (ua * (l1_by - l1_ay));
            return [createVector(intersection_x, intersection_y)];
        }
        return true;
    }
    return return_points ? [false] : false;
}

function intersect_rect_line(r_pos, r_w, r_h, l_posa, l_posb, return_points = true){
    if(intersect_point_rect(l_posa, r_pos, r_w, r_h, false) && intersect_point_rect(l_posb, r_pos, r_w, r_h, false)){
        return true;
    }

    let half_w = r_w / 2;
    let half_h = r_h / 2;
    
    let r_1 = r_pos.copy().add(-half_w, -half_h);
    let r_2 = r_pos.copy().add(half_w, -half_h);
    let r_3 = r_pos.copy().add(half_w, half_h);
    let r_4 = r_pos.copy().add(-half_w, half_h);

    let lines = [[r_1, r_2], [r_2, r_3], [r_3, r_4], [r_4, r_1]];

    let intersections = lines.reduce((a, b) => a.concat(intersect_line_line(...b, l_posa, l_posb, return_points)), []);

    console.log();

    if(intersections.reduce((a, b) => a || b, false)){
        if(return_points){
            return vector_list_remove_duplicates(intersections.filter(i => i !== false));
        }
        return true;
    }
    return;
}

function vector_list_remove_duplicates(l){
    let out = [];
    l.forEach(v => {
        if(!object_list_contains(out, v)){
            out.push(v);
        }
    });
    return out;
}

function object_list_contains(l, o){
    return l.reduce((a, b) => a || b.equals(o), false);
}