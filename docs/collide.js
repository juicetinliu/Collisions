class ThingCollider{
    constructor(){}

    collide(a, b){
        if(a.collisionType === CollisionType.NONE || b.collisionType === CollisionType.NONE) return;

        let intersection = a.intersects(b);

        if(intersection){
            switch(a.thingType){

                case ThingType.CIRCLE:
                    switch(b.thingType){

                        case ThingType.CIRCLE:
                            this.circle_circle(a, b);
                            return;
            
                        case ThingType.LINE:
                            this.circle_line(a, b, intersection);
                            return;
                    
                        default:
                            return;
                    }

                case ThingType.LINE:
                    switch(b.thingType){
            
                        case ThingType.CIRCLE:
                            this.circle_line(b, a, intersection);
                            return;
                    
                        default:
                            return;
                    }

                default:
                    return;
            }
        }
    }

    circle_circle(a, b){
        // stroke(255,0,0);
        // line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        // STATICS
        let a_static = (a.collisionType === CollisionType.STATIC);
        let b_static = (b.collisionType === CollisionType.STATIC);
        
        if(a_static && b_static) return; //both static
        let pre_pos_diff = a.pos.copy().sub(b.pos);

        if(!(a_static || b_static)){ //neither are static
            if(pre_pos_diff.magSq() < 1e-6){ //add random noise if objects spawn exactly on each other
                let new_shift_pos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.setPos([new_shift_pos.x, new_shift_pos.y]);
                console.log("shifting");
            }
        }else if(a_static){
            if(pre_pos_diff.magSq() < 1e-6){
                let new_shift_pos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.setPos([new_shift_pos.x, new_shift_pos.y]);
                console.log("shifting");
            }
        }else if(b_static){
            if(pre_pos_diff.magSq() < 1e-6){
                let new_shift_pos = a.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                a.setPos([new_shift_pos.x, new_shift_pos.y]);
                console.log("shifting");
            }
        }
        pre_pos_diff = a.pos.copy().sub(b.pos);
        let overlap = pre_pos_diff.setMag(pre_pos_diff.mag() - a.rad - b.rad);
        
        if(!(a_static || b_static)){
            overlap = overlap.mult(0.5);
        }

        if(!a_static){
            let a_new_pos = a.pos.copy().sub(overlap);
            a.setPos([a_new_pos.x, a_new_pos.y]);
        }
        if(!b_static){
            let b_new_pos = b.pos.copy().add(overlap);
            b.setPos([b_new_pos.x, b_new_pos.y]);            
        }

        //momentum and velocity calculations
        let mass_total = a.mass + b.mass;
        let mass_diff = a.mass - b.mass;

        let normal = b.pos.copy().sub(a.pos).normalize();
        let tangent = createVector(-normal.y, normal.x);
        
        let a_dot_normal = a.vel.copy().dot(normal);
        let b_dot_normal = b.vel.copy().dot(normal);

        let a_momentum = (a_dot_normal * mass_diff + 2 * b.mass * b_dot_normal) / (mass_total);
        let b_momentum = (b_dot_normal * -mass_diff + 2 * a.mass * a_dot_normal) / (mass_total);
        
        let a_new_vel = tangent.copy().mult(a.vel.copy().dot(tangent)).add(normal.copy().mult(a_momentum));
        let b_new_vel = tangent.copy().mult(b.vel.copy().dot(tangent)).add(normal.copy().mult(b_momentum));

        a.setVel([a_new_vel.x, a_new_vel.y]);
        b.setVel([b_new_vel.x, b_new_vel.y]);
    }

    circle_line(a, b, intersection){
        let new_pos = intersection.copy().add(a.pos.copy().sub(intersection).setMag(a.rad));
        a.setPos([new_pos.x, new_pos.y]);

        let line_dir = b.posB.copy().sub(b.posA);
        let normal = createVector(-line_dir.y, line_dir.x).normalize();
        let new_vel = a.vel.copy().sub(normal.mult(2 * a.vel.copy().dot(normal)));

        a.setVel([new_vel.x, new_vel.y]);
    }
}