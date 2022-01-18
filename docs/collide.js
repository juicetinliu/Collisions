class ThingCollider{
    constructor(){}

    check_collision(a, b){
        if(a.collisionType === CollisionType.NONE || b.collisionType === CollisionType.NONE) return false;
        
        return a.intersects(b);
    }

    collide(a, b, intersection){
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

    circle_circle(a, b){
        // stroke(255,0,0);
        // line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        
        // STATICS
        let aStatic = (a.collisionType === CollisionType.STATIC);
        let bStatic = (b.collisionType === CollisionType.STATIC);
        
        if(aStatic && bStatic) return; //both static -> don't collide
        
        let prePosDiff = a.pos.copy().sub(b.pos);
        
        if(!(aStatic || bStatic)){ //neither are static
            if(prePosDiff.magSq() < 1e-6){ //add random noise if objects spawn exactly on each other
                let newShiftPos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }else if(aStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }else if(bStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = a.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                a.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }
        prePosDiff = a.pos.copy().sub(b.pos);
        let overlap = prePosDiff.setMag(prePosDiff.mag() - a.rad - b.rad);

        if(!(aStatic || bStatic)){
            overlap.mult(0.5);
        }

        if(!aStatic){
            let aNewPos = a.pos.copy().sub(overlap);
            a.set_pos([aNewPos.x, aNewPos.y]);
        }
        if(!bStatic){
            let bNewPos = b.pos.copy().add(overlap);
            b.set_pos([bNewPos.x, bNewPos.y]);            
        }

        //momentum and velocity calculations
        let massTotal = a.mass + b.mass;
        let massDiff = a.mass - b.mass;

        let normal = b.pos.copy().sub(a.pos).normalize();
        let tangent = createVector(-normal.y, normal.x);
        
        let aDotNormal = a.vel.copy().dot(normal);
        let bDotNormal = b.vel.copy().dot(normal);

        let aMomentum;
        let bMomentum;

        if(!(aStatic || bStatic)){ //Neither are static
            aMomentum = (aDotNormal * massDiff + 2 * b.mass * bDotNormal) / (massTotal);
            bMomentum = (bDotNormal * -massDiff + 2 * a.mass * aDotNormal) / (massTotal);
        }else if(aStatic){ //Treat a.mass as infinite: massTotal = a.mass, massDiff = a.mass, cancel terms
            aMomentum = aDotNormal;
            bMomentum = -bDotNormal + 2 * aDotNormal;
        }else if(bStatic){ //Treat b.mass as infinite: massTotal = b.mass, massDiff = -b.mass, cancel terms
            aMomentum = -aDotNormal + 2 * bDotNormal;
            bMomentum = bDotNormal;
        }
        
        let aNewVel = tangent.copy().mult(a.vel.dot(tangent)).add(normal.copy().mult(aMomentum));
        let bNewVel = tangent.copy().mult(b.vel.dot(tangent)).add(normal.copy().mult(bMomentum));

        if(!aStatic){
            a.set_vel([aNewVel.x, aNewVel.y]);
        }
        if(!bStatic){
            b.set_vel([bNewVel.x, bNewVel.y]);
        }
    }

    circle_line(circle, b, intersection){
        //Intersection point between circle and line is closest point on line OR line endpoints (if circle resides on endpoints)
        //Assumes lines are always STATIC for now

        //If circle is static then don't collide
        if(circle.collisionType === CollisionType.STATIC) return;

        // fill(255,0,0);
        // draw_ellipse_vec(intersection, 5)

        // console.log(intersection.x, intersection.y);
        // console.log(b.posA.x, b.posA.y);
        // console.log(b.posB.x, b.posB.y);

        let newPos = intersection.copy().add(circle.pos.copy().sub(intersection).setMag(circle.rad));
        circle.set_pos([newPos.x, newPos.y]);
        
        let normal = circle.pos.copy().sub(intersection.copy()).normalize();
        let newVel = circle.vel.copy().sub(normal.copy().mult(2 * circle.vel.copy().dot(normal)));
        
        //BUG_1: MULTIPLE REFLECTIONS CAN OCCUR BETWEEN A CIRCLE AND TWO LINES 
        // stroke(255);
        // draw_line_vec(intersection, intersection.copy().add(normal.copy().setMag(50)));

        // draw_line_vec(circle.pos, newVel.copy().setMag(100).add(circle.pos));
        
        //reflect circle velocity
        circle.set_vel([newVel.x, newVel.y]);
    }

    collide_group(group = new CollidedThingGroup()){
        //Currently only contains groups with thing = circle and otherthings = lines;
        
        let circle = group.thing; //circle
        if(circle.collisionType === CollisionType.STATIC) return false;
        
        let intersections = object_list_remove_duplicates(group.intersections);

        let avgIntersections = intersections.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(intersections.length);
        // let newPos = avgIntersections.copy().add(circle.pos.copy().sub(avgIntersections).setMag(circle.rad));

        let pushBacks = intersections.map(i => i.copy().add(circle.pos.copy().sub(i).setMag(circle.rad)));
        let newPos = pushBacks.reduce((a, b) => a.copy().add(b)).div(intersections.length);

        circle.set_pos([newPos.x, newPos.y]);
        
        // pushBacks.forEach(p => {
            // fill(0,255,255);
            // draw_ellipse_vec(avgIntersections, 10);
        // });
        

        // if(circle.vel.magSq() > 0){
        //     let usefulIntersections = intersections.filter(i => {
        //         return i.copy().dot((circle.vel)) !== 0;
        //     });
        //     avgIntersections = usefulIntersections.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(usefulIntersections.length);
        // }
        
        let normal = circle.pos.copy().sub(avgIntersections.copy()).normalize();
        let newVel = circle.vel.copy().sub(normal.copy().mult(2 * circle.vel.copy().dot(normal)));
        
        //reflect circle velocity
        circle.set_vel([newVel.x, newVel.y]);

        return true;
    }

    circle_line_group(circle, lineGroup){

    }
}